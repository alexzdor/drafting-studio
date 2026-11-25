import { useId } from 'react'
import type { Viewport } from '../viewport/viewport'

export function GridLayer({ step, viewport }: { step: number; viewport: Viewport }) {
  const patternId = useId()
  const spacing = step * (viewport.scale / 100)
  if (!Number.isFinite(spacing) || spacing <= 0) return null

  return (
    <g pointerEvents="none" aria-hidden="true">
      <defs>
        <pattern id={patternId} width={spacing} height={spacing}
          x={viewport.origin.x} y={viewport.origin.y} patternUnits="userSpaceOnUse">
          <path d={`M ${spacing} 0 H 0 V ${spacing}`} fill="none" stroke="#64748b" strokeOpacity={0.24} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </g>
  )
}
