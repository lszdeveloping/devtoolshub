import { contextBridge, ipcRenderer } from 'electron'
import type { Tool, ToolState, InstallResult, InstallProgress } from '../shared/types'

contextBridge.exposeInMainWorld('api', {
  // Window
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  // App
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  openUrl: (url: string) => ipcRenderer.send('app:openUrl', url),

  // Tools
  listTools: (): Promise<Tool[]> => ipcRenderer.invoke('tools:list'),
  detectTools: (): Promise<ToolState[]> => ipcRenderer.invoke('tools:detect'),
  installTool: (toolId: string): Promise<InstallResult> => ipcRenderer.invoke('tools:install', toolId),
  uninstallTool: (toolId: string): Promise<InstallResult> => ipcRenderer.invoke('tools:uninstall', toolId),

  // Progress listener
  onProgress: (cb: (progress: InstallProgress) => void) => {
    const listener = (_: Electron.IpcRendererEvent, data: InstallProgress) => cb(data)
    ipcRenderer.on('tools:progress', listener)
    return () => ipcRenderer.removeListener('tools:progress', listener)
  },

  // Config
  exportConfig: (toolIds: string[]): Promise<string> => ipcRenderer.invoke('config:export', toolIds),

  // Logs
  openLogFile: (logPath: string) => ipcRenderer.send('app:openPath', logPath),
  getInstallLogs: (): Promise<{ name: string; path: string }[]> => ipcRenderer.invoke('logs:list'),

  // RTK
  configureRtk: (agents: string[]): Promise<{ success: boolean; results: { agent: string; success: boolean; error?: string }[] }> =>
    ipcRenderer.invoke('rtk:configure', agents),
})
