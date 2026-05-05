/**
 * Property-based tests for LootSystem rarity multiplier ordering.
 *
 * **Validates: Requirements 9.4**
 *
 * Property 4: Rarity ordering
 *   For any element with at least one non-zero base stat, the total stat sum
 *   (sum of all 5 stats) after applying the rarity multiplier is strictly
 *   increasing across the rarity tiers:
 *
 *     Common < Uncommon < Rare < Epic < Legendary
 *
 * Degenerate case: if all base stats are 0 (e.g., an element with null
 * electronegativity, null density, and atomicMass = 1), the total stat sum
 * is 0 for every rarity tier. This case is excluded from the strict ordering
 * test because 0 × any_multiplier = 0.
 *
 * Uses fast-check to generate arbitrary element records and verify the
 * ordering property holds across all generated inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  deriveBaseStats,
  applyRarityMultiplier,
  RARITY_MULTIPLIERS,
  ElementForStats,
  LootRarity,
  LootStatBlock,
} from './lootStats';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sum all five stats in a LootStatBlock. */
function totalStatSum(stats: LootStatBlock): number {
  return stats.attack + stats.defense + stats.energy + stats.weight + stats.debuffPotency;
}

/**
 * Return true when every stat in the block is 0.
 * This is the degenerate case that must be excluded from the strict ordering
 * test (0 × multiplier = 0 for all rarities).
 */
function allStatsZero(stats: LootStatBlock): boolean {
  return (
    stats.attack        === 0 &&
    stats.defense       === 0 &&
    stats.energy        === 0 &&
    stats.weight        === 0 &&
    stats.debuffPotency === 0
  );
}

// ---------------------------------------------------------------------------
// Arbitraries (generators)
// ---------------------------------------------------------------------------

/**
 * Generate a nullable electronegativity value on the Pauling scale (0–4).
 * null represents elements for which electronegativity is not defined.
 */
const arbElectronegativity = fc.option(
  fc.float({ min: 0, max: Math.fround(4), noNaN: true }),
  { nil: null },
);

/**
 * Generate a nullable density value (g/cm³ at STP, 0–22.6).
 * null represents elements whose density is not well-defined at STP.
 */
const arbDensity = fc.option(
  fc.float({ min: 0, max: Math.fround(22.6), noNaN: true }),
  { nil: null },
);

/**
 * Generate a valid atomic mass (unified atomic mass units, 1–294).
 * Range covers Hydrogen (≈1) through Oganesson (≈294).
 */
const arbAtomicMass = fc.float({
  min: Math.fround(1),
  max: Math.fround(294),
  noNaN: true,
});

/** Generate a full ElementForStats record with arbitrary property values. */
const arbElement: fc.Arbitrary<ElementForStats> = fc.record({
  electronegativity: arbElectronegativity,
  density: arbDensity,
  atomicMass: arbAtomicMass,
});

// ---------------------------------------------------------------------------
// Ordered rarity tiers (ascending multiplier order)
// ---------------------------------------------------------------------------

const RARITY_ORDER: LootRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

// ---------------------------------------------------------------------------
// Property 4: Rarity ordering
// ---------------------------------------------------------------------------

describe('LootSystem — Property 4: Rarity ordering', () => {
  /**
   * **Validates: Requirements 9.4**
   *
   * For any element with at least one non-zero base stat, the total stat sum
   * after applying the rarity multiplier is strictly increasing across:
   *   Common < Uncommon < Rare < Epic < Legendary
   *
   * Proof sketch:
   *   totalSum(rarity) = totalBaseSum × RARITY_MULTIPLIERS[rarity]
   *   Since RARITY_MULTIPLIERS are strictly increasing
   *   (1.0 < 1.5 < 2.5 < 4.0 < 7.0) and totalBaseSum > 0 (non-degenerate),
   *   the product is strictly increasing.
   */
  it('total stat sum is strictly increasing across Common < Uncommon < Rare < Epic < Legendary', () => {
    fc.assert(
      fc.property(arbElement, (element) => {
        const base = deriveBaseStats(element);

        // Exclude the degenerate case where all base stats are 0.
        fc.pre(!allStatsZero(base));

        // Compute total stat sum for each rarity tier.
        const sums = RARITY_ORDER.map((rarity) =>
          totalStatSum(applyRarityMultiplier(base, rarity)),
        );

        // Verify strict ordering: each tier must be strictly greater than the previous.
        for (let i = 1; i < sums.length; i++) {
          if (sums[i] <= sums[i - 1]) {
            return false;
          }
        }
        return true;
      }),
      {
        numRuns: 2000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Verify each consecutive rarity pair individually for clarity.
   * Common < Uncommon
   */
  it('Common total stat sum is strictly less than Uncommon', () => {
    fc.assert(
      fc.property(arbElement, (element) => {
        const base = deriveBaseStats(element);
        fc.pre(!allStatsZero(base));

        const common   = totalStatSum(applyRarityMultiplier(base, 'Common'));
        const uncommon = totalStatSum(applyRarityMultiplier(base, 'Uncommon'));

        return common < uncommon;
      }),
      { numRuns: 1000, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Uncommon < Rare
   */
  it('Uncommon total stat sum is strictly less than Rare', () => {
    fc.assert(
      fc.property(arbElement, (element) => {
        const base = deriveBaseStats(element);
        fc.pre(!allStatsZero(base));

        const uncommon = totalStatSum(applyRarityMultiplier(base, 'Uncommon'));
        const rare     = totalStatSum(applyRarityMultiplier(base, 'Rare'));

        return uncommon < rare;
      }),
      { numRuns: 1000, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Rare < Epic
   */
  it('Rare total stat sum is strictly less than Epic', () => {
    fc.assert(
      fc.property(arbElement, (element) => {
        const base = deriveBaseStats(element);
        fc.pre(!allStatsZero(base));

        const rare = totalStatSum(applyRarityMultiplier(base, 'Rare'));
        const epic = totalStatSum(applyRarityMultiplier(base, 'Epic'));

        return rare < epic;
      }),
      { numRuns: 1000, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Epic < Legendary
   */
  it('Epic total stat sum is strictly less than Legendary', () => {
    fc.assert(
      fc.property(arbElement, (element) => {
        const base = deriveBaseStats(element);
        fc.pre(!allStatsZero(base));

        const epic      = totalStatSum(applyRarityMultiplier(base, 'Epic'));
        const legendary = totalStatSum(applyRarityMultiplier(base, 'Legendary'));

        return epic < legendary;
      }),
      { numRuns: 1000, verbose: true },
    );
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Degenerate case: an element with null electronegativity, null density,
   * and atomicMass = 1 produces all-zero base stats. The total stat sum
   * must be 0 for every rarity tier (0 × multiplier = 0).
   *
   * This confirms the degenerate case is handled correctly and is correctly
   * excluded from the strict ordering test above.
   */
  it('degenerate element (all-zero base stats) has total stat sum 0 for all rarities', () => {
    const degenerate: ElementForStats = {
      electronegativity: null,
      density: null,
      atomicMass: 1,
    };
    const base = deriveBaseStats(degenerate);
    expect(allStatsZero(base)).toBe(true);

    for (const rarity of RARITY_ORDER) {
      const scaled = applyRarityMultiplier(base, rarity);
      expect(totalStatSum(scaled)).toBe(0);
    }
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Verify the multiplier values themselves are strictly increasing.
   * This is a sanity check on the RARITY_MULTIPLIERS constant.
   */
  it('RARITY_MULTIPLIERS are strictly increasing across the rarity order', () => {
    for (let i = 1; i < RARITY_ORDER.length; i++) {
      const prev = RARITY_MULTIPLIERS[RARITY_ORDER[i - 1]];
      const curr = RARITY_MULTIPLIERS[RARITY_ORDER[i]];
      expect(curr).toBeGreaterThan(prev);
    }
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Concrete example: Iron (Fe) — a well-known element with non-null
   * electronegativity and density — must satisfy the strict ordering.
   */
  it('Iron (Fe) satisfies strict rarity ordering', () => {
    const iron: ElementForStats = {
      electronegativity: 1.83,
      density: 7.874,
      atomicMass: 55.845,
    };
    const base = deriveBaseStats(iron);
    expect(allStatsZero(base)).toBe(false);

    const sums = RARITY_ORDER.map((rarity) =>
      totalStatSum(applyRarityMultiplier(base, rarity)),
    );

    for (let i = 1; i < sums.length; i++) {
      expect(sums[i]).toBeGreaterThan(sums[i - 1]);
    }
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Concrete example: Fluorine (F) — highest electronegativity, low density —
   * must satisfy the strict ordering.
   */
  it('Fluorine (F) satisfies strict rarity ordering', () => {
    const fluorine: ElementForStats = {
      electronegativity: 3.98,
      density: 1.696,
      atomicMass: 18.998,
    };
    const base = deriveBaseStats(fluorine);
    expect(allStatsZero(base)).toBe(false);

    const sums = RARITY_ORDER.map((rarity) =>
      totalStatSum(applyRarityMultiplier(base, rarity)),
    );

    for (let i = 1; i < sums.length; i++) {
      expect(sums[i]).toBeGreaterThan(sums[i - 1]);
    }
  });

  /**
   * **Validates: Requirements 9.4**
   *
   * Concrete example: Osmium (Os) — highest density — must satisfy the
   * strict ordering.
   */
  it('Osmium (Os) satisfies strict rarity ordering', () => {
    const osmium: ElementForStats = {
      electronegativity: 2.2,
      density: 22.59,
      atomicMass: 190.23,
    };
    const base = deriveBaseStats(osmium);
    expect(allStatsZero(base)).toBe(false);

    const sums = RARITY_ORDER.map((rarity) =>
      totalStatSum(applyRarityMultiplier(base, rarity)),
    );

    for (let i = 1; i < sums.length; i++) {
      expect(sums[i]).toBeGreaterThan(sums[i - 1]);
    }
  });
});
