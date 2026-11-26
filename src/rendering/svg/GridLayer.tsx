import { pixelsPerUnit, type Viewport } from '../viewport/viewport'

const MIN_GRID_SPACING = 10

export function GridLayer({ step, viewport, width, height }: {
  step: number
  viewport: Viewport
  width: number
  height: number
}) {
  let spacing = step * pixelsPerUnit(viewport.scale)
  if (!Number.isFinite(spacing) || spacing <= 0 || width <= 0 || height <= 0) return null

  // At low zoom, draw every second grid line as often as needed to keep cells readable.
  while (spacing < MIN_GRID_SPACING) spacing *= 2

  const { x, y } = viewport.origin
  const lines: string[] = []
  for (let column = x - Math.floor(x / spacing) * spacing; column < width; column += spacing) {
    lines.push(`M ${column} 0 V ${height}`)
  }
  for (let row = y - Math.floor(y / spacing) * spacing; row < height; row += spacing) {
    lines.push(`M 0 ${row} H ${width}`)
  }

  return (
    <path d={lines.join(' ')} fill="none" stroke="#64748b" strokeOpacity={0.60}
      shapeRendering="crispEdges" pointerEvents="none" aria-hidden="true" />
  )
}
