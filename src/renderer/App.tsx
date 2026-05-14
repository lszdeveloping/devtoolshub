import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import InstallerPage from './pages/InstallerPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import { ToolProvider, useTools } from './store/ToolContext'

function AppInner() {
  const { detectTools, detecting } = useTools()

  useEffect(() => {
    detectTools()
  }, [])

  return (
    <div className="flex flex-col h-screen select-none">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-surface-950 relative">
          {detecting && (
            <div className="absolute top-3 right-4 z-10 flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 shadow">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Detecting installed tools...
            </div>
          )}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/installer" element={<InstallerPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToolProvider>
      <AppInner />
    </ToolProvider>
  )
}
