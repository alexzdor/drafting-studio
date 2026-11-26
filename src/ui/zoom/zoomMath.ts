import type { Shape } from '../../types/geometry'
import { clampScale, pixelsPerUnit, worldToScreen, type Viewport } from '../../rendering/viewport/viewport'

export const ZOOM_STEP = 10

export function stepScale(scale: number, direction: -1 | 1): number {
  return clampScale(scale + direction * ZOOM_STEP)
}

export function fitDrawing(
  elements: Shape[],
  size: { width: number; height: number },
): Viewport | null {
  if (size.width <= 0 || size.height <= 0) return null

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const shape of elements) {
    const radius = shape.type === 'circle' ? shape.properties.radius : 0
    for (const { x, y } of shape.vertices) {
      minX = Math.min(minX, x - radius)
      maxX = Math.max(maxX, x + radius)
      minY = Math.min(minY, y - radius)
      maxY = Math.max(maxY, y + radius)
    }
  }

  if (minX === Infinity) return null

  const factor = Math.min(
    size.width * 0.9 / Math.max(1, maxX - minX),
    size.height * 0.9 / Math.max(1, maxY - minY),
  )
  const scale = clampScale(Math.floor(factor * 100 / pixelsPerUnit(100)))
  const center = worldToScreen(
    { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    { scale, origin: { x: 0, y: 0 } },
  )
  return {
    scale,
    origin: {
      x: size.width / 2 - center.x,
      y: size.height / 2 - center.y,
    },
  }
}
