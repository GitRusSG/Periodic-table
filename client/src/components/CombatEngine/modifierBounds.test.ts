/**
 * Property-based tests for CombatEngine strength/weakness modifier bounds.
 *
 * **Validates: Requirements 8.2, 8.3**
 *
 * Property 2: Modifier bounds — damage and defense values after modifier
 * application are always non-negative and do not exceed a defined maximum.
 *
 * Specifically:
 *   - TurnResult.damageDealt >= 0 for any valid (CombatState, CombatAction)
 *   - TurnResult.damageTaken >= 0 for any valid (CombatState, CombatAction)
 *   - TurnResult.damageDealt <= MAX_DAMAGE (10× attacker's base attack stat)
 *   - TurnResult.damageTaken <= MAX_DAMAGE (10× element's base attack stat)
 *   - StatusEffect.potency > 0 for all applied status effects
 *   - StatusEffect.duration > 0 for all applied status effects
 *
 * Uses fast-check with the same arbitrary generators pattern as combatEngine.test.ts.
 */

import { describe, it } from 'vitest';
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
// Arbitraries (generators) — mirrored from combatEngine.test.ts
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
// Maximum damage bound
// ---------------------------------------------------------------------------

/**
 * The maximum allowable damage dealt by the player in a single turn.
 * Defined as 10× the attacker's base attack stat.
 *
 * Rationale: special attacks deal 1.5× base, variance is at most 1.2×,
 * so the theoretical ceiling is 1.5 × 1.2 × attack = 1.8× attack.
 * Using 10× gives a generous but finite upper bound that no legitimate
 * modifier combination can exceed.
 */
function maxDamageDealt(state: CombatState): number {
  return state.player.attack * 10;
}

/**
 * The maximum allowable damage taken by the player in a single turn.
 * Defined as 10× the element's base attack stat.
 *
 * Rationale: alkali metal burst is 1.4×, oxygen-group multi-hit is 1.2×,
 * variance is at most 1.2×, so the ceiling is well below 10×.
 */
function maxDamageTaken(state: CombatState): number {
  return state.element.attack * 10;
}

// ---------------------------------------------------------------------------
// Property 2: Modifier bounds
// ---------------------------------------------------------------------------

describe('CombatEngine — Property 2: Modifier bounds', () => {
  /**
   * **Validates: Requirements 8.2, 8.3**
   *
   * damageDealt must always be >= 0.
   * No modifier (density armor, defense subtraction, etc.) should produce
   * negative damage — the engine clamps with Math.max(0, ...).
   */
  it('damageDealt is always non-negative', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result = resolveTurn(state, action);
        return result.damageDealt >= 0;
      }),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 8.2, 8.3**
   *
   * damageTaken must always be >= 0.
   * Player defense subtraction must never produce a negative value.
   */
  it('damageTaken is always non-negative', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result = resolveTurn(state, action);
        return result.damageTaken >= 0;
      }),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 8.2, 8.3**
   *
   * damageDealt must not exceed 10× the player's base attack stat.
   * This ensures no modifier combination can produce runaway damage values.
   */
  it('damageDealt does not exceed 10× the player base attack stat', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result = resolveTurn(state, action);
        return result.damageDealt <= maxDamageDealt(state);
      }),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 8.2, 8.3**
   *
   * damageTaken must not exceed 10× the element's base attack stat.
   * This ensures alkali burst, multi-hit, and variance cannot combine to
   * produce unbounded damage.
   */
  it('damageTaken does not exceed 10× the element base attack stat', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result = resolveTurn(state, action);
        return result.damageTaken <= maxDamageTaken(state);
      }),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 8.2, 8.3**
   *
   * All applied status effects must have positive potency values.
   * A potency of 0 or below would be a no-op or harmful to game logic.
   */
  it('all applied status effects have positive potency', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result = resolveTurn(state, action);
        return result.statusEffectsApplied.every((effect) => effect.potency > 0);
      }),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 8.2, 8.3**
   *
   * All applied status effects must have positive duration values.
   * A duration of 0 or below would mean the effect expires immediately
   * and should never be added to the result.
   */
  it('all applied status effects have positive duration', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result = resolveTurn(state, action);
        return result.statusEffectsApplied.every((effect) => effect.duration > 0);
      }),
      {
        numRuns: 1000,
        verbose: true,
      },
    );
  });

  /**
   * **Validates: Requirements 8.2, 8.3**
   *
   * Combined bound check: both damageDealt and damageTaken are simultaneously
   * non-negative and within their respective maximums in a single pass.
   * This is the core modifier-bounds property.
   */
  it('damageDealt and damageTaken are simultaneously within bounds', () => {
    fc.assert(
      fc.property(arbCombatState, arbCombatAction, (state, action) => {
        const result = resolveTurn(state, action);
        const dealtOk =
          result.damageDealt >= 0 && result.damageDealt <= maxDamageDealt(state);
        const takenOk =
          result.damageTaken >= 0 && result.damageTaken <= maxDamageTaken(state);
        return dealtOk && takenOk;
      }),
      {
        numRuns: 2000,
        verbose: true,
      },
    );
  });
});
