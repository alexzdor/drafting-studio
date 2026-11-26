import type { Point, Shape, ShapeType } from '../types/geometry'

const EPSILON = 1e-8
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
const cross = (a: Point, b: Point, c: Point) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)

export const shapeTemplates = {
  point: { label: 'Точка', steps: ['укажите точку'] },
  segment: { label: 'Отрезок', steps: ['укажите начало', 'укажите конец'] },
  triangle: { label: 'Треугольник', steps: ['укажите первую вершину', 'укажите вторую вершину', 'укажите третью вершину'] },
  quadrilateral: { label: 'Четырёхугольник', steps: ['укажите первую вершину', 'укажите вторую вершину', 'укажите третью вершину', 'укажите четвёртую вершину'] },
  circle: { label: 'Окружность', steps: ['укажите центр', 'укажите точку на окружности'] },
  polygon: { label: 'Многоугольник', steps: [] },
  angle: { label: 'Угол', steps: ['укажите точку первого луча', 'укажите вершину', 'укажите точку второго луча'] },
} satisfies Record<ShapeType, { label: string; steps: string[] }>

function angleBetween(a: Point, center: Point, b: Point): number {
  const dot = (a.x - center.x) * (b.x - center.x) + (a.y - center.y) * (b.y - center.y)
  return Math.atan2(Math.abs(cross(center, a, b)), dot) * 180 / Math.PI
}

function intersects(a: Point, b: Point, c: Point, d: Point): boolean {
  const overlaps = (a: number, b: number, c: number, d: number) =>
    Math.max(Math.min(a, b), Math.min(c, d)) <= Math.min(Math.max(a, b), Math.max(c, d))
  const side = (a: Point, b: Point, c: Point) => {
    const value = cross(a, b, c)
    return Math.abs(value) < EPSILON ? 0 : Math.sign(value)
  }
  return overlaps(a.x, b.x, c.x, d.x) && overlaps(a.y, b.y, c.y, d.y)
    && side(a, b, c) * side(a, b, d) <= 0 && side(c, d, a) * side(c, d, b) <= 0
}

export function buildShape(
  type: ShapeType,
  vertices: Point[],
  id: string,
  annotations: Shape['annotations'] = [],
  radius?: number,
): Shape | null {
  const count = type === 'circle' && radius !== undefined ? 1 : shapeTemplates[type].steps.length
  if (type === 'polygon' ? vertices.length < 3 : vertices.length !== count) return null
  if (vertices.some(({ x, y }, index) => !Number.isFinite(x) || !Number.isFinite(y)
    || vertices.slice(0, index).some(point => distance(point, { x, y }) < EPSILON))) return null

  const [a, b, c] = vertices
  const common = { id, vertices, annotations }
  switch (type) {
    case 'point':
      return { ...common, type, properties: {} }
    case 'segment': {
      const length = distance(a, b)
      return Number.isFinite(length) ? { ...common, type, properties: { length } } : null
    }
    case 'circle': {
      const value = radius ?? distance(a, b)
      return Number.isFinite(value) && value > EPSILON
        ? { ...common, type, vertices: [a], properties: { radius: value } }
        : null
    }
    case 'angle': {
      const angleValue = angleBetween(a, b, c)
      if (!Number.isFinite(angleValue) || angleValue < EPSILON) return null
      const angleType = Math.abs(angleValue - 180) < EPSILON ? 'straight'
        : Math.abs(angleValue - 90) < EPSILON ? 'right'
        : angleValue < 90 ? 'acute' : 'obtuse'
      return { ...common, type, properties: { angleValue, angleType } }
    }
  }

  const next = (index: number) => (index + 1) % vertices.length
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 2; j < vertices.length; j += 1) {
      if (next(j) === i) continue
      if (intersects(vertices[i], vertices[next(i)], vertices[j], vertices[next(j)])) return null
    }
  }
  const signedArea = vertices.reduce((sum, point, index) =>
    sum + cross(a, point, vertices[next(index)]) / 2, 0)
  const area = Math.abs(signedArea)
  if (!Number.isFinite(area) || area < EPSILON) return null
  const sideLengths = vertices.map((point, index) => distance(point, vertices[next(index)]))
  const perimeter = sideLengths.reduce((sum, length) => sum + length, 0)
  if (!Number.isFinite(perimeter)) return null
  if (type === 'polygon') {
    return { ...common, type, properties: { area, perimeter, sideLengths, vertexCount: vertices.length } }
  }
  const angles = vertices.map((point, index) => {
    const previous = vertices[(index + vertices.length - 1) % vertices.length]
    const following = vertices[next(index)]
    const angle = angleBetween(previous, point, following)
    return cross(previous, point, following) * signedArea < 0 ? 360 - angle : angle
  })
  if (type === 'triangle') {
    return { ...common, type, properties: { area, perimeter, sideLengths: [sideLengths[0], sideLengths[1], sideLengths[2]], angles: [angles[0], angles[1], angles[2]] } }
  }
  return { ...common, type, properties: { area, perimeter, sideLengths: [sideLengths[0], sideLengths[1], sideLengths[2], sideLengths[3]], angles: [angles[0], angles[1], angles[2], angles[3]] } }
}

export function rebuildShape(shape: Shape, vertices: Point[], radius?: number) {
  return buildShape(shape.type, vertices, shape.id, shape.annotations,
    shape.type === 'circle' ? radius ?? shape.properties.radius : undefined)
}
