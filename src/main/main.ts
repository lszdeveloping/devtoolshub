import { app, BrowserWindow, ipcMain, shell, Menu, Tray, nativeImage, session } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { spawn, exec, execSync } from 'child_process'
import { promisify } from 'util'
import { TOOLS as tools } from '../shared/tools-data'
import type { InstallProgress, InstallResult, ToolState } from '../shared/types'

const execAsync = promisify(exec)
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const isDev = !!DEV_SERVER_URL

if (process.platform !== 'win32') {
  console.error('DevTools Hub supports Windows only.')
  app.exit(1)
}

// Resolve installer script path on disk. In dev: project root. In prod: asar.unpacked.
function resolveInstaller(relPath: string): string | null {
  const normalized = relPath.replace(/\\/g, '/').replace(/^\/+/, '')
  const candidates: string[] = []

  const resourcesPath = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath
  if (resourcesPath) {
    candidates.push(
      path.join(resourcesPath, 'app.asar.unpacked', normalized),
      path.join(resourcesPath, normalized),
      path.join(resourcesPath, 'app', normalized),
    )
  }
  candidates.push(
    path.resolve(__dirname, '../../', normalized),
    path.resolve(process.cwd(), normalized),
  )

  return candidates.find(p => fs.existsSync(p)) ?? null
}

// Cached environment: enumerates real versioned dirs (PostgreSQL\17, MongoDB\Server\8.0, …)
// instead of hardcoding versions. Also merges registry PATH so Electron sees fresh installs
// without restart. Locale-independent via env vars.
let cachedEnv: NodeJS.ProcessEnv | null = null

function globVersionedDirs(parent: string, subdir: string): string[] {
  try {
    if (!fs.existsSync(parent)) return []
    return fs.readdirSync(parent)
      .map(name => path.join(parent, name, subdir))
      .filter(p => fs.existsSync(p))
  } catch { return [] }
}

function buildEnv(): NodeJS.ProcessEnv {
  if (cachedEnv) return cachedEnv

  const pf      = process.env.ProgramFiles      ?? 'C:\\Program Files'
  const pf86    = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)'
  const local   = process.env.LOCALAPPDATA      ?? `${process.env.USERPROFILE}\\AppData\\Local`
  const appdata = process.env.APPDATA           ?? `${process.env.USERPROFILE}\\AppData\\Roaming`
  const user    = process.env.USERPROFILE       ?? ''
  const sysroot = process.env.SystemRoot        ?? 'C:\\Windows'

  const commonPaths: string[] = [
    `${pf}\\Git\\cmd`,
    `${pf}\\Git\\bin`,
    `${pf}\\GitHub CLI`,
    `${pf}\\nodejs`,
    `${pf86}\\nodejs`,
    `${appdata}\\npm`,
    `${user}\\.cargo\\bin`,
    `${user}\\.bun\\bin`,
    `${user}\\.deno\\bin`,
    `${local}\\rtk\\bin`,
    `${pf}\\Docker\\Docker\\resources\\bin`,
    `${pf}\\Redis`,
    `${pf}\\Microsoft VS Code\\bin`,
    `${pf}\\Go\\bin`,
    'C:\\Go\\bin',
    'C:\\PHP',
    'C:\\php',
    `${sysroot}\\System32`,
    ...globVersionedDirs(`${pf}\\PostgreSQL`, 'bin'),
    ...globVersionedDirs(`${pf}\\MongoDB\\Server`, 'bin'),
    ...globVersionedDirs(`${pf}\\MySQL`, 'bin'),
    ...globVersionedDirs(`${pf86}\\Microsoft SQL Server\\Client SDK\\ODBC`, 'Tools\\Binn'),
    ...globVersionedDirs(`${pf}\\Microsoft SQL Server\\Client SDK\\ODBC`, 'Tools\\Binn'),
    ...globVersionedDirs('C:\\wamp64\\bin\\php', ''),
    ...globVersionedDirs('C:\\wamp64\\bin\\mysql', 'bin'),
    ...globVersionedDirs('C:\\wamp64\\bin\\mariadb', 'bin'),
    ...globVersionedDirs('C:\\wamp64\\bin\\apache', 'bin'),
    ...(process.env.Path ?? '').split(';'),
    ...(process.env.PATH ?? '').split(';'),
  ]

  try {
    const sysPATH = execSync(
      'powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable(\'Path\',\'Machine\')"',
      { timeout: 3000, encoding: 'utf8' }
    ).trim()
    const userPATH = execSync(
      'powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable(\'Path\',\'User\')"',
      { timeout: 3000, encoding: 'utf8' }
    ).trim()
    commonPaths.push(...sysPATH.split(';'), ...userPATH.split(';'))
  } catch { /* ignore */ }

  const dedupedPath = [...new Set(commonPaths.filter(Boolean))].join(';')
  cachedEnv = { ...process.env, PATH: dedupedPath, Path: dedupedPath }
  return cachedEnv
}

function parseVersion(raw: string): string {
  const text = raw.trim().split('\n')[0].trim()
  const match = text.match(/(\d+\.\d+[\.\d]*)/)
  return match ? match[1] : text.slice(0, 40)
}

async function runDetect(cmd: string, env: NodeJS.ProcessEnv): Promise<string | null> {
  try {
    const { stdout, stderr } = await execAsync(cmd, {
      timeout: 8000,
      shell: 'cmd.exe',
      env,
      windowsHide: true,
      encoding: 'utf8',
    } as Parameters<typeof execAsync>[1])
    const out = (String(stdout || '') || String(stderr || '')).trim()
    return out || null
  } catch {
    return null
  }
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
})

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js')

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  if (isDev && DEV_SERVER_URL) {
    mainWindow.loadURL(DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    const rendererPath = path.join(__dirname, '../renderer/index.html')
    console.log('[main] Loading renderer from:', rendererPath)
    mainWindow.loadFile(rendererPath).catch(err => {
      console.error('[main] Failed to load renderer:', err)
    })
  }

  mainWindow.on('closed', () => { mainWindow = null })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Block in-window navigation to external URLs; route them to the OS browser instead.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isDevUrl = !!(DEV_SERVER_URL && url.startsWith(DEV_SERVER_URL))
    if (!isDevUrl && !url.startsWith('file://')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error('[renderer] Failed to load:', code, desc)
  })

  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.error('[renderer] Process gone:', JSON.stringify(details))
  })

  mainWindow.webContents.on('console-message', (_e, level, msg, line, src) => {
    if (level >= 2) console.error(`[renderer:${level}] ${msg} (${src}:${line})`)
  })
}

function resolveTrayIconPath(): string | null {
  const resourcesPath = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath
  const candidates = [
    path.join(__dirname, '../../resources/icon.png'),
    resourcesPath ? path.join(resourcesPath, 'resources/icon.png') : '',
    resourcesPath ? path.join(resourcesPath, 'app.asar.unpacked/resources/icon.png') : '',
  ].filter(Boolean)
  return candidates.find(p => fs.existsSync(p)) ?? null
}

function createTray() {
  try {
    const iconPath = resolveTrayIconPath()
    if (!iconPath) {
      console.warn('[tray] Icon not found, skipping tray creation')
      return
    }
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    tray = new Tray(icon)
    const menu = Menu.buildFromTemplate([
      { label: 'Open DevTools Hub', click: () => mainWindow?.show() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ])
    tray.setToolTip('DevTools Hub')
    tray.setContextMenu(menu)
    tray.on('double-click', () => mainWindow?.show())
  } catch (err) {
    console.warn('[tray] Failed to create tray:', err)
  }
}

function setupCsp() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:5173 ws://localhost:5173"
            : "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; script-src 'self'",
        ],
      },
    })
  })
}

app.whenReady().then(() => {
  setupCsp()
  createWindow()
  createTray()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch(err => {
  console.error('[app] whenReady failed:', err)
})

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())

ipcMain.handle('tools:list', () => tools)

ipcMain.handle('tools:detect', async (): Promise<ToolState[]> => {
  const env = buildEnv()
  const results = await Promise.all(
    tools.map(async (tool): Promise<ToolState> => {
      const raw = await runDetect(tool.verifyCommand, env)
      return raw
        ? { id: tool.id, status: 'installed', installedVersion: parseVersion(raw) }
        : { id: tool.id, status: 'not-installed' }
    })
  )
  return results
})

function getLogDir(): string {
  const dir = path.join(app.getPath('userData'), 'logs')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

function createLogFile(toolId: string): { logPath: string; write: (line: string) => void; close: () => void } {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const logPath = path.join(getLogDir(), `install-${toolId}-${ts}.log`)
  const stream = fs.createWriteStream(logPath, { flags: 'a', encoding: 'utf8' })
  const write = (line: string) => stream.write(`${new Date().toISOString()} ${line}\n`)
  const close = () => stream.end()
  return { logPath, write, close }
}

ipcMain.handle('tools:install', async (_event, toolId: string): Promise<InstallResult> => {
  const tool = tools.find(t => t.id === toolId)
  if (!tool) return { toolId, success: false, error: 'Tool not found' }

  const scriptPath = resolveInstaller(tool.installer)
  if (!scriptPath) {
    return { toolId, success: false, error: `Installer script not found on disk: ${tool.installer}` }
  }

  const log = createLogFile(toolId)
  log.write(`[START] tool=${toolId}`)
  log.write(`[SCRIPT] ${scriptPath}`)

  // Tee file: Start-Process is detached (UAC elevation breaks stdout pipe to parent), so the
  // wrapper writes a sibling .out file we tail from the main process for progress updates.
  const teePath = path.join(os.tmpdir(), `devtoolshub-tee-${toolId}-${Date.now()}.txt`)
  fs.writeFileSync(teePath, '', 'utf8')

  return new Promise((resolve) => {
    const sendProgress = (progress: number, message: string) => {
      const update: InstallProgress = { toolId, progress, status: 'installing', message }
      mainWindow?.webContents.send('tools:progress', update)
    }

    sendProgress(10, `Preparing to install ${tool.name}...`)

    // Wrapper redirects the elevated script's stdout+stderr into teePath so we can stream it.
    const escapedScript = scriptPath.replace(/'/g, "''")
    const escapedTee    = teePath.replace(/'/g, "''")
    const wrapper = `Start-Process powershell.exe -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','${escapedScript}' -Verb RunAs -Wait -RedirectStandardOutput '${escapedTee}' -RedirectStandardError '${escapedTee}'`

    const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', wrapper], {
      env: process.env,
      windowsHide: true,
    })

    let lastSize = 0
    let progressVal = 20
    const tail = setInterval(() => {
      try {
        const stat = fs.statSync(teePath)
        if (stat.size > lastSize) {
          const fd = fs.openSync(teePath, 'r')
          const buf = Buffer.alloc(stat.size - lastSize)
          fs.readSync(fd, buf, 0, buf.length, lastSize)
          fs.closeSync(fd)
          lastSize = stat.size
          const chunk = buf.toString('utf8')
          for (const line of chunk.split(/\r?\n/)) {
            const trimmed = line.trim()
            if (!trimmed) continue
            log.write(`[OUT] ${trimmed}`)
            progressVal = Math.min(progressVal + 5, 90)
            sendProgress(progressVal, trimmed.slice(0, 120))
          }
        }
      } catch { /* file may briefly disappear */ }
    }, 500)

    const cleanup = () => {
      clearInterval(tail)
      fs.unlink(teePath, () => {})
    }

    child.on('close', (code) => {
      log.write(`[EXIT] code=${code}`)
      log.close()
      cleanup()
      if (code === 0) {
        sendProgress(100, `${tool.name} installed successfully`)
        resolve({ toolId, success: true, logPath: log.logPath })
      } else {
        resolve({ toolId, success: false, error: `Exit code ${code}`, logPath: log.logPath })
      }
    })

    child.on('error', (err) => {
      log.write(`[SPAWN_ERROR] ${err.message}`)
      log.close()
      cleanup()
      resolve({ toolId, success: false, error: err.message, logPath: log.logPath })
    })
  })
})

ipcMain.handle('tools:uninstall', async (_event, toolId: string): Promise<InstallResult> => {
  const tool = tools.find(t => t.id === toolId)
  if (!tool) return { toolId, success: false, error: 'Tool not found' }
  if (!tool.wingetId) return { toolId, success: false, error: `No winget ID defined for ${tool.name}` }

  // winget needs elevation for perMachine packages. Run via UAC and wait.
  const escapedId = tool.wingetId.replace(/'/g, "''")
  const cmd = `Start-Process winget -ArgumentList 'uninstall','--id','${escapedId}','--silent','--accept-source-agreements' -Verb RunAs -Wait -PassThru | Select-Object -ExpandProperty ExitCode`
  try {
    const { stdout } = await execAsync(
      `powershell -NoProfile -ExecutionPolicy Bypass -Command "${cmd.replace(/"/g, '\\"')}"`,
      { timeout: 120000, windowsHide: true } as Parameters<typeof execAsync>[1]
    )
    const code = parseInt(String(stdout).trim(), 10)
    if (code === 0) return { toolId, success: true }
    return { toolId, success: false, error: `winget exit ${code}` }
  } catch (e: unknown) {
    return { toolId, success: false, error: (e as Error).message }
  }
})

ipcMain.on('app:openUrl', (_event, url: string) => shell.openExternal(url))
ipcMain.on('app:openPath', (_event, filePath: string) => shell.openPath(filePath))

ipcMain.handle('logs:list', async (): Promise<{ name: string; path: string }[]> => {
  try {
    const dir = getLogDir()
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.log'))
      .sort().reverse()
      .slice(0, 50)
      .map(name => ({ name, path: path.join(dir, name) }))
  } catch { return [] }
})

ipcMain.handle('config:export', async (_event, toolIds: string[]): Promise<string> => {
  const config = { version: app.getVersion(), exportedAt: new Date().toISOString(), tools: toolIds }
  return JSON.stringify(config, null, 2)
})

ipcMain.handle('app:version', () => app.getVersion())

const RTK_AGENT_COMMANDS: Record<string, string> = {
  claude:      'rtk init -g',
  codex:       'rtk init -g --codex',
  gemini:      'rtk init -g --gemini',
  cursor:      'rtk init --agent cursor',
  windsurf:    'rtk init --agent windsurf',
  cline:       'rtk init --agent cline',
  kilocode:    'rtk init --agent kilocode',
  antigravity: 'rtk init --agent antigravity',
  opencode:    'rtk init -g --opencode',
}

ipcMain.handle('rtk:configure', async (_event, agents: string[]): Promise<{
  success: boolean
  results: { agent: string; success: boolean; error?: string }[]
}> => {
  const env = buildEnv()
  const results: { agent: string; success: boolean; error?: string }[] = []

  for (const agent of agents) {
    const cmd = RTK_AGENT_COMMANDS[agent]
    if (!cmd) continue
    try {
      await execAsync(cmd, {
        timeout: 30000,
        env,
        shell: 'cmd.exe',
        windowsHide: true,
      } as Parameters<typeof execAsync>[1])
      results.push({ agent, success: true })
    } catch (e: unknown) {
      results.push({ agent, success: false, error: (e as Error).message })
    }
  }

  return { success: results.every(r => r.success), results }
})
