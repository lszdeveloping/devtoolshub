import { useState } from 'react'
import type { ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ClipboardList, LayoutDashboard, Loader2, RefreshCw, Settings2, XCircle } from 'lucide-react'
import { useTools } from '../store/ToolContext'
import type { ToolStatus } from '../../shared/types'
import RtkConfigModal from '../components/RtkConfigModal'
import { ToolIcon } from '../components/icons'

const statusConfig: Record<ToolStatus, { label: string; cls: string; Icon: ComponentType<{ className?: string }> }> = {
  installed: { label: 'Installed', cls: 'text-emerald-400', Icon: CheckCircle2 },
  outdated: { label: 'Outdated', cls: 'text-amber-400', Icon: AlertTriangle },
  'not-installed': { label: 'Not installed', cls: 'text-slate-500', Icon: XCircle },
  installing: { label: 'Installing', cls: 'text-primary-400', Icon: Loader2 },
  error: { label: 'Error', cls: 'text-red-400', Icon: XCircle },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { tools, getState, detectTools, uninstallTool, exportConfig } = useTools()
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | ToolStatus>('all')
  const [exportMsg, setExportMsg] = useState('')
  const [showRtkModal, setShowRtkModal] = useState(false)

  const installed = tools.filter((t) => getState(t.id).status === 'installed')
  const outdated = tools.filter((t) => getState(t.id).status === 'outdated')
  const errored = tools.filter((t) => getState(t.id).status === 'error')

  const displayed = filter === 'all' ? tools : tools.filter((t) => getState(t.id).status === filter)

  async function handleRefresh() {
    setRefreshing(true)
    await detectTools()
    setRefreshing(false)
  }

  async function handleUninstall(id: string, name: string) {
    if (!confirm(`Uninstall ${name}?`)) return
    await uninstallTool(id)
  }

  async function handleExport() {
    const json = await exportConfig()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'devtoolshub-config.json'
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg('Exported')
    setTimeout(() => setExportMsg(''), 2500)
  }

  const usedMb = installed.reduce((acc, t) => acc + (parseInt(t.size) || 0), 0)
  const usedStr = usedMb >= 1000 ? `${(usedMb / 1000).toFixed(1)} GB` : `${usedMb} MB`

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-surface-700 bg-surface-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
            <p className="text-sm text-slate-400">Status of all your development tools</p>
          </div>
          <div className="flex items-center gap-2">
            {exportMsg && <span className="text-xs text-emerald-400">{exportMsg}</span>}
            <button onClick={handleExport} className="btn-ghost text-xs inline-flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              Export
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className="btn-ghost text-xs disabled:opacity-50 inline-flex items-center gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Scanning...' : 'Refresh'}
            </button>
            <button onClick={() => navigate('/installer')} className="btn-primary text-xs inline-flex items-center gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Install More
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Installed', val: `${installed.length}/${tools.length}`, cls: 'text-slate-100' },
            { label: 'Updates Available', val: String(outdated.length), cls: 'text-amber-400' },
            { label: 'Errors', val: String(errored.length), cls: 'text-red-400' },
            { label: 'Disk Used', val: usedStr, cls: 'text-primary-400' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-800 rounded-lg p-3 text-center">
              <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mt-3 flex-wrap">
          {(['all', 'installed', 'outdated', 'not-installed', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700'}`}
            >
              {f === 'all' ? `All (${tools.length})` : f === 'not-installed' ? 'Not Installed' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && <span className="ml-1 opacity-60">({tools.filter((t) => getState(t.id).status === f).length})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-800 border-b border-surface-700 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Tool</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Version</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {displayed.map((tool) => {
                const state = getState(tool.id)
                const cfg = statusConfig[state.status]
                const StatusIcon = cfg.Icon
                return (
                  <tr key={tool.id} className="hover:bg-surface-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ToolIcon toolId={tool.id} className="h-5 w-5 text-slate-300" />
                        <div>
                          <div className="font-medium text-slate-200">{tool.name}</div>
                          <div className="text-xs text-slate-500 max-w-[200px] truncate">{tool.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-surface-700 text-slate-400 capitalize">{tool.category.replace('-', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium inline-flex items-center gap-1.5 ${cfg.cls}`}>
                        <StatusIcon className={`h-3.5 w-3.5 ${state.status === 'installing' ? 'animate-spin' : ''}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{state.installedVersion ?? '-'}</td>
                    <td className="px-4 py-3 text-right">
                      {state.status === 'not-installed' && <button onClick={() => navigate('/installer')} className="btn-ghost text-xs py-1 px-2">Install</button>}
                      {state.status === 'outdated' && <button className="btn-ghost text-xs py-1 px-2 text-amber-400">Update</button>}
                      {state.status === 'installed' && (
                        <div className="inline-flex gap-1">
                          {tool.id === 'rtk' && (
                            <button
                              onClick={() => setShowRtkModal(true)}
                              className="btn-ghost text-xs py-1 px-2 text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
                            >
                              <Settings2 className="h-3.5 w-3.5" />
                              Configure
                            </button>
                          )}
                          <button onClick={() => handleUninstall(tool.id, tool.name)} className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300">
                            Uninstall
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex gap-6 mt-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Installed</span>
          <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Update available</span>
          <span className="inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Not installed</span>
          <span className="inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Error</span>
        </div>
      </div>

      {showRtkModal && <RtkConfigModal onClose={() => setShowRtkModal(false)} />}
    </div>
  )
}
