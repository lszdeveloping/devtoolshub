import { app, BrowserWindow, ipcMain, shell, Menu, Tray, nativeImage } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as https from 'https'
import * as os from 'os'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import { TOOLS as tools } from '../shared/tools-data'
import type { InstallProgress, InstallResult, Platform, ToolState } from '../shared/types'

const execAsync = promisify(exec)
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/lszdeveloping/devtoolshub/main'

function downloadScript(scriptPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `${GITHUB_RAW_BASE}/${scriptPath.replace(/\\/g, '/')}`
    const ext = path.extname(scriptPath)
    const tmpFile = path.join(os.tmpdir(), `devtoolshub-${Date.now()}${ext}`)

    const file = fs.createWriteStream(tmpFile)
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.destroy()
        fs.unlink(tmpFile, () => {})
        reject(new Error(`Failed to download script (HTTP ${res.statusCode}): ${url}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve(tmpFile)))
    }).on('error', (err) => {
      file.destroy()
      fs.unlink(tmpFile, () => {})
      reject(err)
    })
  })
}
const isDev = !!DEV_SERVER_URL

// Build enriched PATH for Windows — includes common install dirs not always in subprocess env
function buildEnv(): NodeJS.ProcessEnv {
  if (process.platform !== 'win32') return process.env

  const commonPaths = [
    'C:\\Program Files\\Git\\cmd',
    'C:\\Program Files\\Git\\bin',
    'C:\\Program Files\\GitHub CLI',
    'C:\\Program Files\\nodejs',
    'C:\\Program Files (x86)\\nodejs',
    `${process.env.APPDATA}\\npm`,
    `${process.env.USERPROFILE}\\.cargo\\bin`,
    `${process.env.USERPROFILE}\\.bun\\bin`,
    `${process.env.USERPROFILE}\\.deno\\bin`,
    `${process.env.LOCALAPPDATA}\\rtk\\bin`,
    'C:\\Program Files\\Docker\\Docker\\resources\\bin',
    'C:\\Program Files\\PostgreSQL\\16\\bin',
    'C:\\Program Files\\PostgreSQL\\17\\bin',
    'C:\\Program Files\\Redis',
    'C:\\Program Files\\Microsoft VS Code\\bin',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin',
    'C:\\Program Files\\Go\\bin',
    'C:\\Go\\bin',
    'C:\\PHP',
    'C:\\php',
    'C:\\wamp64\\bin\\php\\php8.3',
    'C:\\wamp64\\bin\\php\\php8.2',
    'C:\\wamp64\\bin\\php\\php8.1',
    'C:\\wamp64\\bin\\mysql\\mysql8.0\\bin',
    'C:\\wamp64\\bin\\mariadb\\mariadb11.4\\bin',
    'C:\\wamp64\\bin\\apache\\apache2.4\\bin',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin',
    'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin',
    'C:\\Program Files\\MySQL\\MySQL Server 9.0\\bin',
    'C:\\Program Files\\MySQL\\MySQL Server 9.1\\bin',
    'C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn',
    'C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\180\\Tools\\Binn',
    'C:\\Program Files (x86)\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn',
    // Read system + user PATH from registry to get the real values
    ...(process.env.Path ?? '').split(';'),
    ...(process.env.PATH ?? '').split(';'),
  ]
  // Also read the actual registry PATH (Electron may inherit stale PATH)
  try {
    const { execSync } = require('child_process') as typeof import('child_process')
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
  return { ...process.env, PATH: dedupedPath, Path: dedupedPath }
}

// Extract a clean version string from command output
function parseVersion(raw: string): string {
  const text = raw.trim().split('\n')[0].trim()
  // Try to extract a semver-like version number
  const match = text.match(/(\d+\.\d+[\.\d]*)/)
  return match ? match[1] : text.slice(0, 40)
}

async function runDetect(cmd: string, env: NodeJS.ProcessEnv): Promise<string | null> {
  try {
    const { stdout, stderr } = await execAsync(cmd, {
      timeout: 8000,
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
      env,
      windowsHide: true,
      encoding: 'utf8',
    } as Parameters<typeof execAsync>[1])
    // Some tools (java, go, deno) write version to stderr
    const out = (String(stdout || '') || String(stderr || '')).trim()
    return out || null
  } catch {
    return null
  }
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Catch unhandled errors so the app doesn't silently crash
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
      sandbox: false,
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

function createTray() {
  try {
    const iconPath = path.join(__dirname, '../../resources/icon.png')
    if (!fs.existsSync(iconPath)) {
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

app.whenReady().then(() => {
  createWindow()
  createTray()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch(err => {
  console.error('[app] whenReady failed:', err)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Window controls
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())

// Get platform
ipcMain.handle('app:platform', (): Platform => {
  if (process.platform === 'win32') return 'windows'
  if (process.platform === 'darwin') return 'macos'
  return 'linux'
})

// Get all tools
ipcMain.handle('tools:list', () => tools)

// Detect installed tools
ipcMain.handle('tools:detect', async (): Promise<ToolState[]> => {
  const env = buildEnv()
  const states: ToolState[] = []

  for (const tool of tools) {
    const raw = await runDetect(tool.verifyCommand, env)
    if (raw) {
      states.push({ id: tool.id, status: 'installed', installedVersion: parseVersion(raw) })
    } else {
      states.push({ id: tool.id, status: 'not-installed' })
    }
  }
  return states
})

// ── Logging ───────────────────────────────────────────────────────────────────
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

// Install a tool
ipcMain.handle('tools:install', async (event, toolId: string): Promise<InstallResult> => {
  const tool = tools.find(t => t.id === toolId)
  if (!tool) return { toolId, success: false, error: 'Tool not found' }

  const platform: Platform = process.platform === 'win32' ? 'windows'
    : process.platform === 'darwin' ? 'macos' : 'linux'

  const scriptPath = tool.installers[platform]
  if (!scriptPath) return { toolId, success: false, error: `No installer for ${platform}` }

  let fullScriptPath: string
  let tmpScriptPath: string | null = null

  try {
    tmpScriptPath = await downloadScript(scriptPath)
    fullScriptPath = tmpScriptPath
  } catch (downloadErr: unknown) {
    return { toolId, success: false, error: `Download failed: ${(downloadErr as Error).message}` }
  }

  const log = createLogFile(toolId)
  log.write(`[START] tool=${toolId} platform=${platform}`)
  log.write(`[SCRIPT] ${fullScriptPath} (downloaded from GitHub)`)

  return new Promise((resolve) => {
    const sendProgress = (progress: number, message: string) => {
      const update: InstallProgress = { toolId, progress, status: 'installing', message }
      mainWindow?.webContents.send('tools:progress', update)
    }

    sendProgress(10, `Preparing to install ${tool.name}...`)

    let child: ReturnType<typeof spawn>
    if (platform === 'windows') {
      child = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', fullScriptPath], {
        env: { ...process.env },
      })
    } else {
      child = spawn('bash', [fullScriptPath], { env: { ...process.env } })
    }

    let errorOutput = ''
    let progressVal = 20

    child.stdout?.on('data', (data: Buffer) => {
      const raw = data.toString()
      log.write(`[OUT] ${raw.trim()}`)
      progressVal = Math.min(progressVal + 10, 90)
      const msg = raw.trim().slice(0, 120).replace(/\bDownload(ing|ed)?\b/gi, 'Installing')
      sendProgress(progressVal, msg)
    })

    child.stderr?.on('data', (data: Buffer) => {
      const raw = data.toString()
      log.write(`[ERR] ${raw.trim()}`)
      errorOutput += raw
      // Relay non-trivial stderr lines to progress UI
      const line = raw.trim()
      if (line && line.length > 3) {
        sendProgress(progressVal, `⚠ ${line.slice(0, 120)}`)
      }
    })

    const cleanup = () => {
      if (tmpScriptPath) fs.unlink(tmpScriptPath, () => {})
    }

    child.on('close', (code) => {
      log.write(`[EXIT] code=${code}`)
      log.close()
      cleanup()
      if (code === 0) {
        sendProgress(100, `${tool.name} installed successfully`)
        resolve({ toolId, success: true, logPath: log.logPath })
      } else {
        const err = errorOutput.trim() || `Exit code ${code}`
        resolve({ toolId, success: false, error: err, logPath: log.logPath })
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

// Uninstall a tool
ipcMain.handle('tools:uninstall', async (_event, toolId: string): Promise<InstallResult> => {
  const tool = tools.find(t => t.id === toolId)
  if (!tool) return { toolId, success: false, error: 'Tool not found' }

  try {
    const platform: Platform = process.platform === 'win32' ? 'windows'
      : process.platform === 'darwin' ? 'macos' : 'linux'
    if (platform === 'windows') {
      const id = tool.wingetId
      if (!id) return { toolId, success: false, error: `No winget ID defined for ${tool.name}` }
      await execAsync(`winget uninstall --id "${id}" --silent`, { timeout: 60000 })
    } else if (platform === 'macos') {
      const id = tool.brewId
      if (!id) return { toolId, success: false, error: `No brew ID defined for ${tool.name}` }
      await execAsync(`brew uninstall ${id}`, { timeout: 60000 })
    } else {
      const id = tool.aptId
      if (!id) return { toolId, success: false, error: `No apt ID defined for ${tool.name}` }
      await execAsync(`sudo apt-get remove -y ${id}`, { timeout: 60000 })
    }
    return { toolId, success: true }
  } catch (e: unknown) {
    return { toolId, success: false, error: (e as Error).message }
  }
})

// Open external URL
ipcMain.on('app:openUrl', (_event, url: string) => shell.openExternal(url))

// Open local file/folder in default app
ipcMain.on('app:openPath', (_event, filePath: string) => shell.openPath(filePath))

// List install log files
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

// Export config
ipcMain.handle('config:export', async (_event, toolIds: string[]): Promise<string> => {
  const config = { version: app.getVersion(), exportedAt: new Date().toISOString(), tools: toolIds }
  return JSON.stringify(config, null, 2)
})

// Get app version
ipcMain.handle('app:version', () => app.getVersion())

// Configure RTK integrations
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
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        windowsHide: true,
      } as Parameters<typeof execAsync>[1])
      results.push({ agent, success: true })
    } catch (e: unknown) {
      results.push({ agent, success: false, error: (e as Error).message })
    }
  }

  return { success: results.every(r => r.success), results }
})
