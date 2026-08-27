export type ElementCategory =
  | 'essence'
  | 'matter'
  | 'weather'
  | 'life'
  | 'craft'
  | 'society'
  | 'knowledge'
  | 'transport'

export interface ElementDefinition {
  id: string
  name: string
  sigil: string
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
  subtitle: string
  unlockRequires: string[]
  grants: string[]
  landmarkIds: string[]
  discoveryGoal: number
}