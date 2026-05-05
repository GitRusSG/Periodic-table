/**
 * LootSystem — stat derivation from element chemical properties.
 *
 * Design spec (section 6.3):
 *   `deriveBaseStats(element)` maps real-world chemical properties to
 *   a `LootStatBlock` using linear normalization over known physical ranges.
 *
 * Requirements: 9.1, 9.8
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LootRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

/**
 * Minimal element interface required for stat derivation.
 * Matches the relevant fields of the full Element record (design section 3.1).
 */
export interface ElementForStats {
  electronegativity: number | null; // Pauling scale, 0–4
  density: number | null;           // g/cm³ at STP, 0–22.6
  atomicMass: number;               // unified atomic mass units, 1–294
}

export interface LootStatBlock {
  attack: number;
  defense: number;
  energy: number;
  weight: number;
  debuffPotency: number;
}

// ---------------------------------------------------------------------------
// Rarity multipliers (design section 6.3)
// ---------------------------------------------------------------------------

export const RARITY_MULTIPLIERS: Record<LootRarity, number> = {
  Common:    1.0,
  Uncommon:  1.5,
  Rare:      2.5,
  Epic:      4.0,
  Legendary: 7.0,
};

// ---------------------------------------------------------------------------
// Normalization helper
// ---------------------------------------------------------------------------

/**
 * Linearly normalize `value` from the range [min, max] to [0, 1].
 *
 * - Values below `min` are clamped to 0.
 * - Values above `max` are clamped to 1.
 * - If `value` is null (property not measured for this element), returns 0.
 */
export function normalize(value: number | null, min: number, max: number): number {
  if (value === null) return 0;
  if (max === min) return 0; // degenerate range guard
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

// ---------------------------------------------------------------------------
// Base stat derivation (design section 6.3)
// ---------------------------------------------------------------------------

/**
 * Derive the base `LootStatBlock` for an element from its chemical properties.
 *
 * Mapping (design section 6.3):
 *   attack        = normalize(electronegativity, 0, 4)  × 10
 *   defense       = normalize(density,           0, 22.6) × 10
 *   energy        = normalize(atomicMass,         1, 294) × 10
 *   weight        = normalize(atomicMass,         1, 294) × 10
 *   debuffPotency = normalize(electronegativity, 0, 4)  × 10
 *
 * Requirements: 9.8
 */
export function deriveBaseStats(element: ElementForStats): LootStatBlock {
  return {
    attack:        normalize(element.electronegativity, 0, 4)    * 10,
    defense:       normalize(element.density,           0, 22.6) * 10,
    energy:        normalize(element.atomicMass,        1, 294)  * 10,
    weight:        normalize(element.atomicMass,        1, 294)  * 10,
    debuffPotency: normalize(element.electronegativity, 0, 4)    * 10,
  };
}

// ---------------------------------------------------------------------------
// Rarity-scaled stat derivation
// ---------------------------------------------------------------------------

/**
 * Apply a rarity multiplier to a base stat block.
 * Each stat is scaled by the multiplier for the given rarity tier.
 *
 * Requirements: 9.4
 */
export function applyRarityMultiplier(
  base: LootStatBlock,
  rarity: LootRarity,
): LootStatBlock {
  const m = RARITY_MULTIPLIERS[rarity];
  return {
    attack:        base.attack        * m,
    defense:       base.defense       * m,
    energy:        base.energy        * m,
    weight:        base.weight        * m,
    debuffPotency: base.debuffPotency * m,
  };
}
