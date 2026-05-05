export interface ElementRecord {
  atomicNumber: number; symbol: string; name: string
  group: number | null; period: number; classification: string
  atomicMass: number; density: number | null; electronegativity: number | null
  electronShells: number[]; zone: string; lootRarity: string
  isRadioactive: boolean; isSynthetic: boolean
}

export const CLASS_COLORS: Record<string, string> = {
  alkali_metal: '#ef5350', alkaline_earth_metal: '#ffa726',
  transition_metal: '#66bb6a', post_transition_metal: '#26c6da',
  metalloid: '#ab47bc', nonmetal: '#ffee58', halogen: '#ec407a',
  noble_gas: '#42a5f5', lanthanide: '#ff7043', actinide: '#8d6e63',
}

export const ZONE_COLORS: Record<string, string> = {
  Passive: '#42a5f5', Combat: '#ef5350', Neutral: '#66bb6a',
  Boss: '#ab47bc', Anomalous: '#ffa726',
}

export const RARITY_COLORS: Record<string, string> = {
  Common: '#9E9E9E', Uncommon: '#4CAF50', Rare: '#2196F3',
  Epic: '#9C27B0', Legendary: '#FFC107',
}
