export const atlasDescriptionCorrections = {
  house: ['Walls arranged around a place to live.', 'A built dwelling with indoor space for everyday life, whether made of brush, earth, timber or stone.'],
  map: ['Charcoal marks turning remembered journeys into shared direction.', 'A diagram of places, routes or boundaries, drawn, inscribed or made on another surface.'],
  pigment: ['Earthy color suspended in water and ready to leave a mark.', 'A substance that gives color, such as ground ochre used dry or mixed into a preparation.'],
  basket: ['Reeds worked into a vessel for carrying and keeping.', 'A container made by interlacing flexible material, often plant fibres, for carrying or keeping things.'],
  chariot: ['A swift wheeled platform drawn by the strength of animals.', 'A light horse-drawn vehicle for people, typically with two spoked wheels.'],
  ink: ['Dark pigment refined to flow cleanly and leave precise marks.', 'A colorant prepared to flow and leave marks for writing or drawing.'],
} as const satisfies Record<string, readonly [string, string]>

// Restore only the explicitly approved wording changes for older full-record fingerprints.
export function withBaselineDescriptions<T extends { id: string; description: string }>(elements: readonly T[]) {
  return elements.map((element) => {
    const id = element.id as keyof typeof atlasDescriptionCorrections
    return Object.hasOwn(atlasDescriptionCorrections, id)
      ? { ...element, description: atlasDescriptionCorrections[id][0] }
      : element
  })
}
