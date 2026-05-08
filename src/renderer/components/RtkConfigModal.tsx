import { useState } from 'react'

const AGENTS = [
  { id: 'claude',      label: 'Claude Code',       icon: '🤖', cmd: 'rtk init -g' },
  { id: 'codex',       label: 'Codex (OpenAI)',     icon: '⚡', cmd: 'rtk init -g --codex' },
  { id: 'gemini',      label: 'Gemini CLI',         icon: '♊', cmd: 'rtk init -g --gemini' },
  { id: 'cursor',      label: 'Cursor',             icon: '🖱️', cmd: 'rtk init --agent cursor' },
  { id: 'windsurf',    label: 'Windsurf',           icon: '🏄', cmd: 'rtk init --agent windsurf' },
  { id: 'cline',       label: 'Cline / Roo Code',  icon: '🔌', cmd: 'rtk init --agent cline' },
  { id: 'kilocode',    label: 'Kilo Code',          icon: '📝', cmd: 'rtk init --agent kilocode' },
  { id: 'antigravity', label: 'Google Antigravity', icon: '🚀', cmd: 'rtk init --agent antigravity' },
  { id: 'opencode',    label: 'OpenCode',           icon: '💻', cmd: 'rtk init -g --opencode' },
]

interface AgentResult { agent: string; success: boolean; error?: string }

interface Props {
  onClose: () => void
}

export default function RtkConfigModal({ onClose }: Props) {
  const [selected, setSelected]   = useState<Set<string>>(new Set(['claude']))
  const [running, setRunning]     = useState(false)
  const [results, setResults]     = useState<AgentResult[] | null>(null)

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function handleConfigure() {
    if (selected.size === 0) return
    setRunning(true)
    const res = await window.api.configureRtk([...selected])
    setResults(res.results)
    setRunning(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-900 border border-surface-700 rounded-xl shadow-2xl w-full max-w-md mx-4">

        <div className="px-5 py-4 border-b border-surface-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">🦀 Configure RTK</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select which AI tools to activate RTK for</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors text-lg leading-none">✕</button>
        </div>

        {results ? (
          <div className="p-5 space-y-2">
            {results.map(r => {
              const agent = AGENTS.find(a => a.id === r.agent)
              return (
                <div key={r.agent} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${r.success ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-red-950/30 border-red-800/40'}`}>
                  <span>{r.success ? '✅' : '❌'}</span>
                  <span className="text-sm text-slate-200">{agent?.label ?? r.agent}</span>
                  {r.error && <span className="text-xs text-red-400 truncate flex-1">{r.error}</span>}
                </div>
              )
            })}
            <p className="text-xs text-slate-500 pt-1">Restart the configured tool(s) for changes to take effect.</p>
            <button onClick={onClose} className="btn-primary w-full mt-2">Done</button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-1.5 max-h-[420px] overflow-y-auto">
              {AGENTS.map(agent => (
                <label
                  key={agent.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border
                    ${selected.has(agent.id)
                      ? 'bg-primary-900/30 border-primary-700/40'
                      : 'hover:bg-surface-800 border-transparent'}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(agent.id)}
                    onChange={() => toggle(agent.id)}
                    className="rounded border-surface-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <span className="text-base leading-none">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200">{agent.label}</div>
                    <div className="text-xs text-slate-500 font-mono">{agent.cmd}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-2 pt-1">
              <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={handleConfigure}
                disabled={selected.size === 0 || running}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? '⏳ Configuring...' : `Apply (${selected.size})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
