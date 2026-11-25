import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../../../src/config/storageKeys'
import { createEditorState, createEmptyProject, editorReducer } from '../../../src/state/editorReducer'

describe('editor state', () => {
  it('creates independent editable projects with versioned settings and canonical storage keys', () => {
    const first = createEmptyProject()
    const second = createEmptyProject()
    expect(first.projectId).toMatch(/^project-[\da-f-]{36}$/)
    expect(first.projectId).not.toBe(second.projectId)
    expect(first.createdAt).toBe(first.updatedAt)
    expect(first.version).toBe(1)
    expect(first.elements).toEqual([])
    expect(first.groups).toEqual([])
    expect(first.settings.snapping.snapToMidpoints).toBe(false)
    expect(second.settings.snapping).not.toBe(first.settings.snapping)
    expect(STORAGE_KEYS).toEqual({
      autosave: 'chm.autosave',
      autosaveTimestamp: 'chm.autosave.timestamp',
      drawings: 'chm.drawings',
    })
  })

  it('resets the working session when opening another project', () => {
    const first = createEditorState(createEmptyProject())
    const active = { ...first, dirty: true, history: [first.project], historyIndex: 0 }
    const next = createEmptyProject('Контрольный чертёж')
    expect(editorReducer(active, { type: 'REPLACE_PROJECT', project: next })).toEqual(createEditorState(next))
  })
})
