/**
 * Property-based tests for LootSystem drop rate ordering.
 *
 * **Validates: Requirements 9.3**
 *
 * Property 5: Drop rate ordering
 *   Across a large sample of rolls, Common items drop more frequently than
 *   Uncommon, Uncommon more than Rare, Rare more than Epic, and Epic more
 *   than Legendary.
 *
 * This is a statistical property. A fixed seed is used for reproducibility.
 * The large gap between rarity tiers (70% vs 20% vs 7% vs 2.5% vs 0.5%)
 * ensures the ordering holds reliably at 10,000 rolls.
 *
 * Zones tested:
 *   - Neutral: standard drop rates, no zone multipliers (all multipliers = 1.0)
 *   - Combat: standard drop rates, no zone multipliers (all multipliers = 1.0)
 *
 * Note: Boss and Anomalous zones are intentionally excluded from this test
 * because their zone multipliers significantly boost higher-rarity weights,
 * which can cause Uncommon to drop less than Rare (Boss) or Common to drop
 * less than Uncommon (Anomalous). The ordering property (Req 9.3) applies to
 * the base drop rate model, which is exercised by Neutral and Combat zones.
 */

import { describe, it, expect } from 'vitest';
import { createPrng } from '../CombatEngine/combatEngine';
import { DetermineDropTable, LootRarity } from '../CombatEngine/zoneEncounter';
import type { DropTable } from '../CombatEngine/zoneEncounter';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of rolls per statistical test. Large enough to be reliable. */
const SAMPLE_SIZE = 10_000;

/**
 * Fixed seed for reproducibility.
 * Using a well-known constant so the test is deterministic across runs.
 */
const FIXED_SEED = 0xdeadbeef;

/** Ordered rarity tiers from most common to most rare. */
const RARITY_ORDER: LootRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Roll `count` items from the given drop table using a seeded PRNG and
 * return a frequency map of how many times each rarity was rolled.
 */
function rollFrequencies(
  dropTable: DropTable,
  count: number,
  seed: number,
): Record<LootRarity, number> {
  const prng = createPrng(seed);
  const frequencies: Record<LootRarity, number> = {
    Common: 0,
    Uncommon: 0,
    Rare: 0,
    Epic: 0,
    Legendary: 0,
  };

  const totalWeight = dropTable.entries.reduce((sum, e) => sum + e.weight, 0);

  for (let i = 0; i < count; i++) {
    let roll = prng() * totalWeight;
    for (const entry of dropTable.entries) {
      roll -= entry.weight;
      if (roll <= 0) {
        frequencies[entry.rarity]++;
        break;
      }
    }
  }

  return frequencies;
}

/**
 * Verify that the frequency map satisfies the strict ordering:
 *   Common > Uncommon > Rare > Epic > Legendary
 *
 * Returns true if the ordering holds, false otherwise.
 */
function frequenciesAreOrdered(frequencies: Record<LootRarity, number>): boolean {
  for (let i = 0; i < RARITY_ORDER.length - 1; i++) {
    const higher = frequencies[RARITY_ORDER[i]];
    const lower  = frequencies[RARITY_ORDER[i + 1]];
    if (higher <= lower) {
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Property 5: Drop rate ordering — Neutral zone
// ---------------------------------------------------------------------------

describe('LootSystem — Property 5: Drop rate ordering (Neutral zone)', () => {
  /**
   * **Validates: Requirements 9.3**
   *
   * Across 10,000 rolls in the Neutral zone (standard drop rates, no zone
   * multipliers), Common items must drop more frequently than Uncommon,
   * Uncommon more than Rare, Rare more than Epic, and Epic more than Legendary.
   *
   * Base rates: Common 70%, Uncommon 20%, Rare 7%, Epic 2.5%, Legendary 0.5%
   * The large gaps between tiers make this ordering extremely reliable at
   * 10,000 samples.
   */
  it('Common drops more frequently than Uncommon, Rare, Epic, and Legendary', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequencies.Common).toBeGreaterThan(frequencies.Uncommon);
    expect(frequencies.Common).toBeGreaterThan(frequencies.Rare);
    expect(frequencies.Common).toBeGreaterThan(frequencies.Epic);
    expect(frequencies.Common).toBeGreaterThan(frequencies.Legendary);
  });

  it('Uncommon drops more frequently than Rare, Epic, and Legendary', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequencies.Uncommon).toBeGreaterThan(frequencies.Rare);
    expect(frequencies.Uncommon).toBeGreaterThan(frequencies.Epic);
    expect(frequencies.Uncommon).toBeGreaterThan(frequencies.Legendary);
  });

  it('Rare drops more frequently than Epic and Legendary', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequencies.Rare).toBeGreaterThan(frequencies.Epic);
    expect(frequencies.Rare).toBeGreaterThan(frequencies.Legendary);
  });

  it('Epic drops more frequently than Legendary', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequencies.Epic).toBeGreaterThan(frequencies.Legendary);
  });

  it('full ordering holds: Common > Uncommon > Rare > Epic > Legendary', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequenciesAreOrdered(frequencies)).toBe(true);
  });

  it('ordering holds across all difficulty levels (Neutral zone)', () => {
    const difficulties = [1, 2, 3, 4, 5] as const;

    for (const difficulty of difficulties) {
      const dropTable = DetermineDropTable('Neutral', difficulty);
      const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

      expect(frequenciesAreOrdered(frequencies)).toBe(true);
    }
  });

  it('ordering holds with multiple independent seeds (Neutral zone)', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const seeds = [0, 1, 42, 12345, 0xcafebabe, 0x12345678];

    for (const seed of seeds) {
      const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, seed);
      expect(frequenciesAreOrdered(frequencies)).toBe(true);
    }
  });

  it('observed Common frequency is approximately 70% (within 3%)', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    const commonRate = frequencies.Common / SAMPLE_SIZE;
    expect(commonRate).toBeGreaterThan(0.67);
    expect(commonRate).toBeLessThan(0.73);
  });

  it('observed Uncommon frequency is approximately 20% (within 3%)', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    const uncommonRate = frequencies.Uncommon / SAMPLE_SIZE;
    expect(uncommonRate).toBeGreaterThan(0.17);
    expect(uncommonRate).toBeLessThan(0.23);
  });

  it('observed Rare frequency is approximately 7% (within 2%)', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    const rareRate = frequencies.Rare / SAMPLE_SIZE;
    expect(rareRate).toBeGreaterThan(0.05);
    expect(rareRate).toBeLessThan(0.09);
  });

  it('observed Epic frequency is approximately 2.5% (within 1.5%)', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    const epicRate = frequencies.Epic / SAMPLE_SIZE;
    expect(epicRate).toBeGreaterThan(0.01);
    expect(epicRate).toBeLessThan(0.04);
  });

  it('observed Legendary frequency is approximately 0.5% (within 0.5%)', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    const legendaryRate = frequencies.Legendary / SAMPLE_SIZE;
    expect(legendaryRate).toBeGreaterThan(0.0);
    expect(legendaryRate).toBeLessThan(0.01);
  });

  it('all rolls are accounted for (frequencies sum to SAMPLE_SIZE)', () => {
    const dropTable = DetermineDropTable('Neutral', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    const total = Object.values(frequencies).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(SAMPLE_SIZE);
  });
});

// ---------------------------------------------------------------------------
// Property 5: Drop rate ordering — Combat zone
// ---------------------------------------------------------------------------

describe('LootSystem — Property 5: Drop rate ordering (Combat zone)', () => {
  /**
   * **Validates: Requirements 9.3**
   *
   * The Combat zone uses the same multipliers as Neutral (all 1.0), so the
   * base drop rate ordering must hold identically.
   *
   * Base rates: Common 70%, Uncommon 20%, Rare 7%, Epic 2.5%, Legendary 0.5%
   */
  it('full ordering holds: Common > Uncommon > Rare > Epic > Legendary', () => {
    const dropTable = DetermineDropTable('Combat', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequenciesAreOrdered(frequencies)).toBe(true);
  });

  it('Common drops more frequently than Uncommon in Combat zone', () => {
    const dropTable = DetermineDropTable('Combat', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequencies.Common).toBeGreaterThan(frequencies.Uncommon);
  });

  it('Uncommon drops more frequently than Rare in Combat zone', () => {
    const dropTable = DetermineDropTable('Combat', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequencies.Uncommon).toBeGreaterThan(frequencies.Rare);
  });

  it('Rare drops more frequently than Epic in Combat zone', () => {
    const dropTable = DetermineDropTable('Combat', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequencies.Rare).toBeGreaterThan(frequencies.Epic);
  });

  it('Epic drops more frequently than Legendary in Combat zone', () => {
    const dropTable = DetermineDropTable('Combat', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    expect(frequencies.Epic).toBeGreaterThan(frequencies.Legendary);
  });

  it('ordering holds across all difficulty levels (Combat zone)', () => {
    const difficulties = [1, 2, 3, 4, 5] as const;

    for (const difficulty of difficulties) {
      const dropTable = DetermineDropTable('Combat', difficulty);
      const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

      expect(frequenciesAreOrdered(frequencies)).toBe(true);
    }
  });

  it('ordering holds with multiple independent seeds (Combat zone)', () => {
    const dropTable = DetermineDropTable('Combat', 1);
    const seeds = [0, 1, 42, 12345, 0xcafebabe, 0x12345678];

    for (const seed of seeds) {
      const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, seed);
      expect(frequenciesAreOrdered(frequencies)).toBe(true);
    }
  });

  it('all rolls are accounted for (frequencies sum to SAMPLE_SIZE)', () => {
    const dropTable = DetermineDropTable('Combat', 1);
    const frequencies = rollFrequencies(dropTable, SAMPLE_SIZE, FIXED_SEED);

    const total = Object.values(frequencies).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(SAMPLE_SIZE);
  });
});

// ---------------------------------------------------------------------------
// Cross-zone comparison: Neutral and Combat have identical base rates
// ---------------------------------------------------------------------------

describe('LootSystem — Neutral and Combat zones share identical base drop rates', () => {
  /**
   * **Validates: Requirements 9.3**
   *
   * Both Neutral and Combat zones use all-1.0 multipliers, so their drop
   * tables should produce statistically equivalent frequencies.
   * We verify this by checking that both tables have the same weights.
   */
  it('Neutral and Combat drop tables have identical weights', () => {
    const neutralTable = DetermineDropTable('Neutral', 1);
    const combatTable  = DetermineDropTable('Combat', 1);

    for (const rarity of RARITY_ORDER) {
      const neutralEntry = neutralTable.entries.find((e) => e.rarity === rarity)!;
      const combatEntry  = combatTable.entries.find((e) => e.rarity === rarity)!;
      expect(combatEntry.weight).toBeCloseTo(neutralEntry.weight, 10);
    }
  });
});
