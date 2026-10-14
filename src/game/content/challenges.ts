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
      overview: 'Explore extraction, alloying and toolmaking. Smelting extracts metal from ore; alloying mixes metals. The mixture and working methods matter, and the two-input puzzles omit equipment and controlled conditions. Tin bronze is one copper-alloy tradition, not the only history of metalworking. A stone edge here is a gameplay association, not a mandatory casting pattern.',
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
  {
    id: 'civic-lab',
    name: 'Civic Lab',
    starterIds: ['trade', 'city', 'law'],
    targetId: 'republic',
    allowedResultEraIds: ['classical-antiquity'],
    minimumAttempts: 4,
    education: {
      overview: 'Explore civic connections through symbolic recipes. The Greek agora combined civic, legal and commercial functions; it did not become a Roman forum when law was added. Rome developed its own institutions over centuries. The Senate was an elite council within a system of magistrates and assemblies, not universal representation. The puzzle route is neither a chronology nor a prescription for government.',
      sourceIds: ['ascsa-agora', 'whe-roman-forum', 'whe-roman-senate', 'whe-roman-republic'],
    },
  },
  {
    id: 'engineering-lab',
    name: 'Engineering Lab',
    starterIds: ['masonry', 'aqueduct', 'city'],
    targetId: 'amphitheater',
    allowedResultEraIds: ['classical-antiquity'],
    minimumAttempts: 2,
    education: {
      overview: 'Explore structural connections, not a construction procedure. Etruscan arched gates and pre-Roman water conduits precede Roman monumental works. Aqueducts could use pipes or tunnels rather than arches; Persian qanats are a distinct groundwater-management tradition. Some Roman arenas used vaulted seating, while earlier structures used earth and wood. Their spectacles involved violence and social hierarchy, not only civic celebration.',
      sourceIds: ['whe-etruscan-architecture', 'whe-aqueduct', 'unesco-persian-qanat', 'whe-amphitheatre'],
    },
  },
  {
    id: 'commerce-lab',
    name: 'Commerce Lab',
    starterIds: ['bronze', 'market', 'forge'],
    targetId: 'mint',
    allowedResultEraIds: ['iron-age', 'classical-antiquity'],
    minimumAttempts: 2,
    education: {
      overview: 'Explore a monetary workshop using supplied puzzle materials. Coins were made from different metals, not only bronze. Greek minting could involve prepared blanks, engraved dies and hammer striking; a forge alone does not supply those operations or an issuing standard. Coinage coexisted with other payments and developed at different times in different regions. The supplied ingredients are not a universal history of money.',
      sourceIds: ['whe-greek-coinage', 'whe-roman-coinage'],
    },
  },
  {
    id: 'inquiry-lab',
    name: 'Inquiry Lab',
    starterIds: ['archive', 'human', 'observation', 'bird'],
    targetId: 'bird-inquiry',
    allowedResultEraIds: ['classical-antiquity'],
    minimumAttempts: 3,
    education: {
      overview: 'Explore shared learning and animal inquiry without a history quiz. Aristotle discussed birds using descriptions and reported claims, not modern evolutionary biology. Birds as living avian dinosaurs is a modern evidence-based explanation. Indian and Chinese philosophical traditions had different questions and chronologies; they did not all enter a Greek Classical age together. Ancient fossil interpretations likewise differ from modern paleontology.',
      sourceIds: ['mit-aristotle-animals', 'nhm-bird-evolution', 'sep-naturalism-india', 'sep-chinese-metaphysics', 'herodotus-egypt-shells'],
    },
  },
]

export const challenges = [rainmakerChallenge, ...learningChallenges]
export const challengesById = new Map(challenges.map((challenge) => [challenge.id, challenge]))