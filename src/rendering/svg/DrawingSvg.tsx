import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { Shape } from '../../types/geometry'
import type { Viewport } from '../viewport/viewport'
import { GridLayer } from './GridLayer'
import { ShapeView } from './ShapeView'

export function DrawingSvg({
  viewport,
  elements,
  gridStep,
  overlay,
  ...svgProps
}: ComponentPropsWithRef<'svg'> & {
  viewport: Viewport
  elements: Shape[]
  gridStep?: number
  overlay?: ReactNode
}) {
  const factor = viewport.scale / 100
  return (
    <svg {...svgProps}>
      {gridStep !== undefined && <GridLayer step={gridStep} viewport={viewport} />}
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
