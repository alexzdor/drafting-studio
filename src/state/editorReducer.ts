import {
  DEFAULT_GRID_STEP,
  DEFAULT_SCALE,
  DEFAULT_SNAP_DISTANCE,
  PROJECT_VERSION,
  MAX_SHAPES,
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
    case 'ADD_SHAPE':
    case 'UPDATE_SHAPE': {
      const { elements } = state.project
      const index = elements.findIndex(element => element.id === action.shape.id)
      const adding = action.type === 'ADD_SHAPE'
      if (adding ? index !== -1 || elements.length >= MAX_SHAPES : index === -1) return state
      return {
        ...state,
        tool: adding ? 'select' : state.tool,
        selection: adding ? { elementIds: [action.shape.id], groupIds: [] } : state.selection,
        dirty: true,
        project: {
          ...state.project,
          updatedAt: action.updatedAt,
          elements: adding ? [...elements, action.shape] : elements.map((element, position) =>
            position === index ? action.shape : element),
        },
      }
    }
    case 'SET_SCALE': {
      if (!Number.isFinite(action.scale)) return state
      const scale = clampScale(action.scale)
      if (scale === state.project.settings.scale) return state
      return { ...state, project: { ...state.project, settings: { ...state.project.settings, scale } } }
    }
  }
}
