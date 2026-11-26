import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { Shape } from '../../types/geometry'
import { pixelsPerUnit, type Viewport } from '../viewport/viewport'
import { GridLayer } from './GridLayer'
import { ShapeView } from './ShapeView'

export function DrawingSvg({
  viewport,
  elements,
  grid,
  overlay,
  ...svgProps
}: ComponentPropsWithRef<'svg'> & {
  viewport: Viewport
  elements: Shape[]
  grid?: { step: number; width: number; height: number }
  overlay?: ReactNode
}) {
  const factor = pixelsPerUnit(viewport.scale)
  return (
    <svg {...svgProps}>
      {grid && <GridLayer {...grid} viewport={viewport} />}
      <g transform={`translate(${viewport.origin.x} ${viewport.origin.y}) scale(${factor} ${-factor})`}>
        {elements.map((element) => (
          <g key={element.id} data-element-id={element.id}>
            <ShapeView shape={element} scale={viewport.scale} />
          </g>
        ))}
      </g>
      {overlay}
    </svg>
  )
}
