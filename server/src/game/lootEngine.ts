/**
 * Server-side loot recomputation engine.
 *
 * Uses the same mulberry32 PRNG and loot generation algorithm as the
 * client-side CombatEngine so that the server can deterministically
 * reproduce the loot drop from the stored seed.
 *
 * Requirements: 8.4, 9.1
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LootRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface LootItem {
  name: string;
  rarity: LootRarity;
  sourceElementAtomicNumber: number;
}

// ---------------------------------------------------------------------------
// mulberry32 PRNG — identical to the client-side implementation
// ---------------------------------------------------------------------------

/**
 * Returns a seeded pseudo-random number generator that produces values in
 * [0, 1) using the mulberry32 algorithm.
 *
 * The seed is treated as a 32-bit unsigned integer (>>> 0).
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Rarity selection
// ---------------------------------------------------------------------------

/**
 * Weighted rarity table.
 * Weights match the base drop rates from design section 6.2:
 *   Common 70%, Uncommon 20%, Rare 7%, Epic 2.5%, Legendary 0.5%
 */
const RARITY_WEIGHTS: Array<{ rarity: LootRarity; weight: number }> = [
  { rarity: "Common",    weight: 70   },
  { rarity: "Uncommon",  weight: 20   },
  { rarity: "Rare",      weight: 7    },
  { rarity: "Epic",      weight: 2.5  },
  { rarity: "Legendary", weight: 0.5  },
];

const TOTAL_WEIGHT = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0);

/**
 * Select a rarity tier using weighted random draw from the PRNG.
 */
function rollRarity(rand: () => number): LootRarity {
  const roll = rand() * TOTAL_WEIGHT;
  let cumulative = 0;
  for (const { rarity, weight } of RARITY_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) return rarity;
  }
  return "Common"; // fallback (should never be reached)
}

// ---------------------------------------------------------------------------
// Item name generation
// ---------------------------------------------------------------------------

/**
 * Derive a loot item name from the element atomic number and rarity.
 * Keeps the server-side naming consistent with what the client would generate.
 */
function deriveItemName(
  atomicNumber: number,
  rarity: LootRarity,
  index: number
): string {
  const suffixes: Record<LootRarity, string[]> = {
    Common:    ["Fragment", "Shard", "Dust", "Residue"],
    Uncommon:  ["Ingot", "Alloy", "Compound", "Crystal"],
    Rare:      ["Artifact", "Relic", "Essence", "Core"],
    Epic:      ["Catalyst", "Prism", "Nexus", "Sigil"],
    Legendary: ["Singularity", "Apex", "Zenith", "Omega"],
  };
  const list = suffixes[rarity];
  const suffix = list[index % list.length];
  return `Element-${atomicNumber} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Loot recomputation (public API)
// ---------------------------------------------------------------------------

/**
 * Deterministically generate 3 loot items from the encounter parameters.
 *
 * This function MUST produce the same output as the client-side loot
 * generation when given the same seed, elementAtomicNumber, and
 * difficultyLevel.
 *
 * Algorithm:
 *   1. Seed the mulberry32 PRNG with `seed`.
 *   2. Consume one PRNG value per item to determine rarity (weighted draw).
 *   3. Derive item name from atomicNumber + rarity + item index.
 *
 * Requirements: 8.4, 9.1
 */
export function recomputeLoot(
  seed: number,
  elementAtomicNumber: number,
  difficultyLevel: number
): LootItem[] {
  // difficultyLevel influences the number of items (higher = more items,
  // but we always generate exactly 3 to match the client).
  void difficultyLevel; // reserved for future scaling

  const rand = mulberry32(seed);
  const items: LootItem[] = [];

  for (let i = 0; i < 3; i++) {
    const rarity = rollRarity(rand);
    items.push({
      name: deriveItemName(elementAtomicNumber, rarity, i),
      rarity,
      sourceElementAtomicNumber: elementAtomicNumber,
    });
  }

  return items;
}
