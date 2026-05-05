/**
 * Property-based tests for LootSystem stat derivation.
 *
 * **Validates: Requirements 9.8**
 *
 * Property 3: Stat monotonicity
 *   - For any two elements where element A has strictly higher electronegativity
 *     than element B, `deriveBaseStats(A).attack >= deriveBaseStats(B).attack`.
 *   - For any two elements where element A has strictly higher density than
 *     element B, `deriveBaseStats(A).defense >= deriveBaseStats(B).defense`.
 *   - For any two elements where element A has strictly higher atomicMass than
 *     element B, `deriveBaseStats(A).energy >= deriveBaseStats(B).energy` and
 *     `deriveBaseStats(A).weight >= deriveBaseStats(B).weight`.
 *
 * Uses fast-check to generate arbitrary element pairs and verify that the
 * stat derivation function is monotonically non-decreasing with respect to
 * each source property.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  deriveBaseStats,
  normalize,
  ElementForStats,
} from './lootStats';

// ---------------------------------------------------------------------------
// Arbitraries (generators)
// ---------------------------------------------------------------------------

/**
 * Generate a nullable electronegativity value on the Pauling scale (0–4).
 * null represents elements for which electronegativity is not defined
 * (e.g., noble gases).
 */
const arbElectronegativity = fc.option(
  fc.float({ min: 0, max: Math.fround(4), noNaN: true }),
  { nil: null },
);

/**
 * Generate a nullable density value (g/cm³ at STP, 0–22.6).
 * null represents elements whose density is not well-defined at STP
 * (e.g., gaseous elements at standard conditions where measurement varies).
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
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build an element with a specific electronegativity, leaving other
 * properties at neutral defaults.
 */
function elementWithElectronegativity(en: number | null): ElementForStats {
  return { electronegativity: en, density: null, atomicMass: 1 };
}

/**
 * Build an element with a specific density, leaving other properties
 * at neutral defaults.
 */
function elementWithDensity(d: number | null): ElementForStats {
  return { electronegativity: null, density: d, atomicMass: 1 };
}

/**
 * Build an element with a specific atomic mass, leaving other properties
 * at neutral defaults.
 */
function elementWithAtomicMass(m: number): ElementForStats {
  return { electronegativity: null, density: null, atomicMass: m };
}

// ---------------------------------------------------------------------------
// Property 3: Stat monotonicity
// ---------------------------------------------------------------------------

describe('LootSystem — Property 3: Stat monotonicity', () => {
  /**
   * **Validates: Requirements 9.8**
   *
   * attack is derived from electronegativity via normalize(en, 0, 4) × 10.
   * normalize is monotonically non-decreasing, so if enA > enB then
   * attack(A) >= attack(B).
   *
   * We generate pairs (enA, enB) where enA > enB (both non-null) and verify
   * the attack ordering holds.
   */
  it('attack is monotonically non-decreasing with electronegativity', () => {
    fc.assert(
      fc.property(
        // Generate two distinct non-null electronegativity values.
        fc.float({ min: 0, max: Math.fround(4), noNaN: true }),
        fc.float({ min: 0, max: Math.fround(4), noNaN: true }),
        (enA, enB) => {
          // Ensure A has strictly higher electronegativity than B.
          const higher = Math.max(enA, enB);
          const lower  = Math.min(enA, enB);

          // Skip degenerate case where both values are equal.
          fc.pre(higher > lower);

          const statsA = deriveBaseStats(elementWithElectronegativity(higher));
          const statsB = deriveBaseStats(elementWithElectronegativity(lower));

          return statsA.attack >= statsB.attack;
        },
      ),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 9.8**
   *
   * debuffPotency shares the same derivation as attack (both use
   * normalize(electronegativity, 0, 4) × 10), so the same monotonicity
   * property must hold.
   */
  it('debuffPotency is monotonically non-decreasing with electronegativity', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(4), noNaN: true }),
        fc.float({ min: 0, max: Math.fround(4), noNaN: true }),
        (enA, enB) => {
          const higher = Math.max(enA, enB);
          const lower  = Math.min(enA, enB);
          fc.pre(higher > lower);

          const statsA = deriveBaseStats(elementWithElectronegativity(higher));
          const statsB = deriveBaseStats(elementWithElectronegativity(lower));

          return statsA.debuffPotency >= statsB.debuffPotency;
        },
      ),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 9.8**
   *
   * defense is derived from density via normalize(density, 0, 22.6) × 10.
   * If densityA > densityB then defense(A) >= defense(B).
   */
  it('defense is monotonically non-decreasing with density', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(22.6), noNaN: true }),
        fc.float({ min: 0, max: Math.fround(22.6), noNaN: true }),
        (dA, dB) => {
          const higher = Math.max(dA, dB);
          const lower  = Math.min(dA, dB);
          fc.pre(higher > lower);

          const statsA = deriveBaseStats(elementWithDensity(higher));
          const statsB = deriveBaseStats(elementWithDensity(lower));

          return statsA.defense >= statsB.defense;
        },
      ),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 9.8**
   *
   * energy is derived from atomicMass via normalize(atomicMass, 1, 294) × 10.
   * If massA > massB then energy(A) >= energy(B).
   */
  it('energy is monotonically non-decreasing with atomicMass', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(1), max: Math.fround(294), noNaN: true }),
        fc.float({ min: Math.fround(1), max: Math.fround(294), noNaN: true }),
        (mA, mB) => {
          const higher = Math.max(mA, mB);
          const lower  = Math.min(mA, mB);
          fc.pre(higher > lower);

          const statsA = deriveBaseStats(elementWithAtomicMass(higher));
          const statsB = deriveBaseStats(elementWithAtomicMass(lower));

          return statsA.energy >= statsB.energy;
        },
      ),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 9.8**
   *
   * weight shares the same derivation as energy (both use
   * normalize(atomicMass, 1, 294) × 10), so the same monotonicity
   * property must hold.
   */
  it('weight is monotonically non-decreasing with atomicMass', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(1), max: Math.fround(294), noNaN: true }),
        fc.float({ min: Math.fround(1), max: Math.fround(294), noNaN: true }),
        (mA, mB) => {
          const higher = Math.max(mA, mB);
          const lower  = Math.min(mA, mB);
          fc.pre(higher > lower);

          const statsA = deriveBaseStats(elementWithAtomicMass(higher));
          const statsB = deriveBaseStats(elementWithAtomicMass(lower));

          return statsA.weight >= statsB.weight;
        },
      ),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 9.8**
   *
   * Null electronegativity is treated as 0 (element has no electronegativity
   * defined). Any element with a positive electronegativity must have
   * attack >= attack of a null-electronegativity element.
   */
  it('null electronegativity yields attack no greater than any positive electronegativity', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(4), noNaN: true }),
        (en) => {
          const statsWithEn   = deriveBaseStats(elementWithElectronegativity(en));
          const statsWithNull = deriveBaseStats(elementWithElectronegativity(null));

          // null is treated as 0, so any positive en should give >= attack.
          return statsWithEn.attack >= statsWithNull.attack;
        },
      ),
      {
        numRuns: 500,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 9.8**
   *
   * Null density is treated as 0. Any element with positive density must
   * have defense >= defense of a null-density element.
   */
  it('null density yields defense no greater than any positive density', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(22.6), noNaN: true }),
        (d) => {
          const statsWithD    = deriveBaseStats(elementWithDensity(d));
          const statsWithNull = deriveBaseStats(elementWithDensity(null));

          return statsWithD.defense >= statsWithNull.defense;
        },
      ),
      {
        numRuns: 500,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 9.8**
   *
   * Full element pair test: for any two arbitrary elements where element A
   * has strictly higher electronegativity than element B (both non-null),
   * deriveBaseStats(A).attack >= deriveBaseStats(B).attack.
   *
   * This is the primary statement of Property 3 from the task spec.
   */
  it('for arbitrary element pairs, higher electronegativity implies higher or equal attack', () => {
    fc.assert(
      fc.property(
        arbElement,
        arbElement,
        (elemA, elemB) => {
          // Both must have non-null electronegativity for the ordering to apply.
          fc.pre(elemA.electronegativity !== null && elemB.electronegativity !== null);
          // Element A must have strictly higher electronegativity.
          fc.pre(elemA.electronegativity! > elemB.electronegativity!);

          const statsA = deriveBaseStats(elemA);
          const statsB = deriveBaseStats(elemB);

          return statsA.attack >= statsB.attack;
        },
      ),
      {
        numRuns: 2000,
        verbose: true,
      },
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — normalize helper
// ---------------------------------------------------------------------------

describe('LootSystem — normalize helper', () => {
  it('returns 0 for null input', () => {
    expect(normalize(null, 0, 4)).toBe(0);
  });

  it('returns 0 for value at minimum', () => {
    expect(normalize(0, 0, 4)).toBe(0);
  });

  it('returns 1 for value at maximum', () => {
    expect(normalize(4, 0, 4)).toBe(1);
  });

  it('returns 0.5 for midpoint value', () => {
    expect(normalize(2, 0, 4)).toBe(0.5);
  });

  it('clamps values below minimum to 0', () => {
    expect(normalize(-1, 0, 4)).toBe(0);
  });

  it('clamps values above maximum to 1', () => {
    expect(normalize(5, 0, 4)).toBe(1);
  });

  it('returns 0 for degenerate range (min === max)', () => {
    expect(normalize(3, 3, 3)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Unit tests — deriveBaseStats specific examples
// ---------------------------------------------------------------------------

describe('LootSystem — deriveBaseStats unit tests', () => {
  it('Fluorine (highest electronegativity 3.98) has near-maximum attack', () => {
    const fluorine: ElementForStats = {
      electronegativity: 3.98,
      density: 1.696,
      atomicMass: 18.998,
    };
    const stats = deriveBaseStats(fluorine);
    // normalize(3.98, 0, 4) * 10 ≈ 9.95
    expect(stats.attack).toBeCloseTo(9.95, 1);
  });

  it('Osmium (highest density 22.59) has near-maximum defense', () => {
    const osmium: ElementForStats = {
      electronegativity: 2.2,
      density: 22.59,
      atomicMass: 190.23,
    };
    const stats = deriveBaseStats(osmium);
    // normalize(22.59, 0, 22.6) * 10 ≈ 9.996
    expect(stats.defense).toBeCloseTo(9.996, 1);
  });

  it('Oganesson (highest atomic mass ~294) has near-maximum energy and weight', () => {
    const oganesson: ElementForStats = {
      electronegativity: null,
      density: null,
      atomicMass: 294,
    };
    const stats = deriveBaseStats(oganesson);
    // normalize(294, 1, 294) * 10 = 10
    expect(stats.energy).toBeCloseTo(10, 5);
    expect(stats.weight).toBeCloseTo(10, 5);
  });

  it('Hydrogen (lowest atomic mass ~1.008) has near-zero energy and weight', () => {
    const hydrogen: ElementForStats = {
      electronegativity: 2.2,
      density: 0.0000899,
      atomicMass: 1.008,
    };
    const stats = deriveBaseStats(hydrogen);
    // normalize(1.008, 1, 294) * 10 = (0.008 / 293) * 10 ≈ 0.000273
    expect(stats.energy).toBeCloseTo(0.000273, 4);
    expect(stats.weight).toBeCloseTo(0.000273, 4);
  });

  it('noble gas with null electronegativity has zero attack and debuffPotency', () => {
    const helium: ElementForStats = {
      electronegativity: null,
      density: null,
      atomicMass: 4.003,
    };
    const stats = deriveBaseStats(helium);
    expect(stats.attack).toBe(0);
    expect(stats.debuffPotency).toBe(0);
  });

  it('attack and debuffPotency are always equal (same derivation)', () => {
    fc.assert(
      fc.property(arbElement, (element) => {
        const stats = deriveBaseStats(element);
        return stats.attack === stats.debuffPotency;
      }),
      { numRuns: 500 },
    );
  });

  it('energy and weight are always equal (same derivation)', () => {
    fc.assert(
      fc.property(arbElement, (element) => {
        const stats = deriveBaseStats(element);
        return stats.energy === stats.weight;
      }),
      { numRuns: 500 },
    );
  });

  it('all stats are in the range [0, 10]', () => {
    fc.assert(
      fc.property(arbElement, (element) => {
        const stats = deriveBaseStats(element);
        return (
          stats.attack        >= 0 && stats.attack        <= 10 &&
          stats.defense       >= 0 && stats.defense       <= 10 &&
          stats.energy        >= 0 && stats.energy        <= 10 &&
          stats.weight        >= 0 && stats.weight        <= 10 &&
          stats.debuffPotency >= 0 && stats.debuffPotency <= 10
        );
      }),
      { numRuns: 1000 },
    );
  });
});
