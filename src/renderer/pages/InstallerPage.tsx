import { useState, useMemo } from 'react'
import { useTools } from '../store/ToolContext'
import { CATEGORY_LABELS } from '../../shared/tools-data'
import type { InstallProgress, InstallResult, ToolCategory } from '../../shared/types'
import RtkConfigModal from '../components/RtkConfigModal'

export default function InstallerPage() {
  const {
    tools, selected, platform, getState,
    toggleSelect, selectAll, clearSelected, installSelected, detectTools,
  } = useTools()

  const [search, setSearch]     = useState('')
  const [installing, setInstalling]   = useState(false)
  const [progress, setProgress]       = useState<Record<string, InstallProgress>>({})
  const [done, setDone]               = useState<string[]>([])
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [logPaths, setLogPaths]       = useState<Record<string, string>>({})
  const [expanded, setExpanded]       = useState<Record<string, boolean>>({})
  const [showRtkModal, setShowRtkModal] = useState(false)

  const hasApi = typeof window.api !== 'undefined'

  // Filter by platform + search
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tools
      .filter(t => t.platforms.includes(platform))
      .filter(t => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }, [tools, platform, search])

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<ToolCategory, typeof tools>()
    for (const t of filtered) {
      const list = map.get(t.category) ?? []
      list.push(t)
      map.set(t.category, list)
    }
    return map
  }, [filtered])

  const totalSize = useMemo(() => {
    let mb = 0
    for (const id of selected) {
      const tool = tools.find(t => t.id === id)
      if (tool) mb += parseInt(tool.size) || 0
    }
    return mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb} MB`
  }, [selected, tools])

  async function handleInstall() {
    setInstalling(true)
    setDone([])
    setErrors({})
    setLogPaths({})
    const results: InstallResult[] = await installSelected((p: InstallProgress) => {
      setProgress(prev => ({ ...prev, [p.toolId]: p }))
    })
    const newDone = results.filter(r => r.success).map(r => r.toolId)
    const newErrors: Record<string, string> = {}
    const newLogs: Record<string, string> = {}
    results.forEach(r => {
      if (!r.success && r.error) newErrors[r.toolId] = r.error
      if (r.logPath) newLogs[r.toolId] = r.logPath
    })
    setDone(newDone)
    setErrors(newErrors)
    setLogPaths(newLogs)
    setInstalling(false)
    detectTools()
    if (newDone.includes('rtk')) setShowRtkModal(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-700 bg-surface-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Install Tools</h1>
            <p className="text-sm text-slate-400">All tools are optional — select only what you need.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearSelected} className="btn-ghost text-xs">Clear</button>
            <button
              onClick={() => selectAll(filtered.map(t => t.id))}
              className="btn-ghost text-xs"
            >Select All</button>
            <button
              onClick={handleInstall}
              disabled={selected.size === 0 || installing || !hasApi}
              title={!hasApi ? 'Run the Electron app to install tools' : undefined}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {installing ? '⏳ Installing...' : `⚡ Install (${selected.size})`}
            </button>
          </div>
        </div>

        {!hasApi && (
          <div className="mb-3 bg-amber-900/30 border border-amber-700 rounded-lg px-3 py-2 text-xs text-amber-300">
            ⚠️ Running in preview mode — run <code className="font-mono bg-amber-900/40 px-1 rounded">npm run dev</code> to enable actual installation via Electron.
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>{selected.size} selected · {filtered.length} tools for your platform</span>
          <span>~{totalSize} download</span>
        </div>
      </div>

      {/* Tool List */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {[...grouped.entries()].map(([category, categoryTools]) => (
          <div key={category} className="card overflow-hidden">
            <div className="px-4 py-2.5 bg-surface-800 border-b border-surface-700">
              <span className="text-sm font-semibold text-slate-300">
                {CATEGORY_LABELS[category] ?? category}
              </span>
            </div>
            <div className="divide-y divide-surface-700">
              {categoryTools.map(tool => {
                const state    = getState(tool.id)
                const isSel    = selected.has(tool.id)
                const prog     = progress[tool.id]
                const isDone   = done.includes(tool.id)
                const errMsg   = errors[tool.id]

                const isInstalled = state.status === 'installed' || isDone
                const logPath    = logPaths[tool.id]
                const isExpanded = expanded[tool.id]

                return (
                  <div
                    key={tool.id}
                    onClick={() => !installing && !isInstalled && toggleSelect(tool.id)}
                    className={`relative flex items-center gap-4 px-4 py-3 transition-colors
                      ${isInstalled
                        ? 'bg-emerald-950/20 border-l-2 border-emerald-600 cursor-default'
                        : isSel
                          ? 'bg-primary-900/30 cursor-pointer'
                          : 'hover:bg-surface-800/40 cursor-pointer'
                      }`}
                  >
                    {/* Checkbox / installed indicator */}
                    {isInstalled ? (
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-emerald-600 border-2 border-emerald-600">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 9" fill="none">
                          <path d="M1 4L4.5 7.5L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors
                        ${isSel ? 'bg-primary-600 border-primary-600' : 'border-surface-600'}`}>
                        {isSel && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 9" fill="none">
                            <path d="M1 4L4.5 7.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    )}

                    <span className="text-2xl">{tool.icon}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${isInstalled ? 'text-emerald-200' : 'text-slate-200'}`}>
                          {tool.name}
                        </span>
                        <span className="badge bg-surface-700 text-slate-400 font-mono text-xs">{tool.version}</span>
                        {state.status === 'installed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/25 text-emerald-300 border border-emerald-600/40">
                            <svg className="w-3 h-3" viewBox="0 0 12 9" fill="none">
                              <path d="M1 4L4.5 7.5L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Installed{state.installedVersion ? ` · v${state.installedVersion}` : ''}
                          </span>
                        )}
                        {isDone && state.status !== 'installed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/25 text-emerald-300 border border-emerald-600/40">
                            <svg className="w-3 h-3" viewBox="0 0 12 9" fill="none">
                              <path d="M1 4L4.5 7.5L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Just installed
                          </span>
                        )}
                        {state.status === 'outdated' && (
                          <span className="badge bg-amber-900/60 text-amber-300">⚠ Update available</span>
                        )}
                        {errMsg && (
                          <button
                            onClick={e => { e.stopPropagation(); setExpanded(p => ({ ...p, [tool.id]: !p[tool.id] })) }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-900/40 text-red-300 border border-red-700/40 hover:bg-red-900/60 transition-colors"
                          >
                            ✗ Error {isExpanded ? '▲' : '▼'}
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{tool.description}</div>

                      {prog && state.status === 'installing' && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-surface-700 rounded-full h-1.5">
                              <div
                                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${prog.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-primary-400 flex-shrink-0 w-8 text-right">
                              {prog.progress}%
                            </span>
                          </div>
                          <div className={`text-xs mt-0.5 truncate ${prog.message.startsWith('⚠') ? 'text-amber-400' : 'text-slate-500'}`}>
                            {prog.message}
                          </div>
                        </div>
                      )}

                      {/* Error details + log button */}
                      {errMsg && isExpanded && (
                        <div className="mt-2 rounded-md bg-red-950/40 border border-red-800/40 p-2">
                          <pre className="text-xs text-red-300 whitespace-pre-wrap break-all max-h-32 overflow-auto">{errMsg}</pre>
                          {logPath && (
                            <button
                              onClick={e => { e.stopPropagation(); window.api?.openLogFile(logPath) }}
                              className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              📋 Abrir log completo
                            </button>
                          )}
                        </div>
                      )}
                      {!errMsg && logPath && isDone && (
                        <div className="mt-1">
                          <button
                            onClick={e => { e.stopPropagation(); window.api?.openLogFile(logPath) }}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            📋 Ver log
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      {isInstalled
                        ? <span className="text-xs text-emerald-600 font-medium">✓</span>
                        : <div className="text-xs text-slate-500">{tool.size}</div>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <p>No tools found for "{search}"</p>
          </div>
        )}
      </div>

      {showRtkModal && <RtkConfigModal onClose={() => setShowRtkModal(false)} />}
    </div>
  )
}
