import { useMemo, useState } from 'react'
import { AlertTriangle, Check, ChevronDown, ChevronUp, ClipboardList, Loader2, Search, Wrench } from 'lucide-react'
import { useTools } from '../store/ToolContext'
import type { InstallProgress, InstallResult, ToolCategory } from '../../shared/types'
import RtkConfigModal from '../components/RtkConfigModal'
import { ToolIcon } from '../components/icons'

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  'version-control': 'Version Control & Git',
  runtime: 'Runtime & Languages',
  'package-manager': 'Package Managers',
  editor: 'Editors & IDEs',
  cli: 'CLI & Development',
  database: 'Databases',
  devops: 'DevOps & Containers',
  testing: 'Testing & API',
  'web-server': 'Web Server (WampServer)',
  system: 'System Libraries',
}

export default function InstallerPage() {
  const { tools, selected, getState, toggleSelect, selectAll, clearSelected, installSelected, detectTools } = useTools()

  const [search, setSearch] = useState('')
  const [installing, setInstalling] = useState(false)
  const [progress, setProgress] = useState<Record<string, InstallProgress>>({})
  const [done, setDone] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logPaths, setLogPaths] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showRtkModal, setShowRtkModal] = useState(false)

  const hasApi = typeof window.api !== 'undefined'

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tools.filter((t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }, [tools, search])

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
      const tool = tools.find((t) => t.id === id)
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
      setProgress((prev) => ({ ...prev, [p.toolId]: p }))
    })
    const newDone = results.filter((r) => r.success).map((r) => r.toolId)
    const newErrors: Record<string, string> = {}
    const newLogs: Record<string, string> = {}
    results.forEach((r) => {
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
      <div className="px-6 py-4 border-b border-surface-700 bg-surface-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Install Tools</h1>
            <p className="text-sm text-slate-400">All tools are optional - select only what you need.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearSelected} className="btn-ghost text-xs">
              Clear
            </button>
            <button onClick={() => selectAll(filtered.map((t) => t.id))} className="btn-ghost text-xs">
              Select All
            </button>
            <button
              onClick={handleInstall}
              disabled={selected.size === 0 || installing || !hasApi}
              title={!hasApi ? 'Run the Electron app to install tools' : undefined}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {installing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Wrench className="h-3.5 w-3.5" />
                  Install ({selected.size})
                </>
              )}
            </button>
          </div>
        </div>

        {!hasApi && (
          <div className="mb-3 bg-amber-900/30 border border-amber-700 rounded-lg px-3 py-2 text-xs text-amber-300 inline-flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Running in preview mode - run <code className="font-mono bg-amber-900/40 px-1 rounded">npm run dev</code> to enable actual installation via Electron.
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>
            {selected.size} selected - {filtered.length} tools for your platform
          </span>
          <span>~{totalSize} download</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {[...grouped.entries()].map(([category, categoryTools]) => (
          <div key={category} className="card overflow-hidden">
            <div className="px-4 py-2.5 bg-surface-800 border-b border-surface-700">
              <span className="text-sm font-semibold text-slate-300">{CATEGORY_LABELS[category] ?? category}</span>
            </div>
            <div className="divide-y divide-surface-700">
              {categoryTools.map((tool) => {
                const state = getState(tool.id)
                const isSel = selected.has(tool.id)
                const prog = progress[tool.id]
                const isDone = done.includes(tool.id)
                const errMsg = errors[tool.id]

                const isInstalled = state.status === 'installed' || isDone
                const logPath = logPaths[tool.id]
                const isExpanded = expanded[tool.id]

                return (
                  <div
                    key={tool.id}
                    onClick={() => !installing && !isInstalled && toggleSelect(tool.id)}
                    className={`relative flex items-center gap-4 px-4 py-3 transition-colors
                      ${isInstalled ? 'bg-emerald-950/20 border-l-2 border-emerald-600 cursor-default' : isSel ? 'bg-primary-900/30 cursor-pointer' : 'hover:bg-surface-800/40 cursor-pointer'}`}
                  >
                    {isInstalled ? (
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-emerald-600 border-2 border-emerald-600">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors
                        ${isSel ? 'bg-primary-600 border-primary-600' : 'border-surface-600'}`}
                      >
                        {isSel && <Check className="w-3 h-3 text-white" />}
                      </div>
                    )}

                    <ToolIcon toolId={tool.id} className="h-5 w-5 text-slate-300" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${isInstalled ? 'text-emerald-200' : 'text-slate-200'}`}>{tool.name}</span>
                        <span className="badge bg-surface-700 text-slate-400 font-mono text-xs">{tool.version}</span>
                        {state.status === 'installed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/25 text-emerald-300 border border-emerald-600/40">
                            <Check className="w-3 h-3" />
                            Installed{state.installedVersion ? ` - v${state.installedVersion}` : ''}
                          </span>
                        )}
                        {isDone && state.status !== 'installed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/25 text-emerald-300 border border-emerald-600/40">
                            <Check className="w-3 h-3" />
                            Just installed
                          </span>
                        )}
                        {state.status === 'outdated' && (
                          <span className="badge bg-amber-900/60 text-amber-300 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Update available
                          </span>
                        )}
                        {errMsg && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpanded((p) => ({ ...p, [tool.id]: !p[tool.id] }))
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-900/40 text-red-300 border border-red-700/40 hover:bg-red-900/60 transition-colors"
                          >
                            Error {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{tool.description}</div>

                      {prog && state.status === 'installing' && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-surface-700 rounded-full h-1.5">
                              <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${prog.progress}%` }} />
                            </div>
                            <span className="text-xs font-mono text-primary-400 flex-shrink-0 w-8 text-right">{prog.progress}%</span>
                          </div>
                          <div className={`text-xs mt-0.5 truncate ${prog.message.startsWith('Warning') ? 'text-amber-400' : 'text-slate-500'}`}>{prog.message}</div>
                        </div>
                      )}

                      {errMsg && isExpanded && (
                        <div className="mt-2 rounded-md bg-red-950/40 border border-red-800/40 p-2">
                          <pre className="text-xs text-red-300 whitespace-pre-wrap break-all max-h-32 overflow-auto">{errMsg}</pre>
                          {logPath && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.api?.openLogFile(logPath)
                              }}
                              className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <ClipboardList className="h-3.5 w-3.5" />
                              Open full log
                            </button>
                          )}
                        </div>
                      )}
                      {!errMsg && logPath && isDone && (
                        <div className="mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.api?.openLogFile(logPath)
                            }}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <ClipboardList className="h-3.5 w-3.5" />
                            View log
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      {isInstalled ? <Check className="h-4 w-4 text-emerald-600" /> : <div className="text-xs text-slate-500">{tool.size}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Search className="h-10 w-10 mx-auto mb-3 text-slate-500" />
            <p>No tools found for "{search}"</p>
          </div>
        )}
      </div>

      {showRtkModal && <RtkConfigModal onClose={() => setShowRtkModal(false)} />}
    </div>
  )
}
