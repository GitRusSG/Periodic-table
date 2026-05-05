/**
 * CombatEngine — pure function module for turn-based combat resolution.
 *
 * Design spec (section 5.2):
 *   The CombatEngine is a pure function module. `resolveTurn(state, action): TurnResult`
 *   is a pure function, deterministic given seed.
 *
 * All randomness is driven by a seeded PRNG (mulberry32) so that the same
 * (state, action) pair always produces the same TurnResult — enabling
 * server-side loot recomputation and property-based determinism testing.
 *
 * Requirements: 8.1, 8.2
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ZoneType = 'Passive' | 'Combat' | 'Neutral' | 'Boss' | 'Anomalous';
export type ElementClassification =
  | 'alkali_metal'
  | 'alkaline_earth_metal'
  | 'transition_metal'
  | 'post_transition_metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble_gas'
  | 'lanthanide'
  | 'actinide';

export interface StatusEffect {
  type: 'radiation' | 'corrosion' | 'stagger' | 'debuff';
  duration: number; // turns remaining
  potency: number;
}

export interface CombatAction {
  type: 'attack' | 'defend' | 'special' | 'flee';
  sourceId: string;
  targetId: string;
  modifiers: string[];
}

export interface TurnResult {
  damageDealt: number;
  damageTaken: number;
  statusEffectsApplied: StatusEffect[];
  narrative: string;
}

export interface ElementStats {
  atomicNumber: number;
  name: string;
  classification: ElementClassification;
  electronegativity: number | null; // Pauling scale 0–4
  atomicMass: number;               // unified atomic mass units
  density: number | null;           // g/cm³
  isRadioactive: boolean;
  zone: ZoneType;
}

export interface CombatantState {
  id: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  statusEffects: StatusEffect[];
}

export interface CombatState {
  /** Deterministic seed for all random decisions in this encounter. */
  seed: number;
  /** Turn counter — incremented each time resolveTurn is called. */
  turn: number;
  player: CombatantState;
  element: CombatantState;
  elementStats: ElementStats;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

// ---------------------------------------------------------------------------
// Seeded PRNG — mulberry32
// ---------------------------------------------------------------------------

/**
 * Returns a deterministic pseudo-random number generator seeded with `seed`.
 * Each call to the returned function advances the internal state and returns
 * a float in [0, 1).
 *
 * Using mulberry32 because it is simple, fast, and produces good statistical
 * quality for game purposes.
 */
export function createPrng(seed: number): () => number {
  let s = seed >>> 0; // ensure 32-bit unsigned
  return function next(): number {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Modifier helpers
// ---------------------------------------------------------------------------

/**
 * Derive the effective seed for a specific turn so that each turn's PRNG
 * sequence is independent but still deterministic given (seed, turn).
 */
function turnSeed(baseSeed: number, turn: number): number {
  // Simple mixing: combine base seed and turn number.
  return (baseSeed ^ (turn * 0x9e3779b9)) >>> 0;
}

/**
 * Compute the damage reduction factor from density.
 * High density → more armor (damage reduction).
 * Returns a multiplier in [0.5, 1.0].
 */
function densityArmorFactor(density: number | null): number {
  if (density === null) return 1.0;
  // Normalize density to [0, 22.6] (osmium is densest at ~22.6 g/cm³).
  const normalized = Math.min(density, 22.6) / 22.6;
  // Armor reduces incoming damage by up to 50%.
  return 1.0 - normalized * 0.5;
}

/**
 * Compute the debuff potency multiplier from electronegativity.
 * High electronegativity → +20% debuff potency.
 * Returns a multiplier in [1.0, 1.2].
 */
function electronegDebuffMultiplier(electronegativity: number | null): number {
  if (electronegativity === null) return 1.0;
  // Pauling scale max is ~4.0 (Fluorine).
  const normalized = Math.min(electronegativity, 4.0) / 4.0;
  return 1.0 + normalized * 0.2;
}

/**
 * Compute the stagger chance from atomic mass.
 * High atomic mass → higher stagger chance on heavy attacks.
 * Returns a probability in [0, 0.4].
 */
function atomicMassStaggerChance(atomicMass: number): number {
  // Normalize to [1, 294] (Oganesson).
  const normalized = Math.min(atomicMass, 294) / 294;
  return normalized * 0.4;
}

// ---------------------------------------------------------------------------
// Core pure function
// ---------------------------------------------------------------------------

/**
 * Resolve a single combat turn.
 *
 * This is a **pure function**: given the same `state` and `action`, it always
 * returns the same `TurnResult`. All randomness is derived from `state.seed`
 * and `state.turn` via the mulberry32 PRNG.
 *
 * Requirements: 8.2
 */
export function resolveTurn(state: CombatState, action: CombatAction): TurnResult {
  const prng = createPrng(turnSeed(state.seed, state.turn));
  const { elementStats } = state;
  const statusEffectsApplied: StatusEffect[] = [];
  const narrativeParts: string[] = [];

  // -------------------------------------------------------------------------
  // 1. Compute base damage dealt by the player.
  // -------------------------------------------------------------------------
  let damageDealt = 0;

  if (action.type === 'attack' || action.type === 'special') {
    const baseAttack = state.player.attack;
    // Random variance ±20% around base attack.
    const variance = 0.8 + prng() * 0.4;
    damageDealt = Math.round(baseAttack * variance);

    // Special attack deals 1.5× damage.
    if (action.type === 'special') {
      damageDealt = Math.round(damageDealt * 1.5);
    }

    // Apply density-based armor reduction to the element's defense.
    const armorFactor = densityArmorFactor(elementStats.density);
    const elementDefense = state.element.defense * armorFactor;
    damageDealt = Math.max(0, damageDealt - Math.round(elementDefense));

    // Noble gas: immune to debuffs (inert) — no status effects applied.
    if (elementStats.classification !== 'noble_gas') {
      // Halogen: applies "corrosion" debuff.
      if (elementStats.classification === 'halogen') {
        const potency = Math.round(
          5 * electronegDebuffMultiplier(elementStats.electronegativity),
        );
        statusEffectsApplied.push({ type: 'corrosion', duration: 3, potency });
        narrativeParts.push(
          `${elementStats.name}'s halogen nature applies corrosion (potency ${potency})`,
        );
      }

      // Radioactive: applies "radiation" DoT.
      if (elementStats.isRadioactive) {
        statusEffectsApplied.push({ type: 'radiation', duration: 3, potency: 8 });
        narrativeParts.push(`${elementStats.name}'s radioactivity applies radiation DoT`);
      }
    }

    if (elementStats.classification === 'noble_gas') {
      narrativeParts.push(`${elementStats.name} is inert — immune to debuffs`);
    }

    narrativeParts.push(
      `Player deals ${damageDealt} damage to ${elementStats.name}`,
    );
  }

  if (action.type === 'defend') {
    narrativeParts.push('Player takes a defensive stance');
  }

  if (action.type === 'flee') {
    narrativeParts.push('Player attempts to flee');
  }

  // -------------------------------------------------------------------------
  // 2. Compute base damage taken by the player (element counter-attack).
  // -------------------------------------------------------------------------
  let damageTaken = 0;

  if (action.type !== 'flee') {
    const baseElementAttack = state.element.attack;
    const variance2 = 0.8 + prng() * 0.4;
    let elementDamage = Math.round(baseElementAttack * variance2);

    // Alkali metal: high burst damage, low defense.
    if (elementStats.classification === 'alkali_metal') {
      elementDamage = Math.round(elementDamage * 1.4);
      narrativeParts.push(
        `${elementStats.name}'s alkali reactivity boosts its attack to ${elementDamage}`,
      );
    }

    // Oxygen group: multi-hit (2 hits at 60% each).
    if (
      elementStats.classification === 'nonmetal' &&
      [8, 16, 34, 52, 84].includes(elementStats.atomicNumber)
    ) {
      elementDamage = Math.round(elementDamage * 0.6) * 2;
      narrativeParts.push(
        `${elementStats.name} uses a multi-hit attack for ${elementDamage} total damage`,
      );
    }

    // Defend action: player takes 50% less damage.
    if (action.type === 'defend') {
      elementDamage = Math.round(elementDamage * 0.5);
    }

    // Apply player defense.
    damageTaken = Math.max(0, elementDamage - state.player.defense);

    // High atomic mass → stagger chance on heavy attacks.
    const staggerChance = atomicMassStaggerChance(elementStats.atomicMass);
    if (prng() < staggerChance) {
      statusEffectsApplied.push({ type: 'stagger', duration: 1, potency: 1 });
      narrativeParts.push(
        `${elementStats.name}'s high atomic mass staggers the player`,
      );
    }

    narrativeParts.push(
      `${elementStats.name} deals ${damageTaken} damage to the player`,
    );
  }

  // -------------------------------------------------------------------------
  // 3. Assemble result.
  // -------------------------------------------------------------------------
  const narrative = narrativeParts.join('. ');

  return {
    damageDealt,
    damageTaken,
    statusEffectsApplied,
    narrative,
  };
}
