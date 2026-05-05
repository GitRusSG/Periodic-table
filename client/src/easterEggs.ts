export interface EasterEgg {
  id: string
  symbol: string
  title: string
  message: string
  goldReward: number
}

export const EASTER_EGGS: EasterEgg[] = [
  {
    id: 'curie',
    symbol: 'Ra',
    title: '🧪 Marie Curie\'s Discovery',
    message: '"Nothing in life is to be feared, only to be understood." — Marie Curie discovered Radium in 1898. You found her legacy! +50 🪙',
    goldReward: 50,
  },
  {
    id: 'mendeleev',
    symbol: 'Og',
    title: '📜 Mendeleev\'s Dream',
    message: 'Oganesson (Z=118) completes the periodic table Mendeleev dreamed of in 1869. He predicted gaps — scientists filled them all. +100 🪙',
    goldReward: 100,
  },
  {
    id: 'gold_rush',
    symbol: 'Au',
    title: '⛏️ Gold Rush!',
    message: 'Au comes from "Aurum" — Latin for gold. The 1849 California Gold Rush changed history. You struck it rich! +75 🪙',
    goldReward: 75,
  },
  {
    id: 'krypton',
    symbol: 'Kr',
    title: '🦸 Superman\'s Weakness',
    message: 'Kryptonite is named after Krypton! The real element is a noble gas discovered in 1898. No superheroes were harmed. +30 🪙',
    goldReward: 30,
  },
  {
    id: 'mercury_planet',
    symbol: 'Hg',
    title: '🪐 Planet & Element',
    message: 'Mercury is both a planet AND an element — the only element named after a planet. Its symbol Hg comes from "Hydrargyrum" (liquid silver). +40 🪙',
    goldReward: 40,
  },
  {
    id: 'phosphorus_glow',
    symbol: 'P',
    title: '✨ The Glowing Element',
    message: 'Phosphorus was discovered in 1669 by Hennig Brand while boiling urine. It glowed in the dark — the first element discovered in modern times. +35 🪙',
    goldReward: 35,
  },
  {
    id: 'carbon_life',
    symbol: 'C',
    title: '🌱 The Basis of Life',
    message: 'Carbon forms more compounds than any other element — over 10 million known! You are 18% carbon by mass. +25 🪙',
    goldReward: 25,
  },
  {
    id: 'helium_sun',
    symbol: 'He',
    title: '☀️ Born from the Sun',
    message: 'Helium was discovered in the Sun before it was found on Earth! Its name comes from "Helios" — the Greek sun god. +30 🪙',
    goldReward: 30,
  },
]

export function checkEasterEgg(symbol: string): EasterEgg | null {
  return EASTER_EGGS.find(e => e.symbol === symbol) ?? null
}
