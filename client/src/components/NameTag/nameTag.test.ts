/**
 * Unit tests for the Name_Tag logic module.
 *
 * Validates: Requirements 10.1, 10.2, 10.4, 10.6
 *
 *   10.1 — Award a Name_Tag on first element defeat (addNameTag is idempotent).
 *   10.2 — Allow equipping exactly one Name_Tag at a time.
 *   10.4 — Replace previous abilities when a new Name_Tag is equipped.
 *   10.6 — Collection state correctly reflects all earned tags and which is
 *           equipped (used by the UI component).
 */

import { describe, it, expect } from 'vitest';
import {
  type NameTag,
  type NameTagState,
  createInitialNameTagState,
  addNameTag,
  equipNameTag,
  unequipNameTag,
  getEquippedNameTag,
  deriveAbilityDescription,
} from './nameTag';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTag(atomicNumber: number, symbol: string, name: string): NameTag {
  return {
    atomicNumber,
    symbol,
    name,
    abilityDescription: deriveAbilityDescription(atomicNumber, name, symbol),
  };
}

const IRON = makeTag(26, 'Fe', 'Iron');
const OXYGEN = makeTag(8, 'O', 'Oxygen');
const MERCURY = makeTag(80, 'Hg', 'Mercury');
const HELIUM = makeTag(2, 'He', 'Helium');
const SODIUM = makeTag(11, 'Na', 'Sodium');
const CHLORINE = makeTag(17, 'Cl', 'Chlorine');
const URANIUM = makeTag(92, 'U', 'Uranium');

// ---------------------------------------------------------------------------
// createInitialNameTagState
// ---------------------------------------------------------------------------

describe('createInitialNameTagState', () => {
  it('starts with an empty nameTags array', () => {
    const state = createInitialNameTagState();
    expect(state.nameTags).toEqual([]);
  });

  it('starts with no equipped tag (null)', () => {
    const state = createInitialNameTagState();
    expect(state.equippedNameTag).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// addNameTag — Requirement 10.1
// ---------------------------------------------------------------------------

describe('addNameTag', () => {
  it('adds a new tag to an empty collection', () => {
    const state = createInitialNameTagState();
    const next = addNameTag(state, IRON);
    expect(next.nameTags).toHaveLength(1);
    expect(next.nameTags[0]).toEqual(IRON);
  });

  it('adds multiple different tags', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = addNameTag(state, OXYGEN);
    expect(state.nameTags).toHaveLength(2);
  });

  it('is idempotent — does not add a duplicate tag for the same element', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    const next = addNameTag(state, IRON);
    expect(next.nameTags).toHaveLength(1);
    // Returns the same state reference when no change occurs
    expect(next).toBe(state);
  });

  it('preserves the equippedNameTag when adding a new tag', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = equipNameTag(state, 26);
    const next = addNameTag(state, OXYGEN);
    expect(next.equippedNameTag).toBe(26);
  });

  it('returns a new state object (immutable update)', () => {
    const state = createInitialNameTagState();
    const next = addNameTag(state, IRON);
    expect(next).not.toBe(state);
  });

  it('does not mutate the original nameTags array', () => {
    const state = createInitialNameTagState();
    const originalLength = state.nameTags.length;
    addNameTag(state, IRON);
    expect(state.nameTags).toHaveLength(originalLength);
  });
});

// ---------------------------------------------------------------------------
// equipNameTag — Requirements 10.2, 10.4
// ---------------------------------------------------------------------------

describe('equipNameTag', () => {
  it('equips a tag that exists in the collection', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    const next = equipNameTag(state, 26);
    expect(next.equippedNameTag).toBe(26);
  });

  it('replaces the previously equipped tag (Requirement 10.4)', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = addNameTag(state, OXYGEN);
    state = equipNameTag(state, 26); // equip Iron
    const next = equipNameTag(state, 8); // equip Oxygen — replaces Iron
    expect(next.equippedNameTag).toBe(8);
  });

  it('only one tag is equipped at a time (Requirement 10.2)', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = addNameTag(state, OXYGEN);
    state = addNameTag(state, MERCURY);
    state = equipNameTag(state, 26);
    state = equipNameTag(state, 8);
    state = equipNameTag(state, 80);
    // Only Mercury should be equipped
    expect(state.equippedNameTag).toBe(80);
  });

  it('returns the original state when the tag is not in the collection', () => {
    const state = createInitialNameTagState();
    const next = equipNameTag(state, 26); // Iron not in collection
    expect(next).toBe(state);
    expect(next.equippedNameTag).toBeNull();
  });

  it('returns the same state reference when the tag is already equipped', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = equipNameTag(state, 26);
    const next = equipNameTag(state, 26); // already equipped
    expect(next).toBe(state);
  });

  it('returns a new state object when equipping a different tag', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = addNameTag(state, OXYGEN);
    state = equipNameTag(state, 26);
    const next = equipNameTag(state, 8);
    expect(next).not.toBe(state);
  });

  it('does not change the nameTags array when equipping', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    const next = equipNameTag(state, 26);
    expect(next.nameTags).toBe(state.nameTags); // same reference — no copy needed
  });
});

// ---------------------------------------------------------------------------
// unequipNameTag
// ---------------------------------------------------------------------------

describe('unequipNameTag', () => {
  it('sets equippedNameTag to null', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = equipNameTag(state, 26);
    const next = unequipNameTag(state);
    expect(next.equippedNameTag).toBeNull();
  });

  it('returns the same state reference when no tag is equipped', () => {
    const state = createInitialNameTagState();
    const next = unequipNameTag(state);
    expect(next).toBe(state);
  });

  it('returns a new state object when a tag was equipped', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = equipNameTag(state, 26);
    const next = unequipNameTag(state);
    expect(next).not.toBe(state);
  });
});

// ---------------------------------------------------------------------------
// getEquippedNameTag
// ---------------------------------------------------------------------------

describe('getEquippedNameTag', () => {
  it('returns null when no tag is equipped', () => {
    const state = createInitialNameTagState();
    expect(getEquippedNameTag(state)).toBeNull();
  });

  it('returns the equipped NameTag object', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = equipNameTag(state, 26);
    const equipped = getEquippedNameTag(state);
    expect(equipped).toEqual(IRON);
  });

  it('returns the newly equipped tag after replacing the previous one', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = addNameTag(state, OXYGEN);
    state = equipNameTag(state, 26);
    state = equipNameTag(state, 8);
    const equipped = getEquippedNameTag(state);
    expect(equipped).toEqual(OXYGEN);
  });

  it('returns null after unequipping', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = equipNameTag(state, 26);
    state = unequipNameTag(state);
    expect(getEquippedNameTag(state)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deriveAbilityDescription — Requirement 10.3
// ---------------------------------------------------------------------------

describe('deriveAbilityDescription', () => {
  it('returns a non-empty string for any element', () => {
    for (let z = 1; z <= 118; z++) {
      const desc = deriveAbilityDescription(z, `Element${z}`, `E${z}`);
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    }
  });

  it('Oxygen (8) description mentions regeneration', () => {
    const desc = deriveAbilityDescription(8, 'Oxygen', 'O');
    expect(desc.toLowerCase()).toContain('regeneration');
  });

  it('Iron (26) description mentions defensive reinforcement', () => {
    const desc = deriveAbilityDescription(26, 'Iron', 'Fe');
    expect(desc.toLowerCase()).toContain('defensive reinforcement');
  });

  it('Mercury (80) description mentions movement speed', () => {
    const desc = deriveAbilityDescription(80, 'Mercury', 'Hg');
    expect(desc.toLowerCase()).toContain('movement speed');
  });

  it('noble gas (Helium, 2) description mentions inert or immune', () => {
    const desc = deriveAbilityDescription(2, 'Helium', 'He');
    expect(desc.toLowerCase()).toMatch(/inert|immune/);
  });

  it('alkali metal (Sodium, 11) description mentions reactive or burst', () => {
    const desc = deriveAbilityDescription(11, 'Sodium', 'Na');
    expect(desc.toLowerCase()).toMatch(/reactive|burst/);
  });

  it('halogen (Chlorine, 17) description mentions corrosion', () => {
    const desc = deriveAbilityDescription(17, 'Chlorine', 'Cl');
    expect(desc.toLowerCase()).toContain('corrosion');
  });

  it('radioactive element (Uranium, 92) description mentions radiation', () => {
    const desc = deriveAbilityDescription(92, 'Uranium', 'U');
    expect(desc.toLowerCase()).toContain('radiation');
  });

  it('includes the element name and symbol in the description', () => {
    const desc = deriveAbilityDescription(26, 'Iron', 'Fe');
    expect(desc).toContain('Iron');
    expect(desc).toContain('Fe');
  });
});

// ---------------------------------------------------------------------------
// Collection state — Requirement 10.6
// (State correctly reflects all earned tags and which is equipped)
// ---------------------------------------------------------------------------

describe('Name_Tag collection state (Requirement 10.6)', () => {
  it('collection contains all added tags', () => {
    let state = createInitialNameTagState();
    const tags = [IRON, OXYGEN, MERCURY, HELIUM, SODIUM, CHLORINE, URANIUM];
    for (const tag of tags) {
      state = addNameTag(state, tag);
    }
    expect(state.nameTags).toHaveLength(tags.length);
    for (const tag of tags) {
      expect(state.nameTags.some((t) => t.atomicNumber === tag.atomicNumber)).toBe(true);
    }
  });

  it('equippedNameTag correctly identifies the equipped tag', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = addNameTag(state, OXYGEN);
    state = equipNameTag(state, 8);
    // Oxygen is equipped
    expect(state.equippedNameTag).toBe(8);
    // Iron is not equipped
    expect(state.equippedNameTag).not.toBe(26);
  });

  it('equippedNameTag is null when no tag is equipped', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    // No equip call
    expect(state.equippedNameTag).toBeNull();
  });

  it('each tag in the collection has a non-empty abilityDescription', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = addNameTag(state, OXYGEN);
    for (const tag of state.nameTags) {
      expect(tag.abilityDescription.length).toBeGreaterThan(0);
    }
  });

  it('replacing equipped tag updates equippedNameTag correctly', () => {
    let state = createInitialNameTagState();
    state = addNameTag(state, IRON);
    state = addNameTag(state, OXYGEN);
    state = equipNameTag(state, 26); // Iron
    state = equipNameTag(state, 8);  // Oxygen replaces Iron
    expect(state.equippedNameTag).toBe(8);
    // Iron tag still in collection
    expect(state.nameTags.some((t) => t.atomicNumber === 26)).toBe(true);
  });
});
