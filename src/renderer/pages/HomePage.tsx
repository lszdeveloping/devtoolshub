import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Settings, Wrench } from 'lucide-react'
import { useTools } from '../store/ToolContext'
import { PROFILE_ICONS, ToolIcon } from '../components/icons'

const profiles = [
  { id: 'fullstack', name: 'Full Stack Web', tools: ['git', 'nodejs', 'python', 'vscode', 'postgresql', 'docker', 'claude-cli'] },
  { id: 'devops', name: 'DevOps Engineer', tools: ['git', 'golang', 'java', 'docker', 'docker-compose', 'postgresql', 'mongodb', 'redis'] },
  { id: 'data', name: 'Data Scientist', tools: ['python', 'postgresql', 'mongodb', 'git', 'claude-cli'] },
  { id: 'game', name: 'Game Developer', tools: ['git', 'nodejs', 'rust', 'golang', 'vscode', 'docker'] },
] as const

export default function HomePage() {
  const navigate = useNavigate()
  const { tools, getState, selectAll, clearSelected } = useTools()

  const installed = tools.filter((t) => getState(t.id).status === 'installed').length
  const updates = tools.filter((t) => getState(t.id).status === 'outdated').length

  function applyProfile(toolIds: string[]) {
    clearSelected()
    const validIds = toolIds.filter((id) => tools.some((t) => t.id === id))
    selectAll(validIds)
    navigate('/installer')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-surface-800 border border-surface-700">
          <Wrench className="h-7 w-7 text-primary-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100">DevTools Hub</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Install and manage your development tools automatically.
          Choose exactly what you need - nothing is forced.
        </p>
        <div className="inline-flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-full px-4 py-1.5 text-sm text-slate-300">
          <span>Windows</span>
          <span className="text-slate-500">detected</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-primary-400">{tools.length}</div>
          <div className="text-sm text-slate-400 mt-1">Tools Available</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-emerald-400">{installed}</div>
          <div className="text-sm text-slate-400 mt-1">Installed</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-amber-400">{updates}</div>
          <div className="text-sm text-slate-400 mt-1">Updates Available</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/installer')}
          className="card p-5 text-left hover:border-primary-600 hover:bg-surface-800 transition-all group cursor-pointer"
        >
          <Package className="h-6 w-6 mb-3 text-slate-300" />
          <div className="font-semibold text-slate-200 group-hover:text-primary-300">Install Tools</div>
          <div className="text-sm text-slate-500 mt-1">Select and install the tools you need</div>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="card p-5 text-left hover:border-primary-600 hover:bg-surface-800 transition-all group cursor-pointer"
        >
          <LayoutDashboard className="h-6 w-6 mb-3 text-slate-300" />
          <div className="font-semibold text-slate-200 group-hover:text-primary-300">View Dashboard</div>
          <div className="text-sm text-slate-500 mt-1">Monitor all installed tools and versions</div>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="card p-5 text-left hover:border-primary-600 hover:bg-surface-800 transition-all group cursor-pointer"
        >
          <Settings className="h-6 w-6 mb-3 text-slate-300" />
          <div className="font-semibold text-slate-200 group-hover:text-primary-300">Settings</div>
          <div className="text-sm text-slate-500 mt-1">Manage PATH, preferences and config</div>
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Suggested Profiles</h2>
        <div className="grid grid-cols-2 gap-3">
          {profiles.map((profile) => {
            const ProfileIcon = PROFILE_ICONS[profile.id]
            return (
              <button
                key={profile.name}
                onClick={() => applyProfile([...profile.tools])}
                className="card p-4 text-left hover:border-primary-600 hover:bg-surface-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <ProfileIcon className="h-5 w-5 text-slate-300" />
                  <span className="font-medium text-slate-200 group-hover:text-primary-300">{profile.name}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.tools.slice(0, 5).map((id) => {
                    const tool = tools.find((t) => t.id === id)
                    return tool ? (
                      <span key={id} className="badge bg-surface-800 text-slate-400 inline-flex items-center gap-1">
                        <ToolIcon toolId={tool.id} className="h-3.5 w-3.5" />
                        {tool.name}
                      </span>
                    ) : null
                  })}
                  {profile.tools.length > 5 && <span className="badge bg-surface-800 text-slate-500">+{profile.tools.length - 5} more</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
