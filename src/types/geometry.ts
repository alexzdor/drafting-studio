import type { Annotation } from './annotation'

export interface Point {
  x: number
  y: number
}

export type ShapeProperties = {
  point: Record<string, never>
  segment: { length: number }
  triangle: {
    sideLengths: [number, number, number]
    angles: [number, number, number]
    area: number
    perimeter: number
  }
  quadrilateral: {
    sideLengths: [number, number, number, number]
    angles: [number, number, number, number]
    area: number
    perimeter: number
  }
  circle: { radius: number }
  polygon: { vertexCount: number; sideLengths: number[]; perimeter: number; area: number }
  angle: {
    angleValue: number
    angleType: 'acute' | 'right' | 'obtuse' | 'straight' | 'reflex'
  }
}

export type ShapeType = keyof ShapeProperties

export type Shape = {
  [Type in ShapeType]: {
    id: string
    type: Type
    vertices: Point[]
    properties: ShapeProperties[Type]
    annotations: Annotation[]
  }
}[ShapeType]

export interface Group {
  id: string
  name: string
  elementIds: string[]
}
