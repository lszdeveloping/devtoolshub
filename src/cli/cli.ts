#!/usr/bin/env node
import { Command } from 'commander'
import { execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { TOOLS as tools } from '../shared/tools-data'

if (process.platform !== 'win32') {
  console.error('DevTools Hub supports Windows only.')
  process.exit(1)
}

function readAppVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '../../package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    return String(pkg.version ?? '0.0.0')
  } catch {
    return '0.0.0'
  }
}

const APP_VERSION = readAppVersion()

function resolveInstaller(relPath: string): string | null {
  const normalized = relPath.replace(/\\/g, '/').replace(/^\/+/, '')
  const candidates = [
    path.resolve(__dirname, '../../', normalized),
    path.resolve(process.cwd(), normalized),
  ]
  return candidates.find(p => fs.existsSync(p)) ?? null
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
  const scriptPath = resolveInstaller(tool.installer)
  if (!scriptPath) {
    console.error(`  Installer script not found on disk: ${tool.installer}`)
    return false
  }

  // Elevate via UAC. Installer scripts require admin (#Requires -RunAsAdministrator).
  const escapedScript = scriptPath.replace(/'/g, "''")
  const wrapper = `Start-Process powershell.exe -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','${escapedScript}' -Verb RunAs -Wait -PassThru | Select-Object -ExpandProperty ExitCode`
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', wrapper],
    { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' }
  )
  const stdout = (result.stdout ?? '').trim()
  const exitCode = parseInt(stdout.split(/\r?\n/).pop() ?? '', 10)
  return Number.isFinite(exitCode) ? exitCode === 0 : result.status === 0
}

function runTest(targets: typeof tools): { pass: number; fail: number } {
  let pass = 0
  let fail = 0
  for (const tool of targets) {
    const check = checkTool(tool)
    if (check.installed) {
      console.log(`[OK] ${tool.name}: ${check.version}`)
      pass++
    } else {
      console.log(`[X] ${tool.name}: not installed`)
      fail++
    }
  }
  console.log(`\n${pass} passed, ${fail} not installed\n`)
  return { pass, fail }
}

const program = new Command()

program.name('devtoolshub').description('DevTools Hub CLI - Install and manage dev tools on Windows').version(APP_VERSION)

program
  .command('list')
  .description('List all available tools')
  .option('-i, --installed', 'Show only installed tools')
  .action((opts) => {
    console.log('\nAvailable Tools:\n')
    for (const tool of tools) {
      const check = checkTool(tool)
      if (opts.installed && !check.installed) continue
      const status = check.installed ? `\x1b[32mOK ${check.version ?? 'installed'}\x1b[0m` : '\x1b[90mnot installed\x1b[0m'
      console.log(`  - ${tool.name.padEnd(20)} ${status}`)
    }
    console.log()
  })

program
  .command('status [toolId]')
  .description('Check installation status of tools')
  .action((toolId?: string) => {
    const targets = toolId ? tools.filter((t) => t.id === toolId) : tools
    if (toolId && targets.length === 0) {
      console.error(`Unknown tool: ${toolId}`)
      process.exit(1)
    }
    console.log('\nStatus on Windows:\n')
    let installed = 0
    for (const tool of targets) {
      const check = checkTool(tool)
      if (check.installed) installed++
      const icon = check.installed ? '[OK]' : '[X]'
      const ver = check.version ? ` (${check.version})` : ''
      console.log(`  ${icon} ${tool.name}${ver}`)
    }
    console.log(`\n  ${installed}/${targets.length} installed\n`)
  })

program
  .command('install <toolIds...>')
  .description('Install one or more tools')
  .option('--parallel', 'Install in parallel (background, may mix output)')
  .action((toolIds: string[]) => {
    for (const id of toolIds) {
      const tool = tools.find((t) => t.id === id)
      if (!tool) {
        console.error(`Unknown tool: ${id}`)
        continue
      }
      console.log(`\nInstalling ${tool.name}...`)
      const ok = runScript(tool)
      if (ok) console.log(`[OK] ${tool.name} installed successfully`)
      else console.error(`[X] ${tool.name} installation failed`)
    }
  })

program
  .command('uninstall <toolId>')
  .description('Uninstall a tool')
  .option('--purge', 'Remove config and cache files')
  .action((toolId: string) => {
    const tool = tools.find((t) => t.id === toolId)
    if (!tool) {
      console.error(`Unknown tool: ${toolId}`)
      process.exit(1)
    }
    if (!tool.wingetId) {
      console.error(`[X] No winget ID defined for ${tool.name}`)
      process.exit(1)
    }
    console.log(`Uninstalling ${tool.name}...`)
    try {
      const escapedId = tool.wingetId.replace(/'/g, "''")
      const wrapper = `Start-Process winget -ArgumentList 'uninstall','--id','${escapedId}','--silent' -Verb RunAs -Wait`
      execSync(
        `powershell -NoProfile -ExecutionPolicy Bypass -Command "${wrapper.replace(/"/g, '\\"')}"`,
        { stdio: 'inherit' }
      )
      console.log(`[OK] ${tool.name} uninstalled`)
    } catch {
      console.error(`[X] Failed to uninstall ${tool.name}`)
    }
  })

program
  .command('update [toolId]')
  .description('Update tools via winget')
  .option('--auto-confirm', 'Skip confirmation prompts')
  .action((toolId?: string) => {
    const targets = toolId ? tools.filter((t) => t.id === toolId) : tools
    console.log(`\nUpdating ${toolId ?? 'all'} tools...\n`)
    for (const tool of targets) {
      const check = checkTool(tool)
      if (!check.installed) continue
      if (!tool.wingetId) {
        console.log(`  [SKIP] ${tool.name}: no winget ID`)
        continue
      }
      console.log(`Updating ${tool.name}...`)
      try {
        const escapedId = tool.wingetId.replace(/'/g, "''")
        const wrapper = `Start-Process winget -ArgumentList 'upgrade','--id','${escapedId}','--silent' -Verb RunAs -Wait`
        execSync(
          `powershell -NoProfile -ExecutionPolicy Bypass -Command "${wrapper.replace(/"/g, '\\"')}"`,
          { stdio: 'inherit' }
        )
      } catch {
        console.error(`  [X] Update failed for ${tool.name}`)
      }
    }
    console.log('\n[OK] Update complete\n')
  })

program
  .command('test [toolId]')
  .description('Verify tool installations')
  .option('--all', 'Test all tools')
  .action((toolId?: string) => {
    const targets = toolId ? tools.filter((t) => t.id === toolId) : tools
    runTest(targets)
  })

program
  .command('diagnose')
  .description('Run full diagnostic on all tools')
  .action(() => {
    console.log('\nDiagnosing DevTools Hub...\n')
    console.log('  Platform: windows')
    console.log(`  OS: ${os.type()} ${os.release()}`)
    console.log(`  Arch: ${os.arch()}`)
    console.log(`  Node: ${process.version}`)
    console.log(`  Home: ${os.homedir()}`)
    console.log()
    runTest(tools)
  })

program
  .command('export-config')
  .description('Export list of installed tools as JSON')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .action((opts) => {
    const installedIds = tools.filter((t) => checkTool(t).installed).map((t) => t.id)
    const config = { version: APP_VERSION, exportedAt: new Date().toISOString(), tools: installedIds }
    const json = JSON.stringify(config, null, 2)
    if (opts.output) {
      fs.writeFileSync(opts.output, json)
      console.log(`[OK] Config exported to ${opts.output}`)
    } else {
      console.log(json)
    }
  })

program
  .command('import-config <file>')
  .description('Import and install tools from a config file')
  .action((file: string) => {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`)
      process.exit(1)
    }
    const config = JSON.parse(fs.readFileSync(file, 'utf-8'))
    console.log(`\nImporting config from ${file}`)
    console.log(`   Tools: ${config.tools.join(', ')}\n`)
    for (const id of config.tools as string[]) {
      const tool = tools.find((t) => t.id === id)
      if (!tool) {
        console.warn(`  [WARN] Unknown tool: ${id}`)
        continue
      }
      console.log(`Installing ${tool.name}...`)
      runScript(tool)
    }
    console.log('\n[OK] Import complete\n')
  })

program
  .command('version <toolId>')
  .description('Show installed version of a tool')
  .action((toolId: string) => {
    const tool = tools.find((t) => t.id === toolId)
    if (!tool) {
      console.error(`Unknown tool: ${toolId}`)
      process.exit(1)
    }
    const check = checkTool(tool)
    if (check.installed) console.log(`${tool.name}: ${check.version}`)
    else console.log(`${tool.name}: not installed`)
  })

// Silence unused warning
void os.homedir

program.parse(process.argv)
