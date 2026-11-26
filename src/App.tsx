import { useState } from 'react'
import { EditorProvider } from './state/EditorContext'
import { createEmptyProject } from './state/editorReducer'
import { useEditor } from './state/useEditor'
import { ShapeEditor } from './ui/shapeEditor/ShapeEditor'

function EditorShell() {
  const { state } = useEditor()

  return (
    <main className="app">
      <header>
        <h1>Чертёжная Мастерская</h1>
        <p>{state.project.projectName}</p>
      </header>
      <ShapeEditor key={state.project.projectId} />
    </main>
  )
}

export default function App() {
  const [initialProject] = useState(createEmptyProject)
  return (
    <EditorProvider initialProject={initialProject}>
      <EditorShell />
    </EditorProvider>
  )
}
