import { Minimize2, Square, Wrench, X } from 'lucide-react'
import type { CSSProperties } from 'react'

export default function TitleBar() {
  const isElectron = typeof window.api !== 'undefined'

  return (
    <div
      className="flex items-center justify-between h-10 bg-surface-900 border-b border-surface-700 px-4 flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as CSSProperties}
    >
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary-400" />
        <span className="text-sm font-semibold text-slate-200">DevTools Hub</span>
        <span className="badge bg-primary-900 text-primary-300">v1.0.0</span>
      </div>

      {isElectron && (
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}>
          <button
            onClick={() => window.api.minimize()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => window.api.maximize()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Maximize"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => window.api.close()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-600 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
