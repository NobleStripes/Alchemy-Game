export type ElementCategory =
  | 'essence'
  | 'matter'
  | 'weather'
  | 'life'
  | 'craft'
  | 'society'
  | 'knowledge'
  | 'transport'

export interface ElementImage {
  src: string
  thumbnailSrc?: string
  width: number
  height: number
  description: string
  credit: string
  sourceUrl: string
  license: string
  licenseUrl: string
  licensePath?: string
  changes: string
}

export interface ElementDefinition {
  id: string
  name: string
  sigil: string
  icon?: string
  image?: ElementImage
  category: ElementCategory
  description: string
  starter: boolean
  era: string
}

export interface RecipeDefinition {
  id: string
  inputs: [string, string]
  result: string
  flavor: string
}

export interface EraDefinition {
  id: string
  name: string
  dateRange?: string
  subtitle: string
  education?: string
  unlockRequires: string[]
  grants: string[]
  landmarkIds: string[]
  discoveryGoal: number
}

export interface CollectionDefinition {
  id: string
  name: string
  era: string
  elementIds: string[]
  education?: string
  landmarkId?: string
}