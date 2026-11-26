import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { MAX_SHAPES } from '../../config/constants'
import { buildShape, rebuildShape, shapeTemplates } from '../../geometry/shapeGeometry'
import { worldToScreen, type Viewport } from '../../rendering/viewport/viewport'
import { useEditor } from '../../state/useEditor'
import type { Point, Shape, ShapeType } from '../../types/geometry'
import { Workspace } from '../workspace/Workspace'
import { ShapePropertiesPanel } from './ShapePropertiesPanel'

type BuildDraft = { type: ShapeType; points: Point[]; cursor?: Point }
type VertexDrag = { pointerId: number; shape: Shape; index: number; origin: Point; start: Point }

export function ShapeEditor() {
  const { state, dispatch } = useEditor()
  const { elements } = state.project
  const selected = elements.find(shape => shape.id === state.selection.elementIds[0])
  const [draft, setDraft] = useState<BuildDraft>()
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<Shape>()
  const drag = useRef<VertexDrag | null>(null)

  useEffect(() => {
    if (!draft) return
    function onEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setDraft(undefined)
      setMessage('')
      dispatch({ type: 'SET_TOOL', tool: 'select' })
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [Boolean(draft), dispatch])

  function select(id?: string) {
    dispatch({ type: 'SET_SELECTION', selection: { elementIds: id ? [id] : [], groupIds: [] } })
  }

  function save(shape: Shape, type: 'ADD_SHAPE' | 'UPDATE_SHAPE') {
    dispatch({ type, shape, updatedAt: new Date().toISOString() })
  }

  function finish(type: ShapeType, points: Point[]) {
    if (elements.length >= MAX_SHAPES) {
      setMessage('На чертеже уже 100 фигур.')
      return
    }
    const shape = buildShape(type, points, crypto.randomUUID())
    if (!shape) {
      setMessage('Фигура вырождена. Проверьте точки построения.')
      return
    }
    save(shape, 'ADD_SHAPE')
    setDraft(undefined)
    setMessage('')
  }

  function onPointer(
    phase: 'down' | 'move' | 'up' | 'cancel',
    point: Point,
    event: PointerEvent<SVGSVGElement>,
  ) {
    const active = drag.current
    if (active) {
      if (event.pointerId !== active.pointerId || phase === 'down') return
      if (phase !== 'move') {
        drag.current = null
        setPreview(undefined)
      }
      if (phase === 'cancel') return

      const vertices = active.shape.vertices.map((vertex, index) => index === active.index
        ? { x: active.origin.x + point.x - active.start.x, y: active.origin.y + point.y - active.start.y }
        : vertex)
      const shape = rebuildShape(active.shape, vertices)
      if (phase === 'move') setPreview(shape ?? undefined)
      else if (!shape) setMessage('Вершину нельзя переместить в эту точку.')
      else if (point.x !== active.start.x || point.y !== active.start.y) save(shape, 'UPDATE_SHAPE')
      return
    }

    if (draft) {
      if (phase === 'move') setDraft({ ...draft, cursor: point })
      if (phase !== 'down' || event.button !== 0) return
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX >= rect.right
        || event.clientY < rect.top || event.clientY >= rect.bottom) return
      const points = [...draft.points, point]
      if (draft.type !== 'polygon' && points.length === shapeTemplates[draft.type].steps.length) {
        finish(draft.type, points)
      } else {
        setMessage('')
        setDraft({ ...draft, points })
      }
      return
    }

    if (phase !== 'down' || event.button !== 0 || !(event.target instanceof Element)) return
    setMessage('')
    const marker = event.target.closest('[data-vertex-index]')
    if (marker && selected) {
      const index = Number(marker.getAttribute('data-vertex-index'))
      const origin = selected.vertices[index]
      if (origin) {
        drag.current = { pointerId: event.pointerId, shape: selected, index, origin, start: point }
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      return
    }
    select(event.target.closest('[data-element-id]')?.getAttribute('data-element-id') ?? undefined)
  }

  function renderOverlay(viewport: Viewport) {
    if (draft) {
      const points = draft.points.map(point => worldToScreen(point, viewport))
      const cursor = draft.cursor && worldToScreen(draft.cursor, viewport)
      const [first] = points
      const previewPoints = cursor ? [...points, cursor] : points
      return (
        <g className="build-preview" pointerEvents="none" aria-hidden="true">
          {draft.type === 'circle' && first && cursor
            ? <circle cx={first.x} cy={first.y} r={Math.hypot(cursor.x - first.x, cursor.y - first.y)} />
            : <polyline points={previewPoints.map(({ x, y }) => `${x},${y}`).join(' ')} />}
          {points.map(({ x, y }, index) => <circle key={index} cx={x} cy={y} r={3} />)}
        </g>
      )
    }
    return (preview ?? selected)?.vertices.map((point, index) => {
      const { x, y } = worldToScreen(point, viewport)
      return <circle key={index} cx={x} cy={y} r={6} className="vertex-handle" data-vertex-index={index} />
    })
  }

  return (
    <div className="shape-editor">
      <aside className="editor-panel">
        <h2>Фигуры</h2>
        <div className="shape-templates">
          {(Object.keys(shapeTemplates) as ShapeType[]).map(type => (
            <button key={type} type="button" aria-pressed={draft?.type === type} onClick={() => {
              setMessage('')
              select()
              dispatch({ type: 'SET_TOOL', tool: type })
              setDraft({ type, points: [] })
            }}>{shapeTemplates[type].label}</button>
          ))}
        </div>
        <p>Фигур: {elements.length} / {MAX_SHAPES}</p>
        {draft && (
          <div>
            <p role="status">{draft.type === 'polygon'
              ? `Укажите вершину ${draft.points.length + 1}. Для завершения нужны хотя бы три вершины.`
              : `Шаг ${draft.points.length + 1} из ${shapeTemplates[draft.type].steps.length}: ${shapeTemplates[draft.type].steps[draft.points.length]}.`}</p>
            {draft.type === 'polygon' && <button type="button" disabled={draft.points.length < 3}
              onClick={() => finish(draft.type, draft.points)}>Завершить</button>}
            <button type="button" onClick={() => {
              setDraft(undefined)
              setMessage('')
              dispatch({ type: 'SET_TOOL', tool: 'select' })
            }}>Отмена (Esc)</button>
          </div>
        )}
        {message && <p role="alert">{message}</p>}
      </aside>

      <Workspace panEnabled={!draft} onWorkspacePointer={onPointer} renderOverlay={renderOverlay} previewShape={preview} />

      <aside className="editor-panel">
        <h2>Свойства</h2>
        {selected && !draft
          ? <ShapePropertiesPanel key={JSON.stringify(selected)} shape={selected} preview={preview}
              onApply={shape => save(shape, 'UPDATE_SHAPE')} />
          : <p>Выберите фигуру на рабочей области.</p>}
      </aside>
    </div>
  )
}
