import type { Shape } from '../../../src/types/geometry'
import { fitDrawing } from '../../../src/ui/zoom/zoomMath'
import { describe, expect, it } from 'vitest'
import { panBy, screenToWorld, worldToScreen, zoomAt } from '../../../src/rendering/viewport/viewport'

describe('viewport', () => {
  const viewport = { scale: 100, origin: { x: 25, y: 200 } }

  it('converts from Cartesian coordinates to the screen and back', () => {
    const point = { x: -18.5, y: 42 }
    const screen = worldToScreen(point, viewport)
    expect(screen).toEqual({ x: 6.5, y: 158 })
    expect(screenToWorld(screen, viewport)).toEqual(point)
  })

  it('keeps the cursor over the same point when zoom reaches the limits', () => {
    const anchor = { x: 123, y: 75 }
    for (const [requested, limit] of [[0, 10], [900, 500]]) {
      const next = zoomAt(viewport, requested, anchor)
      expect(next.scale).toBe(limit)
      expect(worldToScreen(screenToWorld(anchor, viewport), next)).toEqual(anchor)
    }
  })

  it('pans by screen delta without changing zoom', () => {
    expect(panBy(viewport, { x: -20, y: 13 })).toEqual({ scale: 100, origin: { x: 5, y: 213 } })
    expect(viewport.origin).toEqual({ x: 25, y: 200 })
  })

  it('fits a complete circle, including its radius', () => {
    const circle: Shape = {
      id: 'circle', type: 'circle', vertices: [{ x: 100, y: 50 }],
      properties: { radius: 25 }, annotations: [],
    }
    const fitted = fitDrawing([circle], { width: 200, height: 100 })
    expect(fitted?.scale).toBe(180)
    expect(fitted && worldToScreen(circle.vertices[0], fitted)).toEqual({ x: 100, y: 50 })
    expect(fitDrawing([], { width: 200, height: 100 })).toBeNull()
  })

})
