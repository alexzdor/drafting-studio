import {
  DEFAULT_GRID_STEP,
  DEFAULT_SCALE,
  DEFAULT_SNAP_DISTANCE,
  PROJECT_VERSION,
} from '../config/constants'
import { clampScale } from '../rendering/viewport/viewport'
import type { EditorState } from '../types/editor'
import type { Project } from '../types/project'
import type { EditorAction } from './actions'

export function createEmptyProject(projectName = 'Новый чертёж'): Project {
  const timestamp = new Date().toISOString()
  return {
    projectId: `project-${globalThis.crypto.randomUUID()}`,
    projectName,
    version: PROJECT_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    elements: [],
    groups: [],
    settings: {
      scale: DEFAULT_SCALE,
      gridEnabled: true,
      snapping: {
        enabled: true,
        gridStep: DEFAULT_GRID_STEP,
        snapToGrid: true,
        snapToVertices: true,
        snapToEdges: false,
        snapToMidpoints: false,
        snapDistance: DEFAULT_SNAP_DISTANCE,
      },
    },
  }
}

export function createEditorState(project: Project): EditorState {
  return {
    project,
    tool: 'select',
    selection: { elementIds: [], groupIds: [] },
    history: [],
    historyIndex: -1,
    dialog: null,
    dirty: false,
  }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'REPLACE_PROJECT':
      return createEditorState(action.project)
    case 'SET_TOOL':
      return { ...state, tool: action.tool }
    case 'SET_SELECTION':
      return { ...state, selection: action.selection }
    case 'SET_DIALOG':
      return { ...state, dialog: action.dialog }
    case 'SET_SCALE': {
      if (!Number.isFinite(action.scale)) return state
      const scale = clampScale(action.scale)
      if (scale === state.project.settings.scale) return state
      return { ...state, project: { ...state.project, settings: { ...state.project.settings, scale } } }
    }
  }
}
