export interface ChallengeDefinition {
  id: string
  name: string
  starterIds: string[]
  targetId: string
  allowedResultEraIds: string[]
  minimumAttempts: number
  education?: {
    overview: string
    sourceIds: string[]
  }
}

export const rainmakerChallenge: ChallengeDefinition = {
  id: 'rainmaker',
  name: 'Rainmaker',
  starterIds: ['ember', 'tide', 'stone', 'gale'],
  targetId: 'rain',
  allowedResultEraIds: ['first-light'],
  minimumAttempts: 4,
}

export const learningChallenges: ChallengeDefinition[] = [
  {
    id: 'harvest-lab',
    name: 'Harvest Lab',
    starterIds: ['field', 'seed', 'tool', 'tide', 'heat'],
    targetId: 'bread',
    allowedResultEraIds: ['first-light', 'stone-age'],
    minimumAttempts: 4,
    education: {
      overview: 'Explore cultivation, grinding, mixing and cooking through existing combinations. These supplied tools and materials are gameplay starting points, not universal historical prerequisites. The supplied metal tool is a puzzle aid, not a requirement for prehistoric grinding. Bread-like food was made by hunter-gatherers before Neolithic farming; this lab represents one agricultural route, not the beginning of bread.',
      sourceIds: ['prehistoric-bread'],
    },
  },
  {
    id: 'bronze-lab',
    name: 'Bronze Lab',
    starterIds: ['copper-ore', 'tin', 'ember', 'stone-tool'],
    targetId: 'bronze-tool',
    allowedResultEraIds: ['first-light', 'stone-age', 'bronze-age'],
    minimumAttempts: 3,
    education: {
      overview: 'Explore extraction, alloying and toolmaking. Ore reduction, alloy composition and working methods matter; the two-input puzzles omit equipment and controlled conditions. Tin bronze is one copper-alloy tradition, not the only history of metalworking. A stone edge here is a gameplay association, not a mandatory casting pattern.',
      sourceIds: ['penn-metallurgy', 'penn-tin'],
    },
  },
  {
    id: 'records-lab',
    name: 'Records Lab',
    starterIds: ['clay', 'reed', 'human', 'papyrus', 'cordage'],
    targetId: 'archive',
    allowedResultEraIds: ['first-light', 'stone-age', 'bronze-age'],
    minimumAttempts: 2,
    education: {
      overview: 'Explore writing materials and keeping records, with multiple puzzle routes. Early Mesopotamian accounts used clay, while papyrus rolls joined sheets. Neither papyrus nor a specialist scribe is a universal prerequisite for writing or an archive. Writing traditions developed independently; gathering rolls is a symbolic archive route, not a complete account of administration.',
      sourceIds: ['met-barley-account', 'um-papyrus', 'writing-origins'],
    },
  },
]

export const challenges = [rainmakerChallenge, ...learningChallenges]
export const challengesById = new Map(challenges.map((challenge) => [challenge.id, challenge]))