import { useNavigate } from 'react-router-dom'
import { useTools } from '../store/ToolContext'

const profiles = [
  { name: 'Full Stack Web', icon: '👨‍💻', tools: ['git', 'nodejs', 'python', 'vscode', 'postgresql', 'docker', 'claude-cli'] },
  { name: 'DevOps Engineer', icon: '☁️', tools: ['git', 'golang', 'java', 'docker', 'docker-compose', 'postgresql', 'mongodb', 'redis'] },
  { name: 'Data Scientist', icon: '🔬', tools: ['python', 'postgresql', 'mongodb', 'git', 'claude-cli'] },
  { name: 'Game Developer', icon: '🎮', tools: ['git', 'nodejs', 'rust', 'golang', 'vscode', 'docker'] },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { tools, getState, selectAll, clearSelected, platform } = useTools()

  const platformTools = tools.filter(t => t.platforms.includes(platform))
  const installed = platformTools.filter(t => getState(t.id).status === 'installed').length
  const updates   = platformTools.filter(t => getState(t.id).status === 'outdated').length

  function applyProfile(toolIds: string[]) {
    clearSelected()
    const validIds = toolIds.filter(id => tools.some(t => t.id === id && t.platforms.includes(platform)))
    selectAll(validIds)
    navigate('/installer')
  }

  const platformLabel: Record<string, string> = {
    windows: '🪟 Windows',
    macos: '🍎 macOS',
    linux: '🐧 Linux',
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="text-6xl">⚙️</div>
        <h1 className="text-3xl font-bold text-slate-100">DevTools Hub</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Install and manage your development tools automatically.
          Choose exactly what you need — nothing is forced.
        </p>
        <div className="inline-flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-full px-4 py-1.5 text-sm text-slate-300">
          <span>{platformLabel[platform] ?? platform}</span>
          <span className="text-slate-500">detected</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="text-3xl font-bold text-primary-400">{platformTools.length}</div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/installer')}
          className="card p-5 text-left hover:border-primary-600 hover:bg-surface-800 transition-all group cursor-pointer"
        >
          <div className="text-2xl mb-3">📦</div>
          <div className="font-semibold text-slate-200 group-hover:text-primary-300">Install Tools</div>
          <div className="text-sm text-slate-500 mt-1">Select and install the tools you need</div>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="card p-5 text-left hover:border-primary-600 hover:bg-surface-800 transition-all group cursor-pointer"
        >
          <div className="text-2xl mb-3">📊</div>
          <div className="font-semibold text-slate-200 group-hover:text-primary-300">View Dashboard</div>
          <div className="text-sm text-slate-500 mt-1">Monitor all installed tools and versions</div>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="card p-5 text-left hover:border-primary-600 hover:bg-surface-800 transition-all group cursor-pointer"
        >
          <div className="text-2xl mb-3">⚙️</div>
          <div className="font-semibold text-slate-200 group-hover:text-primary-300">Settings</div>
          <div className="text-sm text-slate-500 mt-1">Manage PATH, preferences and config</div>
        </button>
      </div>

      {/* Profiles */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Suggested Profiles</h2>
        <div className="grid grid-cols-2 gap-3">
          {profiles.map(profile => (
            <button
              key={profile.name}
              onClick={() => applyProfile(profile.tools)}
              className="card p-4 text-left hover:border-primary-600 hover:bg-surface-800 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{profile.icon}</span>
                <span className="font-medium text-slate-200 group-hover:text-primary-300">{profile.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.tools.slice(0, 5).map(id => {
                  const tool = tools.find(t => t.id === id)
                  return tool ? (
                    <span key={id} className="badge bg-surface-800 text-slate-400">{tool.icon} {tool.name}</span>
                  ) : null
                })}
                {profile.tools.length > 5 && (
                  <span className="badge bg-surface-800 text-slate-500">+{profile.tools.length - 5} more</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
