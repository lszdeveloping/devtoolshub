import { NavLink } from 'react-router-dom'
import { useTools } from '../store/ToolContext'
import { NAV_ICONS } from './icons'

const navItems = [
  { to: '/', icon: NAV_ICONS.home, label: 'Home' },
  { to: '/installer', icon: NAV_ICONS.installer, label: 'Installer' },
  { to: '/dashboard', icon: NAV_ICONS.dashboard, label: 'Dashboard' },
  { to: '/settings', icon: NAV_ICONS.settings, label: 'Settings' },
]

export default function Sidebar() {
  const { tools, getState } = useTools()

  const installed = tools.filter((t) => getState(t.id).status === 'installed').length
  const updates = tools.filter((t) => getState(t.id).status === 'outdated').length

  return (
    <aside className="w-56 flex-shrink-0 bg-surface-900 border-r border-surface-700 flex flex-col">
      <nav className="flex-1 p-2 space-y-1 pt-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
               ${isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-surface-800'}`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-surface-700 space-y-2">
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Status</div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Installed</span>
          <span className="text-emerald-400 font-semibold">
            {installed}/{tools.length}
          </span>
        </div>
        {updates > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Updates</span>
            <span className="text-amber-400 font-semibold">{updates}</span>
          </div>
        )}
        <div className="w-full bg-surface-800 rounded-full h-1.5 mt-1">
          <div
            className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: tools.length ? `${(installed / tools.length) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </aside>
  )
}
