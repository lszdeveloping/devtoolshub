export default function TitleBar() {
  const isElectron = typeof window.api !== 'undefined'

  return (
    <div
      className="flex items-center justify-between h-10 bg-surface-900 border-b border-surface-700 px-4 flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">⚙️</span>
        <span className="text-sm font-semibold text-slate-200">DevTools Hub</span>
        <span className="badge bg-primary-900 text-primary-300">v1.0.0</span>
      </div>

      {isElectron && (
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => window.api.minimize()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Minimize"
          >
            <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2" rx="1"/></svg>
          </button>
          <button
            onClick={() => window.api.maximize()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Maximize"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="0.75" y="0.75" width="9.5" height="9.5" rx="1.5"/></svg>
          </button>
          <button
            onClick={() => window.api.close()}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-600 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="10" y2="10"/><line x1="10" y1="1" x2="1" y2="10"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}
