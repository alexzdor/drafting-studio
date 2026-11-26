import type { DialogId, Selection, Tool } from '../types/editor'
import type { Project } from '../types/project'

export type EditorAction =
  | { type: 'REPLACE_PROJECT'; project: Project }
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_SELECTION'; selection: Selection }
  | { type: 'SET_DIALOG'; dialog: DialogId }
  | { type: 'SET_SCALE'; scale: number }
