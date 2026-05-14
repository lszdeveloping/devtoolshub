import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AppWindow,
  Bot,
  Boxes,
  Box,
  Bug,
  Cloud,
  Code,
  Code2,
  Coffee,
  Container,
  Database,
  Feather,
  FileCode2,
  FolderCog,
  Gamepad2,
  Gauge,
  GitBranch,
  HardDriveDownload,
  LayoutDashboard,
  Monitor,
  MousePointerClick,
  Package,
  Plug,
  Rocket,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Terminal,
  TestTube2,
  Wrench,
} from 'lucide-react'

const TOOL_ICON_MAP: Record<string, LucideIcon> = {
  git: GitBranch,
  'github-desktop': AppWindow,
  'git-lfs': HardDriveDownload,
  nodejs: Code,
  python: Code2,
  golang: Code2,
  rust: Wrench,
  deno: ShieldCheck,
  bun: Activity,
  java: Coffee,
  yarn: Package,
  maven: Feather,
  gradle: Gauge,
  vscode: Monitor,
  'claude-cli': Bot,
  'codex-cli': Terminal,
  rtk: Terminal,
  'github-cli': Terminal,
  postgresql: Database,
  mongodb: Database,
  redis: Database,
  docker: Container,
  'docker-compose': Boxes,
  postman: Send,
  'vcredist-2008': Wrench,
  'vcredist-all': Box,
  'vcredist-2010': Wrench,
  'vcredist-2012': Wrench,
  'vcredist-2013': Wrench,
  'vcredist-2015-2022': Wrench,
  wampserver: Server,
  apache: Server,
  php: FileCode2,
  mysql: Database,
  'mysql-workbench': FolderCog,
  'sqlserver-express': Database,
  mariadb: Database,
  phpmyadmin: LayoutDashboard,
  adminer: LayoutDashboard,
  xdebug: Bug,
}

const AGENT_ICON_MAP: Record<string, LucideIcon> = {
  claude: Bot,
  codex: Terminal,
  gemini: Bot,
  cursor: MousePointerClick,
  windsurf: Cloud,
  cline: Plug,
  kilocode: FileCode2,
  antigravity: Rocket,
  opencode: Monitor,
}

export function ToolIcon({ toolId, className = 'h-5 w-5' }: { toolId: string; className?: string }) {
  const Icon = TOOL_ICON_MAP[toolId] ?? Wrench
  return <Icon className={className} />
}

export function AgentIcon({ agentId, className = 'h-4 w-4' }: { agentId: string; className?: string }) {
  const Icon = AGENT_ICON_MAP[agentId] ?? Terminal
  return <Icon className={className} />
}

export const NAV_ICONS = {
  home: AppWindow,
  installer: Package,
  dashboard: LayoutDashboard,
  settings: Settings,
}

export const PROFILE_ICONS = {
  fullstack: Code2,
  devops: Cloud,
  data: TestTube2,
  game: Gamepad2,
}
