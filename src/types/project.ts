import type { SnapSettings } from './editor'
import type { Group, Shape } from './geometry'

export interface ProjectSettings {
  scale: number
  gridEnabled: boolean
  snapping: SnapSettings
}

export interface Project {
  projectId: string
  projectName: string
  version: number
  createdAt: string
  updatedAt: string
  elements: Shape[]
  groups: Group[]
  settings: ProjectSettings
}

export interface DrawingListItem {
  projectId: string
  projectName: string
  createdAt: string
  updatedAt: string
  elementCount: number
  isAutosaved: boolean
}
