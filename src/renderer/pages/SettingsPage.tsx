import { useState, useEffect } from 'react'
import { useTools } from '../store/ToolContext'

const shortcuts = [
  { key: 'Ctrl+O / Cmd+O', action: 'Open Dashboard' },
  { key: 'Ctrl+I / Cmd+I', action: 'Go to Installer' },
  { key: 'Ctrl+S / Cmd+S', action: 'Save settings' },
  { key: 'Ctrl+, / Cmd+,', action: 'Open Settings' },
  { key: 'Ctrl+T / Cmd+T', action: 'Open Terminal' },
  { key: 'Ctrl+L / Cmd+L', action: 'View Logs' },
  { key: 'Ctrl+Q / Cmd+Q', action: 'Quit' },
]

const repositoryUrl = 'https://github.com/lszdeveloping/devtoolshub'
const issuesUrl = `${repositoryUrl}/issues`

export default function SettingsPage() {
  const { platform } = useTools()
  const [version, setVersion]           = useState('1.0.0')
  const [autoUpdate, setAutoUpdate]     = useState(true)
  const [parallel, setParallel]         = useState(true)
  const [saved, setSaved]               = useState(false)

  const hasApi = typeof window.api !== 'undefined'

  useEffect(() => {
    if (hasApi) window.api.getVersion().then(setVersion)
  }, [hasApi])

  const platformLabel: Record<string, string> = {
    windows: '🪟 Windows',
    macos: '🍎 macOS',
    linux: '🐧 Linux',
  }

  const pathCmd: Record<string, string> = {
    windows: '$env:Path -split ";"',
    macos: 'echo $PATH | tr ":" "\\n"',
    linux: 'echo $PATH | tr ":" "\\n"',
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your DevTools Hub preferences</p>
      </div>

      {/* System Info */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-slate-200">System Information</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-surface-800 rounded-lg p-3">
            <div className="text-slate-500 text-xs mb-1">Platform</div>
            <div className="text-slate-200 font-medium">{platformLabel[platform] ?? platform}</div>
          </div>
          <div className="bg-surface-800 rounded-lg p-3">
            <div className="text-slate-500 text-xs mb-1">App Version</div>
            <div className="text-slate-200 font-mono">v{version}</div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-200">Preferences</h2>

        <label className="flex items-center justify-between py-2 border-b border-surface-700 cursor-pointer">
          <div>
            <div className="text-sm font-medium text-slate-300">Auto-update tools</div>
            <div className="text-xs text-slate-500">Check for updates on launch</div>
          </div>
          <button
            onClick={() => setAutoUpdate(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${autoUpdate ? 'bg-primary-600' : 'bg-surface-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoUpdate ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>

        <label className="flex items-center justify-between py-2 cursor-pointer">
          <div>
            <div className="text-sm font-medium text-slate-300">Parallel installation</div>
            <div className="text-xs text-slate-500">Install multiple tools simultaneously</div>
          </div>
          <button
            onClick={() => setParallel(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${parallel ? 'bg-primary-600' : 'bg-surface-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${parallel ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-slate-200">Keyboard Shortcuts</h2>
        <div className="divide-y divide-surface-700">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-400">{s.action}</span>
              <kbd className="bg-surface-800 border border-surface-600 text-slate-300 px-2 py-0.5 rounded text-xs font-mono">{s.key}</kbd>
            </div>
          ))}
        </div>
      </div>

      {/* PATH Info */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-slate-200">PATH Configuration</h2>
        <p className="text-sm text-slate-400">
          DevTools Hub automatically adds installed tools to your system PATH.
          If a tool is not found after installation, restart your terminal.
        </p>
        <div className="bg-surface-800 rounded-lg p-3 font-mono text-xs text-slate-400 select-all">
          {pathCmd[platform] ?? 'echo $PATH'}
        </div>
      </div>

      {/* About */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-slate-200">About</h2>
        <p className="text-sm text-slate-400">DevTools Hub v{version} — Open source tool installer for developers.</p>
        <div className="flex gap-4 text-sm text-primary-400">
          <button
            className="hover:text-primary-300 transition-colors"
            onClick={() => window.api?.openUrl(repositoryUrl)}
          >GitHub</button>
          <button
            className="hover:text-primary-300 transition-colors"
            onClick={() => window.api?.openUrl(issuesUrl)}
          >Report Issue</button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className="btn-primary"
        >
          {saved ? '✓ Saved!' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  )
}
