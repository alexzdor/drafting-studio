import { useContext } from 'react'
import { EditorContext } from './EditorContext'

export function useEditor() {
  const editor = useContext(EditorContext)
  if (!editor) throw new Error('useEditor requires an EditorProvider')
  return editor
}
