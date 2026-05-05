// ─── Trivia question bank ─────────────────────────────────────────────────────

export interface TriviaQ {
  q: string
  options: string[]
  answer: number
  difficulty: 1 | 2 | 3
}

export const QUESTION_BANK: TriviaQ[] = [
  // Identification
  { q: 'What is the symbol for Gold?', options: ['Go','Gd','Au','Ag'], answer: 2, difficulty: 1 },
  { q: 'What is the symbol for Iron?', options: ['Ir','Fe','In','Fr'], answer: 1, difficulty: 1 },
  { q: 'What is the symbol for Silver?', options: ['Si','Sv','Ag','Al'], answer: 2, difficulty: 1 },
  { q: 'What is the symbol for Sodium?', options: ['So','Sd','Sn','Na'], answer: 3, difficulty: 1 },
  { q: 'What is the symbol for Potassium?', options: ['Po','Pt','K','Ks'], answer: 2, difficulty: 1 },
  { q: 'What is the symbol for Lead?', options: ['Le','Ld','Pb','Pl'], answer: 2, difficulty: 1 },
  { q: 'What is the symbol for Mercury?', options: ['Me','Hg','Mr','Mc'], answer: 1, difficulty: 1 },
  { q: 'What is the symbol for Tungsten?', options: ['Tu','Tg','Wt','W'], answer: 3, difficulty: 2 },
  { q: 'What is the symbol for Antimony?', options: ['Am','Sb','At','An'], answer: 1, difficulty: 2 },
  { q: 'What is the symbol for Tin?', options: ['Ti','Tn','Sn','St'], answer: 2, difficulty: 2 },
  // Atomic numbers
  { q: 'What is the atomic number of Hydrogen?', options: ['1','2','3','4'], answer: 0, difficulty: 1 },
  { q: 'What is the atomic number of Carbon?', options: ['4','6','8','12'], answer: 1, difficulty: 1 },
  { q: 'What is the atomic number of Oxygen?', options: ['6','7','8','9'], answer: 2, difficulty: 1 },
  { q: 'What is the atomic number of Nitrogen?', options: ['5','6','7','8'], answer: 2, difficulty: 1 },
  { q: 'What is the atomic number of Uranium?', options: ['82','88','92','96'], answer: 2, difficulty: 2 },
  { q: 'What is the atomic number of Gold?', options: ['74','79','82','83'], answer: 1, difficulty: 2 },
  { q: 'What is the atomic number of Helium?', options: ['1','2','3','4'], answer: 1, difficulty: 1 },
  { q: 'What is the atomic number of Iron?', options: ['24','26','28','30'], answer: 1, difficulty: 1 },
  // Groups & periods
  { q: 'Noble gases are in which group?', options: ['Group 1','Group 7','Group 17','Group 18'], answer: 3, difficulty: 1 },
  { q: 'Alkali metals are in which group?', options: ['Group 1','Group 2','Group 17','Group 18'], answer: 0, difficulty: 1 },
  { q: 'Halogens are in which group?', options: ['Group 1','Group 7','Group 17','Group 18'], answer: 2, difficulty: 1 },
  { q: 'How many periods are in the periodic table?', options: ['5','6','7','8'], answer: 2, difficulty: 1 },
  { q: 'Hydrogen is in period:', options: ['1','2','3','4'], answer: 0, difficulty: 1 },
  { q: 'Uranium is in period:', options: ['5','6','7','8'], answer: 2, difficulty: 2 },
  // Properties
  { q: 'Which element has the highest electronegativity?', options: ['Oxygen','Chlorine','Fluorine','Nitrogen'], answer: 2, difficulty: 2 },
  { q: 'Which element is the most abundant in Earth\'s crust?', options: ['Silicon','Iron','Oxygen','Aluminium'], answer: 2, difficulty: 1 },
  { q: 'Which element is liquid at room temperature (non-metal)?', options: ['Mercury','Bromine','Gallium','Caesium'], answer: 1, difficulty: 2 },
  { q: 'Which element is liquid at room temperature (metal)?', options: ['Bromine','Gallium','Mercury','Francium'], answer: 2, difficulty: 2 },
  { q: 'What is the lightest element?', options: ['Helium','Hydrogen','Lithium','Carbon'], answer: 1, difficulty: 1 },
  { q: 'What is the densest naturally occurring element?', options: ['Gold','Lead','Osmium','Iridium'], answer: 2, difficulty: 3 },
  { q: 'Which element has the highest melting point?', options: ['Iron','Tungsten','Carbon','Osmium'], answer: 1, difficulty: 3 },
  // Electron config
  { q: 'How many valence electrons does Carbon have?', options: ['2','4','6','8'], answer: 1, difficulty: 1 },
  { q: 'How many valence electrons does Oxygen have?', options: ['4','5','6','7'], answer: 2, difficulty: 1 },
  { q: 'How many valence electrons do noble gases have (except He)?', options: ['6','7','8','2'], answer: 2, difficulty: 1 },
  { q: 'The electron configuration of Helium is:', options: ['1s1','1s2','2s1','2s2'], answer: 1, difficulty: 2 },
  { q: 'How many electrons can the first shell hold?', options: ['2','4','8','18'], answer: 0, difficulty: 1 },
  { q: 'How many electrons can the second shell hold?', options: ['2','4','8','18'], answer: 2, difficulty: 1 },
  // Isotopes & radioactivity
  { q: 'Carbon-14 differs from Carbon-12 in its number of:', options: ['Protons','Electrons','Neutrons','Quarks'], answer: 2, difficulty: 2 },
  { q: 'Which element has the most stable isotopes?', options: ['Tin','Lead','Iron','Xenon'], answer: 0, difficulty: 3 },
  { q: 'Uranium-235 has how many neutrons?', options: ['92','143','146','235'], answer: 1, difficulty: 2 },
  { q: 'Which of these is radioactive?', options: ['Carbon-12','Nitrogen-14','Carbon-14','Oxygen-16'], answer: 2, difficulty: 2 },
  // Compounds & reactions
  { q: 'Water is composed of:', options: ['H and C','H and O','O and N','H and N'], answer: 1, difficulty: 1 },
  { q: 'Table salt is:', options: ['NaCl','KCl','CaCl2','MgCl2'], answer: 0, difficulty: 1 },
  { q: 'Rust is iron reacting with:', options: ['Nitrogen','Carbon dioxide','Oxygen and water','Sulfur'], answer: 2, difficulty: 1 },
  { q: 'Which gas makes up ~78% of Earth\'s atmosphere?', options: ['Oxygen','Argon','Carbon dioxide','Nitrogen'], answer: 3, difficulty: 1 },
  { q: 'Diamond and graphite are both made of:', options: ['Silicon','Carbon','Boron','Nitrogen'], answer: 1, difficulty: 2 },
]

export function getRandomQuestions(n: number): TriviaQ[] {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export function getQuestionForElement(symbol: string): TriviaQ {
  // Try to find a question mentioning this element, else random
  const specific = QUESTION_BANK.filter(q =>
    q.q.toLowerCase().includes(symbol.toLowerCase()) ||
    q.options.some(o => o.toLowerCase().includes(symbol.toLowerCase()))
  )
  const pool = specific.length > 0 ? specific : QUESTION_BANK
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Loot generation ──────────────────────────────────────────────────────────

export type LootRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
export type LootSlot = 'weapon' | 'armor' | 'accessory' | 'reagent'

export interface LootItem {
  id: string
  name: string
  symbol: string
  rarity: LootRarity
  slot: LootSlot
  atk: number
  def: number
  spd: number
  description: string
  equipped: boolean
}

const RARITY_MULT: Record<LootRarity, number> = {
  Common: 1, Uncommon: 1.5, Rare: 2.5, Epic: 4, Legendary: 7
}

const WEAPON_NAMES = ['Blade','Spear','Hammer','Staff','Dagger','Axe','Bow','Wand']
const ARMOR_NAMES  = ['Plate','Shield','Robe','Vest','Helm','Gauntlets','Boots','Cloak']
const ACC_NAMES    = ['Ring','Amulet','Orb','Crystal','Gem','Sigil','Rune','Charm']
const REAGENT_NAMES = ['Dust','Shard','Essence','Fragment','Powder','Extract','Residue','Core']

export function generateLoot(
  symbol: string,
  name: string,
  rarity: LootRarity,
  classification: string,
  atomicMass: number,
  electronegativity: number | null,
  density: number | null,
): LootItem {
  const m = RARITY_MULT[rarity]
  const base = Math.round(atomicMass / 30)
  const en = electronegativity ?? 2
  const d = density ?? 5

  let slot: LootSlot
  if (['alkali_metal','alkaline_earth_metal','transition_metal','post_transition_metal'].includes(classification)) {
    slot = Math.random() > 0.5 ? 'weapon' : 'armor'
  } else if (classification === 'noble_gas') {
    slot = 'accessory'
  } else if (['lanthanide','actinide'].includes(classification)) {
    slot = Math.random() > 0.5 ? 'accessory' : 'reagent'
  } else {
    slot = 'reagent'
  }

  const nameList = slot === 'weapon' ? WEAPON_NAMES : slot === 'armor' ? ARMOR_NAMES : slot === 'accessory' ? ACC_NAMES : REAGENT_NAMES
  const suffix = nameList[Math.floor(Math.random() * nameList.length)]

  const atk = Math.round(en * 2 * m + base)
  const def = Math.round((d / 22.6) * 10 * m + base)
  const spd = Math.round((1 / (atomicMass / 100)) * 5 * m + 1)

  return {
    id: `${symbol}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: `${name} ${suffix}`,
    symbol,
    rarity,
    slot,
    atk,
    def,
    spd,
    description: `Forged from ${name}. ${rarity === 'Legendary' ? `Unique ability: ${symbol} Collapse — reduces all enemy stats by 30%.` : rarity === 'Epic' ? `Special: ${symbol} Aura — applies status on hit.` : ''}`,
    equipped: false,
  }
}

export function rollRarity(zone: string): LootRarity {
  const r = Math.random()
  if (zone === 'Boss') {
    if (r < 0.01) return 'Legendary'
    if (r < 0.08) return 'Epic'
    if (r < 0.35) return 'Rare'
    if (r < 0.70) return 'Uncommon'
    return 'Common'
  }
  if (zone === 'Anomalous') {
    if (r < 0.05) return 'Legendary'
    if (r < 0.25) return 'Epic'
    if (r < 0.55) return 'Rare'
    if (r < 0.80) return 'Uncommon'
    return 'Common'
  }
  if (r < 0.005) return 'Legendary'
  if (r < 0.025) return 'Epic'
  if (r < 0.09) return 'Rare'
  if (r < 0.29) return 'Uncommon'
  return 'Common'
}

// ─── Boss cutscene lines ──────────────────────────────────────────────────────

export const BOSS_INTROS: Record<string, string[]> = {
  U:  ['The ground trembles as Uranium awakens...', '☢ Radiation fills the air.', '"You dare challenge the heaviest natural element?"'],
  Pu: ['A sickly green glow emanates from the core...', '☢ Plutonium stirs from its slumber.', '"I am the fuel of stars and the bane of life."'],
  Ra: ['Marie Curie\'s discovery radiates with deadly energy...', '☢ Radium pulses with an eerie blue light.', '"My glow is beautiful — and lethal."'],
  Hg: ['Liquid metal pools and rises into form...', '💧 Mercury shifts and flows.', '"I am the only metal that flows like water."'],
  Pb: ['Ancient and heavy, Lead blocks all light...', '🛡 Lead\'s density warps the space around it.', '"Civilisations rose and fell because of me."'],
  Bi: ['The most radioactive stable element stirs...', '🌈 Bismuth shimmers with iridescent colour.', '"I am beautiful, yet I outlast all."'],
  Po: ['A barely visible shimmer — Polonium is here...', '☢ The air itself seems to decay.', '"I killed a spy. I can kill you too."'],
  Rn: ['An invisible, odourless menace fills the room...', '☢ Radon seeps from the earth.', '"You cannot see me. You cannot smell me. But I am here."'],
  Th: ['The earth shakes as Thorium rises...', '☢ Ancient radioactive energy surges.', '"I powered the first nuclear reactors."'],
  Og: ['Reality itself warps as Oganesson manifests...', '⚡ The heaviest known element tears at spacetime.', '"I exist for milliseconds — but I am LEGENDARY."'],
}

export function getBossIntro(symbol: string): string[] {
  return BOSS_INTROS[symbol] ?? [
    `${symbol} looms before you...`,
    'The air crackles with elemental energy.',
    `"Face me if you dare, challenger!"`,
  ]
}

// ─── Combat helpers ───────────────────────────────────────────────────────────

export type StatusEffect = 'radiation' | 'corrosion' | 'stagger' | 'burning' | 'none'

export const MANA_MAX = 100
export const SPECIAL_COST = 30   // mana cost for Special
export const MANA_REGEN = 15     // mana gained per turn (attack or defend)

export interface Combatant {
  name: string
  hp: number
  maxHp: number
  atk: number
  def: number
  spd: number
  mana: number
  status: StatusEffect
  statusTurns: number
}

export function buildEnemy(el: {
  atomicNumber: number; name: string; symbol: string; zone: string;
  atomicMass: number; electronegativity: number | null; density: number | null;
  classification: string; isRadioactive: boolean;
}): Combatant {
  const base = el.atomicNumber
  const isBoss = el.zone === 'Boss' || el.zone === 'Anomalous'
  return {
    name: el.name,
    hp: isBoss ? base * 4 + 80 : base * 2 + 20,
    maxHp: isBoss ? base * 4 + 80 : base * 2 + 20,
    atk: Math.round((el.electronegativity ?? 2) * 5 + base * 0.3),
    def: Math.round((el.density ?? 5) / 22.6 * 15 + base * 0.1),
    spd: Math.max(1, Math.round(10 - el.atomicMass / 40)),
    mana: 0,
    status: 'none',
    statusTurns: 0,
  }
}

export function buildPlayer(equipped: LootItem[]): Combatant {
  const weapon = equipped.find(i => i.slot === 'weapon')
  const armor  = equipped.find(i => i.slot === 'armor')
  const acc    = equipped.find(i => i.slot === 'accessory')
  return {
    name: 'You',
    hp: 100 + (armor?.def ?? 0),
    maxHp: 100 + (armor?.def ?? 0),
    atk: 12 + (weapon?.atk ?? 0) + (acc?.atk ?? 0),
    def: 5  + (armor?.def ?? 0),
    spd: 8  + (weapon?.spd ?? 0),
    mana: 0,
    status: 'none',
    statusTurns: 0,
  }
}

export interface TurnResult {
  log: string
  playerHp: number
  enemyHp: number
  playerMana: number
  playerStatus: StatusEffect
  playerStatusTurns: number
  enemyStatus: StatusEffect
  enemyStatusTurns: number
}

export function resolveTurn(
  action: 'attack' | 'special' | 'defend',
  player: Combatant,
  enemy: Combatant,
): TurnResult {
  const logs: string[] = []
  let pHp = player.hp
  let eHp = enemy.hp
  let pMana = player.mana
  let pStatus = player.status
  let pStatusTurns = player.statusTurns
  let eStatus = enemy.status
  let eStatusTurns = enemy.statusTurns

  // Apply existing status DoTs to player
  if (pStatus === 'radiation' && pStatusTurns > 0) {
    const dot = 8; pHp -= dot; pStatusTurns--
    logs.push(`☢ Radiation: ${dot} dmg (${pStatusTurns} left)`)
    if (pStatusTurns === 0) pStatus = 'none'
  } else if (pStatus === 'corrosion' && pStatusTurns > 0) {
    const dot = 5; pHp -= dot; pStatusTurns--
    logs.push(`🧪 Corrosion: ${dot} dmg (${pStatusTurns} left)`)
    if (pStatusTurns === 0) pStatus = 'none'
  } else if (pStatus === 'burning' && pStatusTurns > 0) {
    const dot = 6; pHp -= dot; pStatusTurns--
    logs.push(`🔥 Burning: ${dot} dmg (${pStatusTurns} left)`)
    if (pStatusTurns === 0) pStatus = 'none'
  }

  // Player action
  if (action === 'attack') {
    const variance = 0.8 + Math.random() * 0.4
    const dmg = Math.max(1, Math.round(player.atk * variance - enemy.def * 0.3))
    eHp -= dmg
    pMana = Math.min(MANA_MAX, pMana + MANA_REGEN)
    logs.push(`⚔️ Attack: ${dmg} dmg. (+${MANA_REGEN} mana)`)
  } else if (action === 'special') {
    // Special costs mana — caller must check before calling
    const dmg = Math.max(1, Math.round(player.atk * 2.2 - enemy.def * 0.15))
    eHp -= dmg
    pMana = Math.max(0, pMana - SPECIAL_COST)
    logs.push(`💥 Special: ${dmg} dmg!`)
    if (Math.random() < 0.5) {
      eStatus = 'stagger'; eStatusTurns = 1
      logs.push(`${enemy.name} staggered!`)
    }
  } else {
    // Defend — regen more mana
    pMana = Math.min(MANA_MAX, pMana + MANA_REGEN * 2)
    logs.push(`🛡 Defending. (+${MANA_REGEN * 2} mana)`)
  }

  // Enemy turn (skip if staggered)
  if (eHp > 0) {
    if (eStatus === 'stagger') {
      eStatus = 'none'; eStatusTurns = 0
      logs.push(`${enemy.name} missed (staggered)!`)
    } else {
      const defending = action === 'defend'
      const variance = 0.8 + Math.random() * 0.4
      let eDmg = Math.max(1, Math.round(enemy.atk * variance - player.def * (defending ? 0.7 : 0.2)))
      if (defending) { eDmg = Math.round(eDmg * 0.4); logs.push(`🛡 Block!`) }
      pHp -= eDmg
      logs.push(`${enemy.name}: ${eDmg} dmg.`)
      if (pStatus === 'none' && Math.random() < 0.25) {
        const statuses: StatusEffect[] = ['radiation', 'corrosion', 'burning']
        pStatus = statuses[Math.floor(Math.random() * statuses.length)]
        pStatusTurns = 3
        logs.push(`${enemy.name} inflicts ${pStatus}!`)
      }
    }
  }

  return {
    log: logs.join(' '),
    playerHp: Math.max(0, pHp),
    enemyHp: Math.max(0, eHp),
    playerMana: pMana,
    playerStatus: pStatus,
    playerStatusTurns: pStatusTurns,
    enemyStatus: eStatus,
    enemyStatusTurns: eStatusTurns,
  }
}
