export interface ChallengeDefinition {
  id: string
  name: string
  starterIds: string[]
  targetId: string
  allowedResultEraIds: string[]
}

export const rainmakerChallenge: ChallengeDefinition = {
  id: 'rainmaker',
  name: 'Rainmaker',
  starterIds: ['ember', 'tide', 'stone', 'gale'],
  targetId: 'rain',
  allowedResultEraIds: ['first-light'],
}