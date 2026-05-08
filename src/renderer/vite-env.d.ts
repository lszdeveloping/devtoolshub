/// <reference types="vite/client" />

import type { Tool, ToolState, InstallResult, InstallProgress, Platform } from '../shared/types'

interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  getPlatform: () => Promise<Platform>
  getVersion: () => Promise<string>
  openUrl: (url: string) => void
  listTools: () => Promise<Tool[]>
  detectTools: () => Promise<ToolState[]>
  installTool: (toolId: string) => Promise<InstallResult>
  uninstallTool: (toolId: string) => Promise<InstallResult>
  onProgress: (cb: (p: InstallProgress) => void) => () => void
  exportConfig: (toolIds: string[]) => Promise<string>
  configureRtk: (agents: string[]) => Promise<{ success: boolean; results: { agent: string; success: boolean; error?: string }[] }>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
