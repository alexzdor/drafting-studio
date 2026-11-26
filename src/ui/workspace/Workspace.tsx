import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { DrawingSvg } from '../../rendering/svg/DrawingSvg'
import { useViewport } from '../../rendering/viewport/useViewport'
import { screenToWorld, type Viewport } from '../../rendering/viewport/viewport'
import { useEditor } from '../../state/useEditor'
import type { Point, Shape } from '../../types/geometry'
import { ZoomControl } from '../zoom/ZoomControl'
import { fitDrawing, stepScale } from '../zoom/zoomMath'

type WorkspacePointer = (type: 'down' | 'move' | 'up' | 'cancel', point: Point, event: PointerEvent<SVGSVGElement>) => void

export function Workspace({
  panEnabled = true,
  onWorkspacePointer,
  renderOverlay,
  previewShape,
}: {
  panEnabled?: boolean
  onWorkspacePointer?: WorkspacePointer
  previewShape?: Shape
  renderOverlay?: (viewport: Viewport) => ReactNode
}) {
  const { state, dispatch } = useEditor()
  const { elements, settings } = state.project
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ pointerId: number; lastClient: Point } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const { viewport, zoomTo, pan, setView } = useViewport(
    settings.scale,
    size.height,
    (scale) => dispatch({ type: 'SET_SCALE', scale }),
  )

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    function onWheel(event: WheelEvent) {
      if (event.deltaY === 0 || !svg) return
      event.preventDefault()
      const rect = svg.getBoundingClientRect()
      zoomTo(stepScale(settings.scale, event.deltaY < 0 ? 1 : -1), {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [settings.scale, zoomTo])

  function forward(type: Parameters<WorkspacePointer>[0], event: PointerEvent<SVGSVGElement>) {
    if (!onWorkspacePointer) return
    const rect = event.currentTarget.getBoundingClientRect()
    const point = screenToWorld({ x: event.clientX - rect.left, y: event.clientY - rect.top }, viewport)
    onWorkspacePointer(type, point, event)
  }

  return (
    <section className="workspace" aria-label="Редактор чертежа">
      <DrawingSvg
        ref={svgRef}
        className="drawing-canvas"
        aria-label="Рабочая область"
        viewport={viewport}
        elements={previewShape ? elements.map(shape => shape.id === previewShape.id ? previewShape : shape) : elements}
        grid={settings.gridEnabled ? { step: settings.snapping.gridStep, ...size } : undefined}
        overlay={renderOverlay?.(viewport)}
        onPointerDown={(event) => {
          if (drag.current) return
          if (panEnabled && event.button === 0 && event.target === event.currentTarget) {
            drag.current = { pointerId: event.pointerId, lastClient: { x: event.clientX, y: event.clientY } }
            event.currentTarget.setPointerCapture(event.pointerId)
          }
          forward('down', event)
        }}
        onPointerMove={(event) => {
          const active = drag.current
          if (active?.pointerId !== event.pointerId) {
            if (!active) forward('move', event)
            return
          }
          pan({ x: event.clientX - active.lastClient.x, y: event.clientY - active.lastClient.y })
          active.lastClient = { x: event.clientX, y: event.clientY }
        }}
        onPointerUp={(event) => {
          if (drag.current?.pointerId === event.pointerId) drag.current = null
          else if (!drag.current) forward('up', event)
        }}
        onPointerCancel={(event) => {
          if (drag.current?.pointerId === event.pointerId) drag.current = null
          else if (!drag.current) forward('cancel', event)
        }}
        onLostPointerCapture={(event) => {
          if (drag.current?.pointerId === event.pointerId) drag.current = null
          else forward('cancel', event)
        }}
      />
      <ZoomControl scale={settings.scale} onZoom={(scale) => (
        zoomTo(scale, { x: size.width / 2, y: size.height / 2 })
      )} onFit={elements.length > 0 ? () => {
        const fitted = fitDrawing(elements, size)
        if (fitted) setView(fitted)
      } : undefined} />
    </section>
  )
}
