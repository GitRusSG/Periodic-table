/**
 * Property-based tests for CombatEngine turn resolution.
 *
 * **Validates: Requirements 8.2**
 *
 * Property 1: Determinism — given the same state and action,
 * `resolveTurn` always returns the same `TurnResult`.
 *
 * Uses fast-check to generate arbitrary (CombatState, CombatAction) pairs
 * and verifies that calling resolveTurn twice with identical inputs always
 * produces identical outputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  resolveTurn,
  CombatState,
  CombatAction,
  CombatantState,
  ElementStats,
  ElementClassification,
  ZoneType,
  StatusEffect,
} from './combatEngine';

// ---------------------------------------------------------------------------
// Arbitraries (generators)
// ---------------------------------------------------------------------------

/** Generate a valid 32-bit unsigned integer seed. */
const arbSeed = fc.integer({ min: 0, max: 2 ** 32 - 1 });

/** Generate a turn counter (non-negative integer). */
const arbTurn = fc.integer({ min: 0, max: 1000 });

/** Generate a valid difficulty level. */
const arbDifficultyLevel = fc.integer({ min: 1, max: 5 }) as fc.Arbitrary<
  1 | 2 | 3 | 4 | 5
>;

/** Generate a valid element classification. */
const arbClassification: fc.Arbitrary<ElementClassification> = fc.constantFrom(
  'alkali_metal',
  'alkaline_earth_metal',
  'transition_metal',
  'post_transition_metal',
  'metalloid',
  'nonmetal',
  'halogen',
  'noble_gas',
  'lanthanide',
  'actinide',
);

/** Generate a valid zone type. */
const arbZone: fc.Arbitrary<ZoneType> = fc.constantFrom(
  'Passive',
  'Combat',
  'Neutral',
  'Boss',
  'Anomalous',
);

/** Generate a nullable electronegativity value (Pauling scale 0–4). */
const arbElectronegativity = fc.option(
  fc.float({ min: 0, max: Math.fround(4), noNaN: true }),
  { nil: null },
);

/** Generate a nullable density value (g/cm³, 0–22.6). */
const arbDensity = fc.option(
  fc.float({ min: 0, max: Math.fround(22.6), noNaN: true }),
  { nil: null },
);

/** Generate a valid atomic mass (1–294). */
const arbAtomicMass = fc.float({ min: Math.fround(1), max: Math.fround(294), noNaN: true });

/** Generate an ElementStats record. */
const arbElementStats: fc.Arbitrary<ElementStats> = fc.record({
  atomicNumber: fc.integer({ min: 1, max: 118 }),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  classification: arbClassification,
  electronegativity: arbElectronegativity,
  atomicMass: arbAtomicMass,
  density: arbDensity,
  isRadioactive: fc.boolean(),
  zone: arbZone,
});

/** Generate a StatusEffect. */
const arbStatusEffect: fc.Arbitrary<StatusEffect> = fc.record({
  type: fc.constantFrom('radiation', 'corrosion', 'stagger', 'debuff') as fc.Arbitrary<
    StatusEffect['type']
  >,
  duration: fc.integer({ min: 1, max: 10 }),
  potency: fc.integer({ min: 1, max: 20 }),
});

/** Generate a CombatantState. */
const arbCombatant: fc.Arbitrary<CombatantState> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  hp: fc.integer({ min: 1, max: 1000 }),
  maxHp: fc.integer({ min: 1, max: 1000 }),
  attack: fc.integer({ min: 0, max: 100 }),
  defense: fc.integer({ min: 0, max: 100 }),
  statusEffects: fc.array(arbStatusEffect, { maxLength: 5 }),
});

/** Generate a full CombatState. */
const arbCombatState: fc.Arbitrary<CombatState> = fc.record({
  seed: arbSeed,
  turn: arbTurn,
  player: arbCombatant,
  element: arbCombatant,
  elementStats: arbElementStats,
  difficultyLevel: arbDifficultyLevel,
});

/** Generate a CombatAction. */
const arbCombatAction: fc.Arbitrary<CombatAction> = fc.record({
  type: fc.constantFrom('attack', 'defend', 'special', 'flee') as fc.Arbitrary<
    CombatAction['type']
  >,
  sourceId: fc.string({ minLength: 1, maxLength: 20 }),
  targetId: fc.string({ minLength: 1, maxLength: 20 }),
  modifiers: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
});

// ---------------------------------------------------------------------------
// Helper: deep equality check for TurnResult
// ---------------------------------------------------------------------------

/**
 * Returns true if two TurnResult values are structurally identical.
 * We use JSON serialization for a simple deep comparison.
 */
function turnResultsEqual(
  a: ReturnType<typeof resolveTurn>,
  b: ReturnType<typeof resolveTurn>,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------------------------------------------------------------------------
// Property 1: Determinism
// ---------------------------------------------------------------------------

describe('CombatEngine — Property 1: Determinism', () => {
  /**
   * **Validates: Requirements 8.2**
   *
   * For any (state, action) pair, calling resolveTurn twice with the same
   * inputs must always produce identical TurnResult values.
   *
   * This property ensures the combat engine is a pure function: no hidden
   * mutable state, no Date.now(), no Math.random() — all randomness is
   * derived from state.seed and state.turn via the seeded PRNG.
   */
  it('resolveTurn returns identical TurnResult for the same (state, action) pair', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result1 = resolveTurn(state, action);
        const result2 = resolveTurn(state, action);

        return turnResultsEqual(result1, result2);
      }),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  it('damageDealt is identical on repeated calls with the same inputs', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result1 = resolveTurn(state, action);
        const result2 = resolveTurn(state, action);

        return result1.damageDealt === result2.damageDealt;
      }),
      { numRuns: 500 },
    );
  });

  it('damageTaken is identical on repeated calls with the same inputs', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result1 = resolveTurn(state, action);
        const result2 = resolveTurn(state, action);

        return result1.damageTaken === result2.damageTaken;
      }),
      { numRuns: 500 },
    );
  });

  it('statusEffectsApplied is identical on repeated calls with the same inputs', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result1 = resolveTurn(state, action);
        const result2 = resolveTurn(state, action);

        return (
          JSON.stringify(result1.statusEffectsApplied) ===
          JSON.stringify(result2.statusEffectsApplied)
        );
      }),
      { numRuns: 500 },
    );
  });

  it('narrative is identical on repeated calls with the same inputs', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result1 = resolveTurn(state, action);
        const result2 = resolveTurn(state, action);

        return result1.narrative === result2.narrative;
      }),
      { numRuns: 500 },
    );
  });

  it('different seeds produce independent (not necessarily different) results', () => {
    // This is a sanity check: two different seeds CAN produce different results.
    // We verify that the engine does not ignore the seed entirely by checking
    // that at least some seed pairs produce different outcomes.
    let foundDifference = false;

    fc.assert(
      fc.property(
        arbCombatState,
        arbCombatAction,
        fc.integer({ min: 1, max: 2 ** 32 - 1 }),
        (state, action, seedOffset) => {
          const stateWithDifferentSeed: CombatState = {
            ...state,
            seed: (state.seed + seedOffset) % (2 ** 32),
          };

          const result1 = resolveTurn(state, action);
          const result2 = resolveTurn(stateWithDifferentSeed, action);

          if (!turnResultsEqual(result1, result2)) {
            foundDifference = true;
          }

          // Each individual call must still be deterministic.
          const result1Again = resolveTurn(state, action);
          const result2Again = resolveTurn(stateWithDifferentSeed, action);

          return (
            turnResultsEqual(result1, result1Again) &&
            turnResultsEqual(result2, result2Again)
          );
        },
      ),
      { numRuns: 200 },
    );

    // The PRNG must actually use the seed — different seeds should sometimes
    // produce different results.
    expect(foundDifference).toBe(true);
  });

  it('different turns produce independent results (each turn is deterministic)', () => {
    fc.assert(
      fc.property(
        arbCombatState,
        arbCombatAction,
        fc.integer({ min: 1, max: 500 }),
        (state, action, turnOffset) => {
          const stateAtTurn0 = { ...state, turn: state.turn };
          const stateAtTurn1 = { ...state, turn: state.turn + turnOffset };

          // Each call with the same state must be deterministic.
          const r0a = resolveTurn(stateAtTurn0, action);
          const r0b = resolveTurn(stateAtTurn0, action);
          const r1a = resolveTurn(stateAtTurn1, action);
          const r1b = resolveTurn(stateAtTurn1, action);

          return (
            turnResultsEqual(r0a, r0b) &&
            turnResultsEqual(r1a, r1b)
          );
        },
      ),
      { numRuns: 300 },
    );
  });
});

// ---------------------------------------------------------------------------
// Sanity / unit tests (specific examples)
// ---------------------------------------------------------------------------

describe('CombatEngine — unit tests (specific examples)', () => {
  const baseState: CombatState = {
    seed: 42,
    turn: 0,
    player: {
      id: 'player',
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 5,
      statusEffects: [],
    },
    element: {
      id: '26',
      hp: 80,
      maxHp: 80,
      attack: 15,
      defense: 8,
      statusEffects: [],
    },
    elementStats: {
      atomicNumber: 26,
      name: 'Iron',
      classification: 'transition_metal',
      electronegativity: 1.83,
      atomicMass: 55.845,
      density: 7.874,
      isRadioactive: false,
      zone: 'Neutral',
    },
    difficultyLevel: 1,
  };

  const attackAction: CombatAction = {
    type: 'attack',
    sourceId: 'player',
    targetId: '26',
    modifiers: [],
  };

  it('returns a TurnResult with the expected shape', () => {
    const result = resolveTurn(baseState, attackAction);

    expect(result).toHaveProperty('damageDealt');
    expect(result).toHaveProperty('damageTaken');
    expect(result).toHaveProperty('statusEffectsApplied');
    expect(result).toHaveProperty('narrative');
    expect(typeof result.damageDealt).toBe('number');
    expect(typeof result.damageTaken).toBe('number');
    expect(Array.isArray(result.statusEffectsApplied)).toBe(true);
    expect(typeof result.narrative).toBe('string');
  });

  it('produces identical results on two consecutive calls (determinism example)', () => {
    const result1 = resolveTurn(baseState, attackAction);
    const result2 = resolveTurn(baseState, attackAction);

    expect(result1).toEqual(result2);
  });

  it('flee action results in zero damageTaken', () => {
    const fleeAction: CombatAction = {
      type: 'flee',
      sourceId: 'player',
      targetId: '26',
      modifiers: [],
    };

    const result = resolveTurn(baseState, fleeAction);
    expect(result.damageTaken).toBe(0);
  });

  it('defend action reduces damageTaken compared to attack', () => {
    const defendAction: CombatAction = {
      type: 'defend',
      sourceId: 'player',
      targetId: '26',
      modifiers: [],
    };

    // Use the same seed/turn so the element's base attack roll is the same.
    const attackResult = resolveTurn(baseState, attackAction);
    const defendResult = resolveTurn(baseState, defendAction);

    // Defend should take less or equal damage than attack.
    expect(defendResult.damageTaken).toBeLessThanOrEqual(attackResult.damageTaken);
  });

  it('noble gas element does not apply status effects', () => {
    const nobleGasState: CombatState = {
      ...baseState,
      elementStats: {
        ...baseState.elementStats,
        atomicNumber: 2,
        name: 'Helium',
        classification: 'noble_gas',
        electronegativity: null,
        isRadioactive: false,
      },
    };

    const result = resolveTurn(nobleGasState, attackAction);
    // Noble gas is immune to debuffs — no corrosion or radiation effects.
    const debuffTypes = result.statusEffectsApplied.map((e) => e.type);
    expect(debuffTypes).not.toContain('corrosion');
    expect(debuffTypes).not.toContain('radiation');
  });

  it('halogen element applies corrosion status effect', () => {
    const halogenState: CombatState = {
      ...baseState,
      elementStats: {
        ...baseState.elementStats,
        atomicNumber: 9,
        name: 'Fluorine',
        classification: 'halogen',
        electronegativity: 3.98,
        isRadioactive: false,
      },
    };

    const result = resolveTurn(halogenState, attackAction);
    const types = result.statusEffectsApplied.map((e) => e.type);
    expect(types).toContain('corrosion');
  });

  it('radioactive element applies radiation status effect', () => {
    const radioactiveState: CombatState = {
      ...baseState,
      elementStats: {
        ...baseState.elementStats,
        atomicNumber: 92,
        name: 'Uranium',
        classification: 'actinide',
        electronegativity: 1.38,
        isRadioactive: true,
      },
    };

    const result = resolveTurn(radioactiveState, attackAction);
    const types = result.statusEffectsApplied.map((e) => e.type);
    expect(types).toContain('radiation');
  });

  it('special attack deals more damage than regular attack (same seed)', () => {
    const specialAction: CombatAction = { ...attackAction, type: 'special' };

    // Use a state where player attack is high enough that both deal > 0 damage.
    const highAttackState: CombatState = {
      ...baseState,
      player: { ...baseState.player, attack: 50 },
      element: { ...baseState.element, defense: 0 },
    };

    const attackResult = resolveTurn(highAttackState, attackAction);
    const specialResult = resolveTurn(highAttackState, specialAction);

    expect(specialResult.damageDealt).toBeGreaterThan(attackResult.damageDealt);
  });
});
