type AnnotationValueByType = {
  label: string
  length: number
  angle: number
  equality_mark: number
  right_angle: null
  parallel_mark: number
}

export type AnnotationType = keyof AnnotationValueByType

export type Annotation = {
  [Type in AnnotationType]: {
    id: string
    type: Type
    value: AnnotationValueByType[Type]
    targetId: string
  }
}[AnnotationType]
