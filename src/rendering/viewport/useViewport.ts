import { useState } from 'react'
import type { Point } from '../../types/geometry'
import { panBy, zoomAt, type Viewport } from './viewport'

export function useViewport(scale: number, height: number, setScale: (scale: number) => void) {
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const viewport: Viewport = { scale, origin: { x: offset.x, y: height + offset.y } }

  function zoomTo(nextScale: number, anchor: Point) {
    const next = zoomAt(viewport, nextScale, anchor)
    if (next === viewport) return
    setView(next)
  }

  function setView(next: Viewport) {
    setOffset({ x: next.origin.x, y: next.origin.y - height })
    setScale(next.scale)
  }

  function pan(delta: Point) {
    setOffset((previous) => panBy({ scale, origin: previous }, delta).origin)
  }

  return { viewport, zoomTo, pan, setView }
}
