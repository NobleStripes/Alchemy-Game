import { z } from 'zod'

export const elementSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  sigil: z.string().min(1).max(3),
  category: z.enum([
    'essence',
    'matter',
    'weather',
    'life',
    'craft',
    'society',
    'knowledge',
    'transport',
  ]),
  description: z.string().min(1),
  starter: z.boolean(),
  era: z.string().min(1),
})

export const recipeSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  inputs: z.tuple([z.string().min(1), z.string().min(1)]),
  result: z.string().min(1),
  flavor: z.string().min(1),
})

export const eraSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  name: z.string().min(1),
  subtitle: z.string().min(1),
  unlockRequires: z.array(z.string().min(1)),
  grants: z.array(z.string().min(1)),
  landmarkIds: z.array(z.string().min(1)),
  discoveryGoal: z.number().int().positive(),
})

export const elementsSchema = z.array(elementSchema)
export const recipesSchema = z.array(recipeSchema)
export const erasSchema = z.array(eraSchema)