export type Platform = 'windows' | 'macos' | 'linux'

export type ToolCategory =
  | 'version-control'
  | 'runtime'
  | 'package-manager'
  | 'editor'
  | 'cli'
  | 'database'
  | 'devops'
  | 'testing'
  | 'web-server'
  | 'system'

export type ToolStatus = 'installed' | 'outdated' | 'not-installed' | 'installing' | 'error'

export interface Tool {
  id: string
  name: string
  description: string
  category: ToolCategory
  platforms: Platform[]
  version: string
  size: string
  icon: string
  installers: Partial<Record<Platform, string>>
  verifyCommand: string
  wingetId?: string
  brewId?: string
  aptId?: string
  pathHint?: string
  dependsOn?: string[]
}

export interface ToolState {
  id: string
  status: ToolStatus
  installedVersion?: string
  latestVersion?: string
  progress?: number
  error?: string
}

export interface InstallJob {
  toolId: string
  platform: Platform
}

export interface InstallProgress {
  toolId: string
  progress: number
  status: ToolStatus
  message: string
}

export interface InstallResult {
  toolId: string
  success: boolean
  error?: string
  logPath?: string
}

export interface ExportConfig {
  version: string
  exportedAt: string
  tools: string[]
}
