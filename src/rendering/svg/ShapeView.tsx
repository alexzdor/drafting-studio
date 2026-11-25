import type { Shape } from '../../types/geometry'

export function ShapeView({ shape, scale }: { shape: Shape; scale: number }) {
  const [first, second] = shape.vertices
  const coordinates = shape.vertices.map(({ x, y }) => `${x},${y}`).join(' ')
  const line = { fill: 'none', stroke: 'currentColor', vectorEffect: 'non-scaling-stroke' }

  switch (shape.type) {
    case 'point':
      return first ? <circle cx={first.x} cy={first.y} r={300 / scale} fill="currentColor" /> : null
    case 'segment':
      return first && second ? <line x1={first.x} y1={first.y} x2={second.x} y2={second.y} {...line} /> : null
    case 'circle':
      return first ? <circle cx={first.x} cy={first.y} r={shape.properties.radius} {...line} /> : null
    case 'angle':
      return <polyline points={coordinates} {...line} />
    case 'triangle':
    case 'quadrilateral':
    case 'polygon':
      return <polygon points={coordinates} {...line} />
  }
}
