import type { ShapeType } from './geometry'
import type { Project } from './project'

export type Tool = 'select' | ShapeType | 'annotation'

export interface SnapSettings {
  enabled: boolean
  gridStep: number
  snapToGrid: boolean
  snapToVertices: boolean
  snapToEdges: boolean
  snapToMidpoints: boolean
  snapDistance: number
}

export interface Selection {
  elementIds: string[]
  groupIds: string[]
}

export type DialogId =
  | 'save'
  | 'open'
  | 'export'
  | 'restoreAutosave'
  | 'myDrawings'
  | 'rename'
  | 'delete'
  | 'unsavedChanges'
  | null

export interface EditorState {
  project: Project
  tool: Tool
  selection: Selection
  history: Project[]
  historyIndex: number
  dialog: DialogId
  dirty: boolean
}
