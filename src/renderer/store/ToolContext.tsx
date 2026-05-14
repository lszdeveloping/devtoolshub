import {
  createContext, useContext, useReducer, useCallback,
  type ReactNode
} from 'react'
import { TOOLS } from '../../shared/tools-data'
import type { Tool, ToolState, InstallProgress, InstallResult } from '../../shared/types'

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  tools: Tool[]
  states: Record<string, ToolState>
  selected: Set<string>
  detecting: boolean
}

const initialState: State = {
  tools: TOOLS,
  states: {},
  selected: new Set(),
  detecting: false,
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_STATES'; states: ToolState[] }
  | { type: 'SET_TOOL_STATE'; state: ToolState }
  | { type: 'TOGGLE_SELECT'; id: string }
  | { type: 'SELECT_ALL'; ids: string[] }
  | { type: 'CLEAR_SELECTED' }
  | { type: 'SET_DETECTING'; value: boolean }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STATES': {
      const map: Record<string, ToolState> = { ...state.states }
      for (const s of action.states) map[s.id] = s
      return { ...state, states: map, detecting: false }
    }

    case 'SET_TOOL_STATE':
      return {
        ...state,
        states: { ...state.states, [action.state.id]: action.state },
      }

    case 'TOGGLE_SELECT': {
      const next = new Set(state.selected)
      if (next.has(action.id)) next.delete(action.id)
      else next.add(action.id)
      return { ...state, selected: next }
    }

    case 'SELECT_ALL': {
      const next = new Set(state.selected)
      action.ids.forEach(id => next.add(id))
      return { ...state, selected: next }
    }

    case 'CLEAR_SELECTED':
      return { ...state, selected: new Set() }

    case 'SET_DETECTING':
      return { ...state, detecting: action.value }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ContextValue {
  tools: Tool[]
  states: Record<string, ToolState>
  selected: Set<string>
  detecting: boolean
  getState: (id: string) => ToolState
  detectTools: () => Promise<void>
  toggleSelect: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelected: () => void
  installSelected: (onProgress?: (p: InstallProgress) => void) => Promise<InstallResult[]>
  uninstallTool: (id: string) => Promise<InstallResult>
  exportConfig: () => Promise<string>
}

const ToolContext = createContext<ContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToolProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const hasApi = typeof window.api !== 'undefined'

  const detectTools = useCallback(async () => {
    if (!hasApi) return
    dispatch({ type: 'SET_DETECTING', value: true })
    try {
      const detected = await window.api.detectTools()
      dispatch({ type: 'SET_STATES', states: detected })
    } catch {
      dispatch({ type: 'SET_DETECTING', value: false })
    }
  }, [hasApi])

  const getState = useCallback((id: string): ToolState => {
    return state.states[id] ?? { id, status: 'not-installed' }
  }, [state.states])

  const toggleSelect = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_SELECT', id })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_ALL', ids })
  }, [])

  const clearSelected = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED' })
  }, [])

  const installSelected = useCallback(async (onProgress?: (p: InstallProgress) => void): Promise<InstallResult[]> => {
    if (!hasApi) return []
    const ids = [...state.selected].filter(id => {
      const s = state.states[id]
      return !s || s.status !== 'installed'
    })
    const results: InstallResult[] = []

    let unsub: (() => void) | undefined
    if (onProgress) unsub = window.api.onProgress(onProgress)

    try {
      for (const id of ids) {
        dispatch({ type: 'SET_TOOL_STATE', state: { id, status: 'installing', progress: 0 } })
        try {
          const result = await window.api.installTool(id)
          dispatch({
            type: 'SET_TOOL_STATE',
            state: { id, status: result.success ? 'installed' : 'error', error: result.error },
          })
          if (result.success) dispatch({ type: 'TOGGLE_SELECT', id })
          results.push(result)
        } catch (err) {
          const message = (err as Error)?.message ?? 'Unknown error'
          dispatch({ type: 'SET_TOOL_STATE', state: { id, status: 'error', error: message } })
          results.push({ toolId: id, success: false, error: message })
        }
      }
    } finally {
      if (unsub) unsub()
    }

    return results
  }, [hasApi, state.selected, state.states])

  const uninstallTool = useCallback(async (id: string): Promise<InstallResult> => {
    if (!hasApi) return { toolId: id, success: false, error: 'No Electron API' }
    dispatch({ type: 'SET_TOOL_STATE', state: { id, status: 'installing' } })
    const result = await window.api.uninstallTool(id)
    dispatch({ type: 'SET_TOOL_STATE', state: { id, status: result.success ? 'not-installed' : 'error', error: result.error } })
    return result
  }, [hasApi])

  const exportConfig = useCallback(async (): Promise<string> => {
    const installedIds = state.tools
      .filter(t => (state.states[t.id]?.status ?? 'not-installed') === 'installed')
      .map(t => t.id)
    if (hasApi) return window.api.exportConfig(installedIds)
    return JSON.stringify({ version: '1.0.0', exportedAt: new Date().toISOString(), tools: installedIds }, null, 2)
  }, [hasApi, state.tools, state.states])

  return (
    <ToolContext.Provider value={{
      tools: state.tools,
      states: state.states,
      selected: state.selected,
      detecting: state.detecting,
      getState,
      detectTools,
      toggleSelect,
      selectAll,
      clearSelected,
      installSelected,
      uninstallTool,
      exportConfig,
    }}>
      {children}
    </ToolContext.Provider>
  )
}

export function useTools() {
  const ctx = useContext(ToolContext)
  if (!ctx) throw new Error('useTools must be inside ToolProvider')
  return ctx
}
