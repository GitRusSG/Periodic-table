/**
 * Unit tests for crafting validation.
 *
 * Tests cover:
 *   1. A recipe requiring Rare+ reagents is disabled when only Common
 *      reagents are present (Requirement 9.12).
 *   2. The crafted item rarity equals the highest rarity among the reagents
 *      used (Requirement 9.11).
 *
 * Requirements: 9.11, 9.12
 */

import { describe, it, expect } from 'vitest';
import {
  validateCraftingRecipe,
  determineCraftedRarity,
  rarityAtLeast,
  RARITY_RANK,
  RARITY_ORDER,
  type CraftingRecipe,
  type InventoryReagent,
  type LootRarity,
} from './craftingValidation';

// ---------------------------------------------------------------------------
// Shared fixtures — example recipes from design section 6.5
// ---------------------------------------------------------------------------

/** Fe + C → Steel Blade (min rarity: Common) */
const steelBladeRecipe: CraftingRecipe = {
  reagents: [
    { symbol: 'Fe', quantity: 1 },
    { symbol: 'C', quantity: 1 },
  ],
  product: { name: 'Steel Blade' },
  minimumRarityRequired: 'Common',
};

/** Cu + Sn → Bronze Shield (min rarity: Uncommon) */
const bronzeShieldRecipe: CraftingRecipe = {
  reagents: [
    { symbol: 'Cu', quantity: 1 },
    { symbol: 'Sn', quantity: 1 },
  ],
  product: { name: 'Bronze Shield' },
  minimumRarityRequired: 'Uncommon',
};

/** Au + Ag → Electrum Ring (min rarity: Rare) */
const electrumRingRecipe: CraftingRecipe = {
  reagents: [
    { symbol: 'Au', quantity: 1 },
    { symbol: 'Ag', quantity: 1 },
  ],
  product: { name: 'Electrum Ring' },
  minimumRarityRequired: 'Rare',
};

/** Nd + Fe + B → Neodymium Magnet Core (min rarity: Epic) */
const neodymiumMagnetRecipe: CraftingRecipe = {
  reagents: [
    { symbol: 'Nd', quantity: 1 },
    { symbol: 'Fe', quantity: 1 },
    { symbol: 'B', quantity: 1 },
  ],
  product: { name: 'Neodymium Magnet Core' },
  minimumRarityRequired: 'Epic',
};

/** Og + Fl → Exotic Matter Shard (min rarity: Legendary) */
const exoticMatterRecipe: CraftingRecipe = {
  reagents: [
    { symbol: 'Og', quantity: 1 },
    { symbol: 'Fl', quantity: 1 },
  ],
  product: { name: 'Exotic Matter Shard' },
  minimumRarityRequired: 'Legendary',
};

// ---------------------------------------------------------------------------
// Helper: build a simple inventory from symbol → rarity pairs
// ---------------------------------------------------------------------------

function makeInventory(
  items: Array<{ symbol: string; rarity: LootRarity; quantity?: number }>,
): InventoryReagent[] {
  return items.map(({ symbol, rarity, quantity = 1 }) => ({
    symbol,
    rarity,
    quantity,
  }));
}

// ---------------------------------------------------------------------------
// 1. Requirement 9.12 — Minimum rarity gate
//    A recipe requiring Rare+ reagents is disabled when only Common reagents
//    are present.
// ---------------------------------------------------------------------------

describe('validateCraftingRecipe — minimum rarity requirement (Req 9.12)', () => {
  it('disables Rare recipe when all inventory reagents are Common', () => {
    // Electrum Ring requires Rare minimum.
    // Player holds Au and Ag but both are Common rarity.
    const inventory = makeInventory([
      { symbol: 'Au', rarity: 'Common' },
      { symbol: 'Ag', rarity: 'Common' },
    ]);

    const result = validateCraftingRecipe(electrumRingRecipe, inventory);

    expect(result.canCraft).toBe(false);
    if (!result.canCraft) {
      expect(result.reason).toMatch(/Rare/);
    }
  });

  it('disables Rare recipe when inventory reagents are only Uncommon', () => {
    const inventory = makeInventory([
      { symbol: 'Au', rarity: 'Uncommon' },
      { symbol: 'Ag', rarity: 'Uncommon' },
    ]);

    const result = validateCraftingRecipe(electrumRingRecipe, inventory);

    expect(result.canCraft).toBe(false);
    if (!result.canCraft) {
      expect(result.reason).toMatch(/Rare/);
    }
  });

  it('enables Rare recipe when at least one inventory reagent is Rare', () => {
    const inventory = makeInventory([
      { symbol: 'Au', rarity: 'Rare' },
      { symbol: 'Ag', rarity: 'Common' }, // one Common is fine
    ]);

    const result = validateCraftingRecipe(electrumRingRecipe, inventory);

    expect(result.canCraft).toBe(true);
  });

  it('enables Rare recipe when at least one inventory reagent is Epic (higher than Rare)', () => {
    const inventory = makeInventory([
      { symbol: 'Au', rarity: 'Epic' },
      { symbol: 'Ag', rarity: 'Common' },
    ]);

    const result = validateCraftingRecipe(electrumRingRecipe, inventory);

    expect(result.canCraft).toBe(true);
  });

  it('enables Rare recipe when at least one inventory reagent is Legendary', () => {
    const inventory = makeInventory([
      { symbol: 'Au', rarity: 'Legendary' },
      { symbol: 'Ag', rarity: 'Common' },
    ]);

    const result = validateCraftingRecipe(electrumRingRecipe, inventory);

    expect(result.canCraft).toBe(true);
  });

  it('disables Epic recipe (Neodymium Magnet Core) when all reagents are Common', () => {
    const inventory = makeInventory([
      { symbol: 'Nd', rarity: 'Common' },
      { symbol: 'Fe', rarity: 'Common' },
      { symbol: 'B', rarity: 'Common' },
    ]);

    const result = validateCraftingRecipe(neodymiumMagnetRecipe, inventory);

    expect(result.canCraft).toBe(false);
    if (!result.canCraft) {
      expect(result.reason).toMatch(/Epic/);
    }
  });

  it('disables Epic recipe when all reagents are Rare (one tier below Epic)', () => {
    const inventory = makeInventory([
      { symbol: 'Nd', rarity: 'Rare' },
      { symbol: 'Fe', rarity: 'Rare' },
      { symbol: 'B', rarity: 'Rare' },
    ]);

    const result = validateCraftingRecipe(neodymiumMagnetRecipe, inventory);

    expect(result.canCraft).toBe(false);
    if (!result.canCraft) {
      expect(result.reason).toMatch(/Epic/);
    }
  });

  it('enables Epic recipe when at least one reagent is Epic', () => {
    const inventory = makeInventory([
      { symbol: 'Nd', rarity: 'Epic' },
      { symbol: 'Fe', rarity: 'Common' },
      { symbol: 'B', rarity: 'Common' },
    ]);

    const result = validateCraftingRecipe(neodymiumMagnetRecipe, inventory);

    expect(result.canCraft).toBe(true);
  });

  it('disables Legendary recipe (Exotic Matter Shard) when reagents are only Epic', () => {
    const inventory = makeInventory([
      { symbol: 'Og', rarity: 'Epic' },
      { symbol: 'Fl', rarity: 'Epic' },
    ]);

    const result = validateCraftingRecipe(exoticMatterRecipe, inventory);

    expect(result.canCraft).toBe(false);
    if (!result.canCraft) {
      expect(result.reason).toMatch(/Legendary/);
    }
  });

  it('enables Legendary recipe when at least one reagent is Legendary', () => {
    const inventory = makeInventory([
      { symbol: 'Og', rarity: 'Legendary' },
      { symbol: 'Fl', rarity: 'Epic' },
    ]);

    const result = validateCraftingRecipe(exoticMatterRecipe, inventory);

    expect(result.canCraft).toBe(true);
  });

  it('enables Common recipe (Steel Blade) with any rarity reagents', () => {
    // Common is the lowest tier — any rarity satisfies it.
    const inventory = makeInventory([
      { symbol: 'Fe', rarity: 'Common' },
      { symbol: 'C', rarity: 'Common' },
    ]);

    const result = validateCraftingRecipe(steelBladeRecipe, inventory);

    expect(result.canCraft).toBe(true);
  });

  it('disables recipe when a required reagent symbol is missing from inventory', () => {
    // Electrum Ring needs Au + Ag; player only has Au.
    const inventory = makeInventory([
      { symbol: 'Au', rarity: 'Rare' },
    ]);

    const result = validateCraftingRecipe(electrumRingRecipe, inventory);

    expect(result.canCraft).toBe(false);
    if (!result.canCraft) {
      expect(result.reason).toMatch(/Ag/);
    }
  });

  it('disables recipe when a required reagent has insufficient quantity', () => {
    const recipe: CraftingRecipe = {
      reagents: [{ symbol: 'Fe', quantity: 3 }],
      product: { name: 'Iron Ingot' },
      minimumRarityRequired: 'Common',
    };
    const inventory = makeInventory([
      { symbol: 'Fe', rarity: 'Common', quantity: 2 }, // only 2, need 3
    ]);

    const result = validateCraftingRecipe(recipe, inventory);

    expect(result.canCraft).toBe(false);
    if (!result.canCraft) {
      expect(result.reason).toMatch(/Fe/);
    }
  });

  it('enables recipe when reagent quantity exactly meets the requirement', () => {
    const recipe: CraftingRecipe = {
      reagents: [{ symbol: 'Fe', quantity: 2 }],
      product: { name: 'Iron Ingot' },
      minimumRarityRequired: 'Common',
    };
    const inventory = makeInventory([
      { symbol: 'Fe', rarity: 'Common', quantity: 2 },
    ]);

    const result = validateCraftingRecipe(recipe, inventory);

    expect(result.canCraft).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Requirement 9.11 — Crafted item rarity = highest rarity among reagents
// ---------------------------------------------------------------------------

describe('determineCraftedRarity — crafted item rarity (Req 9.11)', () => {
  it('returns Common when all reagents are Common', () => {
    const reagents = makeInventory([
      { symbol: 'Fe', rarity: 'Common' },
      { symbol: 'C', rarity: 'Common' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Common');
  });

  it('returns Uncommon when the highest reagent is Uncommon', () => {
    const reagents = makeInventory([
      { symbol: 'Cu', rarity: 'Uncommon' },
      { symbol: 'Sn', rarity: 'Common' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Uncommon');
  });

  it('returns Rare when the highest reagent is Rare', () => {
    const reagents = makeInventory([
      { symbol: 'Au', rarity: 'Rare' },
      { symbol: 'Ag', rarity: 'Common' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Rare');
  });

  it('returns Epic when the highest reagent is Epic', () => {
    const reagents = makeInventory([
      { symbol: 'Nd', rarity: 'Epic' },
      { symbol: 'Fe', rarity: 'Common' },
      { symbol: 'B', rarity: 'Uncommon' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Epic');
  });

  it('returns Legendary when the highest reagent is Legendary', () => {
    const reagents = makeInventory([
      { symbol: 'Og', rarity: 'Legendary' },
      { symbol: 'Fl', rarity: 'Epic' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Legendary');
  });

  it('returns the single reagent rarity when only one reagent is provided', () => {
    const reagents = makeInventory([{ symbol: 'Au', rarity: 'Rare' }]);

    expect(determineCraftedRarity(reagents)).toBe('Rare');
  });

  it('returns Legendary even when it is not the first reagent', () => {
    // Legendary is last in the array — must still be selected.
    const reagents = makeInventory([
      { symbol: 'Fe', rarity: 'Common' },
      { symbol: 'C', rarity: 'Uncommon' },
      { symbol: 'Og', rarity: 'Legendary' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Legendary');
  });

  it('returns the higher rarity when two reagents have different rarities', () => {
    const pairs: Array<[LootRarity, LootRarity, LootRarity]> = [
      ['Common', 'Uncommon', 'Uncommon'],
      ['Common', 'Rare', 'Rare'],
      ['Uncommon', 'Epic', 'Epic'],
      ['Rare', 'Legendary', 'Legendary'],
      ['Epic', 'Legendary', 'Legendary'],
    ];

    for (const [rarityA, rarityB, expected] of pairs) {
      const reagents = makeInventory([
        { symbol: 'A', rarity: rarityA },
        { symbol: 'B', rarity: rarityB },
      ]);
      expect(determineCraftedRarity(reagents)).toBe(expected);
    }
  });

  it('throws when no reagents are provided', () => {
    expect(() => determineCraftedRarity([])).toThrow();
  });

  it('all five rarity tiers can be the crafted rarity', () => {
    // Verify each rarity tier is reachable as the crafted output.
    for (const rarity of RARITY_ORDER) {
      const reagents = makeInventory([{ symbol: 'X', rarity }]);
      expect(determineCraftedRarity(reagents)).toBe(rarity);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Integration — validateCraftingRecipe uses determineCraftedRarity logic
//    (crafted rarity = highest among reagents, and minimum rarity check uses
//    the same ordering)
// ---------------------------------------------------------------------------

describe('validateCraftingRecipe — integration with rarity ordering', () => {
  it('Uncommon recipe (Bronze Shield) is disabled with only Common reagents', () => {
    const inventory = makeInventory([
      { symbol: 'Cu', rarity: 'Common' },
      { symbol: 'Sn', rarity: 'Common' },
    ]);

    const result = validateCraftingRecipe(bronzeShieldRecipe, inventory);

    expect(result.canCraft).toBe(false);
    if (!result.canCraft) {
      expect(result.reason).toMatch(/Uncommon/);
    }
  });

  it('Uncommon recipe (Bronze Shield) is enabled with Uncommon reagents', () => {
    const inventory = makeInventory([
      { symbol: 'Cu', rarity: 'Uncommon' },
      { symbol: 'Sn', rarity: 'Common' },
    ]);

    const result = validateCraftingRecipe(bronzeShieldRecipe, inventory);

    expect(result.canCraft).toBe(true);
  });

  it('crafted rarity for Steel Blade with all-Common reagents is Common', () => {
    const reagents = makeInventory([
      { symbol: 'Fe', rarity: 'Common' },
      { symbol: 'C', rarity: 'Common' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Common');
  });

  it('crafted rarity for Electrum Ring with Rare Au and Common Ag is Rare', () => {
    const reagents = makeInventory([
      { symbol: 'Au', rarity: 'Rare' },
      { symbol: 'Ag', rarity: 'Common' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Rare');
  });

  it('crafted rarity for Neodymium Magnet Core with Epic Nd, Common Fe, Uncommon B is Epic', () => {
    const reagents = makeInventory([
      { symbol: 'Nd', rarity: 'Epic' },
      { symbol: 'Fe', rarity: 'Common' },
      { symbol: 'B', rarity: 'Uncommon' },
    ]);

    expect(determineCraftedRarity(reagents)).toBe('Epic');
  });
});

// ---------------------------------------------------------------------------
// 4. rarityAtLeast helper — sanity checks
// ---------------------------------------------------------------------------

describe('rarityAtLeast helper', () => {
  it('returns true when rarity equals the minimum', () => {
    for (const rarity of RARITY_ORDER) {
      expect(rarityAtLeast(rarity, rarity)).toBe(true);
    }
  });

  it('returns true when rarity is higher than the minimum', () => {
    expect(rarityAtLeast('Uncommon', 'Common')).toBe(true);
    expect(rarityAtLeast('Rare', 'Common')).toBe(true);
    expect(rarityAtLeast('Legendary', 'Epic')).toBe(true);
  });

  it('returns false when rarity is lower than the minimum', () => {
    expect(rarityAtLeast('Common', 'Uncommon')).toBe(false);
    expect(rarityAtLeast('Common', 'Rare')).toBe(false);
    expect(rarityAtLeast('Epic', 'Legendary')).toBe(false);
  });

  it('RARITY_RANK values are strictly increasing across RARITY_ORDER', () => {
    for (let i = 1; i < RARITY_ORDER.length; i++) {
      expect(RARITY_RANK[RARITY_ORDER[i]]).toBeGreaterThan(
        RARITY_RANK[RARITY_ORDER[i - 1]],
      );
    }
  });
});
