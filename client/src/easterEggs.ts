// ─── Easter Eggs ─────────────────────────────────────────────────────────────
// Easter eggs are HIDDEN — no visual indicator on the periodic table.
// They trigger through specific secret interactions described below.

export interface EasterEgg {
  id: string
  title: string
  message: string
  goldReward: number
  xpReward: number
  // How to trigger: described for admin reference only, not shown to players
  trigger: string
}

export const EASTER_EGGS: EasterEgg[] = [
  {
    id: 'noble_six',
    title: '🏆 The Noble Six',
    message: 'You clicked all 6 noble gases in order (He → Ne → Ar → Kr → Xe → Rn). The inert ones bow to you. +200 🪙 +500 XP',
    goldReward: 200,
    xpReward: 500,
    trigger: 'Click He, Ne, Ar, Kr, Xe, Rn in that exact order',
  },
  {
    id: 'water',
    title: '💧 H₂O Discovered',
    message: 'You clicked Hydrogen then Oxygen twice (H → O → O). Water — the molecule of life. Mendeleev would be proud. +100 🪙 +200 XP',
    goldReward: 100,
    xpReward: 200,
    trigger: 'Click H, then O, then O',
  },
  {
    id: 'salt',
    title: '🧂 Table Salt',
    message: 'Na + Cl = NaCl. You discovered table salt by clicking Sodium then Chlorine. Romans paid soldiers in salt — hence "salary". +80 🪙 +150 XP',
    goldReward: 80,
    xpReward: 150,
    trigger: 'Click Na then Cl',
  },
  {
    id: 'gold_platinum',
    title: '👑 The Precious Pair',
    message: 'Gold and Platinum — the two most coveted metals in history. You found them both. +300 🪙 +300 XP',
    goldReward: 300,
    xpReward: 300,
    trigger: 'Click Au then Pt (or Pt then Au)',
  },
  {
    id: 'radioactive_trio',
    title: '☢️ The Radioactive Trio',
    message: 'Uranium, Plutonium, Radium — the three elements that changed history forever. You found the nuclear trinity. +500 🪙 +1000 XP',
    goldReward: 500,
    xpReward: 1000,
    trigger: 'Click U, Pu, and Ra in any order within 10 seconds',
  },
  {
    id: 'mendeleev_sequence',
    title: '📜 Mendeleev\'s Dream',
    message: 'You clicked elements 1, 2, 3 in order — the beginning of the periodic table, just as Mendeleev arranged them in 1869. +150 🪙 +400 XP',
    goldReward: 150,
    xpReward: 400,
    trigger: 'Click H (1), He (2), Li (3) in order',
  },
  {
    id: 'carbon_life',
    title: '🌱 The Carbon Cycle',
    message: 'C → N → O — the three elements that make up 96% of all living matter. You traced the cycle of life. +120 🪙 +250 XP',
    goldReward: 120,
    xpReward: 250,
    trigger: 'Click C, N, O in that order',
  },
  {
    id: 'heaviest',
    title: '⚡ The Heaviest Known',
    message: 'Oganesson (Z=118) — the heaviest element ever synthesised, existing for less than a millisecond. You found the edge of the known universe of matter. +1000 🪙 +2000 XP',
    goldReward: 1000,
    xpReward: 2000,
    trigger: 'Click Og 5 times rapidly',
  },
  {
    id: 'alkali_row',
    title: '🔥 The Reactive Row',
    message: 'Li → Na → K → Rb → Cs → Fr — all alkali metals in order. Each one more explosive than the last. +250 🪙 +600 XP',
    goldReward: 250,
    xpReward: 600,
    trigger: 'Click Li, Na, K, Rb, Cs, Fr in order',
  },
  {
    id: 'iron_man',
    title: '🦾 Iron Man',
    message: 'You clicked Iron (Fe) 10 times. Tony Stark would approve. +50 🪙 +100 XP',
    goldReward: 50,
    xpReward: 100,
    trigger: 'Click Fe 10 times',
  },
]

// ─── Sequence tracker ─────────────────────────────────────────────────────────

export interface EggTriggerState {
  recentClicks: { symbol: string; time: number }[]
}

export function createEggState(): EggTriggerState {
  return { recentClicks: [] }
}

export function recordClick(state: EggTriggerState, symbol: string): EggTriggerState {
  const now = Date.now()
  // Keep only clicks from the last 10 seconds
  const recent = state.recentClicks.filter(c => now - c.time < 10000)
  return { recentClicks: [...recent, { symbol, time: now }].slice(-20) }
}

function lastN(clicks: { symbol: string }[], n: number): string[] {
  return clicks.slice(-n).map(c => c.symbol)
}

function containsAll(clicks: { symbol: string }[], symbols: string[], withinMs = 10000, now = Date.now()): boolean {
  const recent = clicks.filter(c => now - (c as { symbol: string; time: number }).time < withinMs)
  return symbols.every(s => recent.some(c => c.symbol === s))
}

export function checkTriggers(state: EggTriggerState, discovered: string[]): EasterEgg | null {
  const clicks = state.recentClicks
  const symbols = clicks.map(c => c.symbol)
  const now = Date.now()

  // noble_six: He Ne Ar Kr Xe Rn in order
  if (!discovered.includes('noble_six')) {
    const seq = ['He','Ne','Ar','Kr','Xe','Rn']
    if (JSON.stringify(lastN(clicks, 6)) === JSON.stringify(seq)) {
      return EASTER_EGGS.find(e => e.id === 'noble_six')!
    }
  }

  // water: H O O
  if (!discovered.includes('water')) {
    if (JSON.stringify(lastN(clicks, 3)) === JSON.stringify(['H','O','O'])) {
      return EASTER_EGGS.find(e => e.id === 'water')!
    }
  }

  // salt: Na Cl
  if (!discovered.includes('salt')) {
    if (JSON.stringify(lastN(clicks, 2)) === JSON.stringify(['Na','Cl'])) {
      return EASTER_EGGS.find(e => e.id === 'salt')!
    }
  }

  // gold_platinum: Au+Pt in any order within 5s
  if (!discovered.includes('gold_platinum')) {
    if (containsAll(clicks, ['Au','Pt'], 5000, now)) {
      return EASTER_EGGS.find(e => e.id === 'gold_platinum')!
    }
  }

  // radioactive_trio: U+Pu+Ra within 10s
  if (!discovered.includes('radioactive_trio')) {
    if (containsAll(clicks, ['U','Pu','Ra'], 10000, now)) {
      return EASTER_EGGS.find(e => e.id === 'radioactive_trio')!
    }
  }

  // mendeleev_sequence: H He Li in order
  if (!discovered.includes('mendeleev_sequence')) {
    if (JSON.stringify(lastN(clicks, 3)) === JSON.stringify(['H','He','Li'])) {
      return EASTER_EGGS.find(e => e.id === 'mendeleev_sequence')!
    }
  }

  // carbon_life: C N O in order
  if (!discovered.includes('carbon_life')) {
    if (JSON.stringify(lastN(clicks, 3)) === JSON.stringify(['C','N','O'])) {
      return EASTER_EGGS.find(e => e.id === 'carbon_life')!
    }
  }

  // heaviest: Og clicked 5 times
  if (!discovered.includes('heaviest')) {
    if (lastN(clicks, 5).every(s => s === 'Og')) {
      return EASTER_EGGS.find(e => e.id === 'heaviest')!
    }
  }

  // alkali_row: Li Na K Rb Cs Fr in order
  if (!discovered.includes('alkali_row')) {
    const seq = ['Li','Na','K','Rb','Cs','Fr']
    if (JSON.stringify(lastN(clicks, 6)) === JSON.stringify(seq)) {
      return EASTER_EGGS.find(e => e.id === 'alkali_row')!
    }
  }

  // iron_man: Fe clicked 10 times
  if (!discovered.includes('iron_man')) {
    if (lastN(clicks, 10).every(s => s === 'Fe')) {
      return EASTER_EGGS.find(e => e.id === 'iron_man')!
    }
  }

  return null
}
