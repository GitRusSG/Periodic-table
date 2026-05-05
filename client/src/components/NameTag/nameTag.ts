/**
 * Name_Tag logic module.
 *
 * Contains types and pure state-management functions for the Name_Tag system.
 * Keeping this separate from React components makes it fully testable without
 * a DOM context.
 *
 * Design spec (section 7.1):
 *   ProgressionState includes:
 *     nameTags: NameTag[]
 *     equippedNameTag: number | null  (atomic number)
 *
 * Requirements:
 *   10.1 — Award a Name_Tag on first element defeat.
 *   10.2 — Allow equipping exactly one Name_Tag at a time.
 *   10.3 — Grant abilities derived from the element's chemical properties.
 *   10.4 — Replace previous abilities when a new Name_Tag is equipped.
 *   10.6 — Display all earned Name_Tags, indicate which is equipped, and
 *           show the ability description for each.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A Name_Tag earned by defeating an element for the first time.
 *
 * The `ability` field is a human-readable description of the combat ability
 * granted when this tag is equipped (derived from the element's chemical
 * properties per Requirement 10.3).
 */
export interface NameTag {
  /** Atomic number of the source element (unique identifier). */
  atomicNumber: number;
  /** Element symbol, e.g. "Fe". */
  symbol: string;
  /** Element name, e.g. "Iron". */
  name: string;
  /** Human-readable description of the ability granted when equipped. */
  abilityDescription: string;
}

/**
 * The Name_Tag slice of the progression state.
 *
 * `equippedNameTag` is the atomic number of the currently equipped tag, or
 * `null` if no tag is equipped.
 */
export interface NameTagState {
  /** All Name_Tags earned by the user. */
  nameTags: NameTag[];
  /** Atomic number of the currently equipped Name_Tag, or null. */
  equippedNameTag: number | null;
}

// ---------------------------------------------------------------------------
// Ability description derivation
// ---------------------------------------------------------------------------

/**
 * Derive a human-readable ability description from an element's chemical
 * properties.
 *
 * The mapping follows the examples given in Requirement 10.3:
 *   - Oxygen (8)   → regeneration effect
 *   - Iron (26)    → defensive reinforcement
 *   - Mercury (80) → movement speed modification
 *
 * For all other elements a generic description is generated from the
 * element's classification and notable properties.
 *
 * @param atomicNumber - Atomic number of the element.
 * @param name         - Element name.
 * @param symbol       - Element symbol.
 * @returns Human-readable ability description string.
 */
export function deriveAbilityDescription(
  atomicNumber: number,
  name: string,
  symbol: string,
): string {
  // Noble gases (He=2, Ne=10, Ar=18, Kr=36, Xe=54, Rn=86, Og=118)
  const nobleGases = new Set([2, 10, 18, 36, 54, 86, 118]);
  // Alkali metals (Li=3, Na=11, K=19, Rb=37, Cs=55, Fr=87)
  const alkaliMetals = new Set([3, 11, 19, 37, 55, 87]);
  // Halogens (F=9, Cl=17, Br=35, I=53, At=85, Ts=117)
  const halogens = new Set([9, 17, 35, 53, 85, 117]);
  // Radioactive elements (atomic number >= 84, plus Tc=43, Pm=61)
  const isRadioactive =
    atomicNumber >= 84 || atomicNumber === 43 || atomicNumber === 61;

  // Specific element mappings (Requirement 10.3 examples)
  if (atomicNumber === 8) {
    return `${name} (${symbol}): Grants regeneration — restores a portion of HP each turn, reflecting oxygen's role in cellular respiration.`;
  }
  if (atomicNumber === 26) {
    return `${name} (${symbol}): Grants defensive reinforcement — increases armor and damage reduction, reflecting iron's high density and structural strength.`;
  }
  if (atomicNumber === 80) {
    return `${name} (${symbol}): Grants movement speed modification — increases evasion and action speed, reflecting mercury's liquid mobility at room temperature.`;
  }

  // Noble gases: inert, immune to debuffs
  if (nobleGases.has(atomicNumber)) {
    return `${name} (${symbol}): Grants inert shield — immune to all debuffs and status effects, reflecting ${name}'s chemical inertness as a noble gas.`;
  }

  // Alkali metals: high burst damage
  if (alkaliMetals.has(atomicNumber)) {
    return `${name} (${symbol}): Grants reactive burst — greatly increases attack damage for one turn, reflecting ${name}'s explosive reactivity with water.`;
  }

  // Halogens: corrosion debuff
  if (halogens.has(atomicNumber)) {
    return `${name} (${symbol}): Grants corrosive strike — attacks apply a corrosion debuff that reduces enemy defense over time, reflecting ${name}'s high electronegativity and oxidising power.`;
  }

  // Radioactive elements: radiation DoT
  if (isRadioactive) {
    return `${name} (${symbol}): Grants radiation aura — deals radiation damage-over-time to all enemies each turn, reflecting ${name}'s radioactive decay.`;
  }

  // Generic fallback based on atomic number ranges
  if (atomicNumber <= 20) {
    return `${name} (${symbol}): Grants elemental affinity — enhances a core combat stat based on ${name}'s fundamental chemical properties.`;
  }
  if (atomicNumber <= 56) {
    return `${name} (${symbol}): Grants metallic fortitude — increases overall combat resilience, reflecting ${name}'s transition-metal characteristics.`;
  }
  return `${name} (${symbol}): Grants rare-earth power — applies a powerful elemental effect derived from ${name}'s unique chemical properties.`;
}

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

/**
 * Create the default initial Name_Tag state.
 * No tags earned and no tag equipped.
 */
export function createInitialNameTagState(): NameTagState {
  return {
    nameTags: [],
    equippedNameTag: null,
  };
}

// ---------------------------------------------------------------------------
// State transition functions
// ---------------------------------------------------------------------------

/**
 * Add a new Name_Tag to the collection (awarded on first element defeat).
 *
 * If a tag for the same atomic number already exists in the collection, the
 * state is returned unchanged (idempotent — prevents duplicate awards).
 *
 * Requirement 10.1 — award a Name_Tag on first element defeat.
 *
 * @param state  - Current Name_Tag state.
 * @param newTag - The Name_Tag to add.
 * @returns New state with the tag added, or the original state if already present.
 */
export function addNameTag(state: NameTagState, newTag: NameTag): NameTagState {
  const alreadyOwned = state.nameTags.some(
    (t) => t.atomicNumber === newTag.atomicNumber,
  );
  if (alreadyOwned) return state;
  return {
    ...state,
    nameTags: [...state.nameTags, newTag],
  };
}

/**
 * Equip a Name_Tag by atomic number.
 *
 * Sets `equippedNameTag` to the given atomic number, replacing any previously
 * equipped tag.  The tag must exist in the collection; if it does not, the
 * state is returned unchanged.
 *
 * Requirements:
 *   10.2 — exactly one Name_Tag equipped at a time.
 *   10.4 — replace previous abilities when a new tag is equipped.
 *
 * @param state        - Current Name_Tag state.
 * @param atomicNumber - Atomic number of the tag to equip.
 * @returns New state with the tag equipped, or original state if tag not found.
 */
export function equipNameTag(
  state: NameTagState,
  atomicNumber: number,
): NameTagState {
  const tagExists = state.nameTags.some((t) => t.atomicNumber === atomicNumber);
  if (!tagExists) return state;
  if (state.equippedNameTag === atomicNumber) return state;
  return {
    ...state,
    equippedNameTag: atomicNumber,
  };
}

/**
 * Unequip the currently equipped Name_Tag (sets equippedNameTag to null).
 *
 * If no tag is currently equipped, the state is returned unchanged.
 *
 * @param state - Current Name_Tag state.
 * @returns New state with no tag equipped.
 */
export function unequipNameTag(state: NameTagState): NameTagState {
  if (state.equippedNameTag === null) return state;
  return {
    ...state,
    equippedNameTag: null,
  };
}

/**
 * Get the currently equipped Name_Tag object, or null if none is equipped.
 *
 * @param state - Current Name_Tag state.
 * @returns The equipped NameTag, or null.
 */
export function getEquippedNameTag(state: NameTagState): NameTag | null {
  if (state.equippedNameTag === null) return null;
  return (
    state.nameTags.find((t) => t.atomicNumber === state.equippedNameTag) ?? null
  );
}
