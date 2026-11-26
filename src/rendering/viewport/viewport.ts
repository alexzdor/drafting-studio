import { MAX_SCALE, MIN_SCALE } from '../../config/constants'
import type { Point } from '../../types/geometry'

export interface Viewport {
  scale: number
  origin: Point
}

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

export function pixelsPerUnit(scale: number): number {
  return 2.5 * (scale / 100)
}

export function worldToScreen(point: Point, viewport: Viewport): Point {
  const factor = pixelsPerUnit(viewport.scale)
  return {
    x: viewport.origin.x + point.x * factor,
    y: viewport.origin.y - point.y * factor,
  }
}

export function screenToWorld(point: Point, viewport: Viewport): Point {
  const factor = pixelsPerUnit(viewport.scale)
  return {
    x: (point.x - viewport.origin.x) / factor,
    y: (viewport.origin.y - point.y) / factor,
  }
}

export function zoomAt(viewport: Viewport, requestedScale: number, anchor: Point): Viewport {
  if (!Number.isFinite(requestedScale)) return viewport
  const scale = clampScale(requestedScale)
  if (scale === viewport.scale) return viewport

  const point = screenToWorld(anchor, viewport)
  const relative = worldToScreen(point, { scale, origin: { x: 0, y: 0 } })
  return { scale, origin: { x: anchor.x - relative.x, y: anchor.y - relative.y } }
}

export function panBy(viewport: Viewport, delta: Point): Viewport {
  return {
    ...viewport,
    origin: { x: viewport.origin.x + delta.x, y: viewport.origin.y + delta.y },
  }
}
