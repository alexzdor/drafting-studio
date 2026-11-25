import { createContext, useReducer, type Dispatch, type ReactNode } from 'react'
import type { EditorState } from '../types/editor'
import type { Project } from '../types/project'
import type { EditorAction } from './actions'
import { createEditorState, editorReducer } from './editorReducer'

export const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
} | null>(null)

export function EditorProvider({
  initialProject,
  children,
}: {
  initialProject: Project
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(editorReducer, initialProject, createEditorState)
  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>
}
