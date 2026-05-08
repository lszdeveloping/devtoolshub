#!/usr/bin/env node
import { Command } from 'commander'
import { execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { TOOLS as tools } from '../shared/tools-data'
import type { Platform } from '../shared/types'

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/lszdeveloping/devtoolshub/main'

function downloadScript(scriptRelPath: string): string {
  const url = `${GITHUB_RAW_BASE}/${scriptRelPath.replace(/\\/g, '/')}`
  const ext = path.extname(scriptRelPath)
  const tmpFile = path.join(os.tmpdir(), `devtoolshub-${Date.now()}${ext}`)
  if (process.platform === 'win32') {
    execSync(`powershell -NoProfile -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${tmpFile}'"`, { timeout: 30000 })
  } else {
    execSync(`curl -fsSL "${url}" -o "${tmpFile}"`, { timeout: 30000 })
  }
  if (!fs.existsSync(tmpFile)) throw new Error(`Download failed: ${url}`)
  return tmpFile
}

const program = new Command()

function getPlatform(): Platform {
  if (process.platform === 'win32') return 'windows'
  if (process.platform === 'darwin') return 'macos'
  return 'linux'
}

function checkTool(tool: typeof tools[0]): { installed: boolean; version?: string } {
  try {
    const out = execSync(tool.verifyCommand, { timeout: 5000, stdio: 'pipe' }).toString().trim()
    return { installed: true, version: out.split('\n')[0] }
  } catch {
    return { installed: false }
  }
}

function runScript(tool: typeof tools[0]): boolean {
  const platform = getPlatform()
  const scriptRelPath = tool.installers[platform]
  if (!scriptRelPath) {
    console.error(`No installer for ${platform} for tool: ${tool.id}`)
    return false
  }
  let tmpPath: string
  try {
    console.log(`  Downloading installer from GitHub...`)
    tmpPath = downloadScript(scriptRelPath)
  } catch (err) {
    console.error(`  Download failed: ${(err as Error).message}`)
    return false
  }
  try {
    const cmd = platform === 'windows'
      ? spawnSync('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', tmpPath], { stdio: 'inherit' })
      : spawnSync('bash', [tmpPath], { stdio: 'inherit' })
    return cmd.status === 0
  } finally {
    fs.unlink(tmpPath, () => {})
  }
}

program
  .name('devtoolshub')
  .description('DevTools Hub CLI — Install and manage dev tools')
  .version('1.0.0')

// list
program
  .command('list')
  .description('List all available tools')
  .option('-i, --installed', 'Show only installed tools')
  .action((opts) => {
    console.log('\nAvailable Tools:\n')
    const platform = getPlatform()
    for (const tool of tools) {
      if (!tool.platforms.includes(platform)) continue
      const check = checkTool(tool)
      if (opts.installed && !check.installed) continue
      const status = check.installed ? `\x1b[32m✓ ${check.version ?? 'installed'}\x1b[0m` : '\x1b[90m✗ not installed\x1b[0m'
      console.log(`  ${tool.icon} ${tool.name.padEnd(20)} ${status}`)
    }
    console.log()
  })

// status
program
  .command('status [toolId]')
  .description('Check installation status of tools')
  .action((toolId?: string) => {
    const targets = toolId ? tools.filter(t => t.id === toolId) : tools
    if (toolId && targets.length === 0) {
      console.error(`Unknown tool: ${toolId}`)
      process.exit(1)
    }
    const platform = getPlatform()
    console.log(`\nStatus on ${platform}:\n`)
    let installed = 0
    for (const tool of targets) {
      if (!tool.platforms.includes(platform)) continue
      const check = checkTool(tool)
      if (check.installed) installed++
      const icon = check.installed ? '✅' : '❌'
      const ver  = check.version ? ` (${check.version})` : ''
      console.log(`  ${icon} ${tool.name}${ver}`)
    }
    console.log(`\n  ${installed}/${targets.length} installed\n`)
  })

// install
program
  .command('install <toolIds...>')
  .description('Install one or more tools')
  .option('--parallel', 'Install in parallel (background, may mix output)')
  .action((toolIds: string[]) => {
    const platform = getPlatform()
    for (const id of toolIds) {
      const tool = tools.find(t => t.id === id)
      if (!tool) { console.error(`Unknown tool: ${id}`); continue }
      if (!tool.platforms.includes(platform)) {
        console.error(`${tool.name} not supported on ${platform}`)
        continue
      }
      console.log(`\n📦 Installing ${tool.name}...`)
      const ok = runScript(tool)
      if (ok) console.log(`✅ ${tool.name} installed successfully`)
      else console.error(`❌ ${tool.name} installation failed`)
    }
  })

// uninstall
program
  .command('uninstall <toolId>')
  .description('Uninstall a tool')
  .option('--purge', 'Remove config and cache files')
  .action((toolId: string) => {
    const tool = tools.find(t => t.id === toolId)
    if (!tool) { console.error(`Unknown tool: ${toolId}`); process.exit(1) }
    const platform = getPlatform()
    console.log(`🗑  Uninstalling ${tool.name}...`)
    try {
      if (platform === 'windows') execSync(`winget uninstall --id "${tool.id}" --silent`, { stdio: 'inherit' })
      else if (platform === 'macos') execSync(`brew uninstall ${tool.id}`, { stdio: 'inherit' })
      else execSync(`sudo apt-get remove -y ${tool.id}`, { stdio: 'inherit' })
      console.log(`✅ ${tool.name} uninstalled`)
    } catch {
      console.error(`❌ Failed to uninstall ${tool.name}`)
    }
  })

// update
program
  .command('update [toolId]')
  .description('Update tools (all or specific)')
  .option('--auto-confirm', 'Skip confirmation prompts')
  .action((toolId?: string) => {
    const targets = toolId ? tools.filter(t => t.id === toolId) : tools
    const platform = getPlatform()
    console.log(`\n🔄 Updating ${toolId ?? 'all'} tools...\n`)
    for (const tool of targets) {
      if (!tool.platforms.includes(platform)) continue
      const check = checkTool(tool)
      if (!check.installed) continue
      console.log(`⬆️  Updating ${tool.name}...`)
      runScript(tool)
    }
    console.log('\n✅ Update complete\n')
  })

// test
program
  .command('test [toolId]')
  .description('Verify tool installations')
  .option('--all', 'Test all tools')
  .action((toolId?: string, opts?: { all?: boolean }) => {
    const targets = toolId ? tools.filter(t => t.id === toolId) : (opts?.all ? tools : tools)
    const platform = getPlatform()
    let pass = 0; let fail = 0
    for (const tool of targets) {
      if (!tool.platforms.includes(platform)) continue
      const check = checkTool(tool)
      if (check.installed) { console.log(`✅ ${tool.name}: ${check.version}`); pass++ }
      else { console.log(`❌ ${tool.name}: not installed`); fail++ }
    }
    console.log(`\n${pass} passed, ${fail} not installed\n`)
  })

// diagnose
program
  .command('diagnose')
  .description('Run full diagnostic on all tools')
  .action(() => {
    console.log('\n🔍 Diagnosing DevTools Hub...\n')
    console.log(`  Platform: ${getPlatform()}`)
    console.log(`  OS: ${os.type()} ${os.release()}`)
    console.log(`  Arch: ${os.arch()}`)
    console.log(`  Node: ${process.version}`)
    console.log(`  Home: ${os.homedir()}`)
    console.log()
    program.commands.find(c => c.name() === 'test')?.parseAsync(['node', 'devtoolshub', 'test'])
  })

// export-config
program
  .command('export-config')
  .description('Export list of installed tools as JSON')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action((opts) => {
    const platform = getPlatform()
    const installedIds = tools
      .filter(t => t.platforms.includes(platform) && checkTool(t).installed)
      .map(t => t.id)
    const config = { version: '1.0.0', exportedAt: new Date().toISOString(), tools: installedIds }
    const json = JSON.stringify(config, null, 2)
    if (opts.output) {
      fs.writeFileSync(opts.output, json)
      console.log(`✅ Config exported to ${opts.output}`)
    } else {
      console.log(json)
    }
  })

// import-config
program
  .command('import-config <file>')
  .description('Import and install tools from a config file')
  .action((file: string) => {
    if (!fs.existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1) }
    const config = JSON.parse(fs.readFileSync(file, 'utf-8'))
    console.log(`\n📥 Importing config from ${file}`)
    console.log(`   Tools: ${config.tools.join(', ')}\n`)
    for (const id of config.tools as string[]) {
      const tool = tools.find(t => t.id === id)
      if (!tool) { console.warn(`  ⚠️  Unknown tool: ${id}`); continue }
      console.log(`📦 Installing ${tool.name}...`)
      runScript(tool)
    }
    console.log('\n✅ Import complete\n')
  })

// versions
program
  .command('version <toolId>')
  .description('Show installed version of a tool')
  .action((toolId: string) => {
    const tool = tools.find(t => t.id === toolId)
    if (!tool) { console.error(`Unknown tool: ${toolId}`); process.exit(1) }
    const check = checkTool(tool)
    if (check.installed) console.log(`${tool.name}: ${check.version}`)
    else console.log(`${tool.name}: not installed`)
  })

program.parse(process.argv)
