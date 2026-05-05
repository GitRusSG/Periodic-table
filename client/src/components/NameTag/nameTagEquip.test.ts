/**
 * Focused unit tests for Name_Tag equip/replace behavior.
 *
 * Validates: Requirements 10.2, 10.4
 *
 *   10.2 — THE Application SHALL allow the user to equip exactly one Name_Tag
 *           at a time from the user's collected Name_Tags.
 *   10.4 — WHEN a user equips a different Name_Tag, THE Combat_Engine SHALL
 *           replace the previously active abilities with the abilities of the
 *           newly equipped Name_Tag.
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

/** Build a state with the given tags already added (none equipped). */
function stateWithTags(...tags: NameTag[]): NameTagState {
  let state = createInitialNameTagState();
  for (const tag of tags) {
    state = addNameTag(state, tag);
  }
  return state;
}

// Sample Name_Tags with distinct abilities
const OXYGEN = makeTag(8, 'O', 'Oxygen');     // regeneration
const IRON = makeTag(26, 'Fe', 'Iron');        // defensive reinforcement
const MERCURY = makeTag(80, 'Hg', 'Mercury'); // movement speed
const HELIUM = makeTag(2, 'He', 'Helium');    // inert shield (noble gas)
const SODIUM = makeTag(11, 'Na', 'Sodium');   // reactive burst (alkali metal)
const GOLD = makeTag(79, 'Au', 'Gold');       // rare-earth power (generic)

// ---------------------------------------------------------------------------
// Requirement 10.2 — Exactly one Name_Tag equipped at a time
// ---------------------------------------------------------------------------

describe('Requirement 10.2 — exactly one Name_Tag equipped at a time', () => {
  it('equippedNameTag is a single value (number | null), not an array', () => {
    const state = createInitialNameTagState();
    // The type itself enforces this, but we verify the runtime value is scalar
    expect(state.equippedNameTag).toBeNull();
    expect(Array.isArray(state.equippedNameTag)).toBe(false);
  });

  it('equipping a tag sets equippedNameTag to that tag\'s atomic number', () => {
    const state = stateWithTags(IRON);
    const next = equipNameTag(state, IRON.atomicNumber);
    expect(next.equippedNameTag).toBe(IRON.atomicNumber);
  });

  it('equipping a second tag replaces the first — only one is equipped', () => {
    const state = stateWithTags(IRON, OXYGEN);
    const afterFirst = equipNameTag(state, IRON.atomicNumber);
    const afterSecond = equipNameTag(afterFirst, OXYGEN.atomicNumber);

    // Only Oxygen is equipped
    expect(afterSecond.equippedNameTag).toBe(OXYGEN.atomicNumber);
    // Iron is no longer equipped
    expect(afterSecond.equippedNameTag).not.toBe(IRON.atomicNumber);
  });

  it('equipping a third tag after two previous equips — only the last is equipped', () => {
    const state = stateWithTags(IRON, OXYGEN, MERCURY);
    let s = equipNameTag(state, IRON.atomicNumber);
    s = equipNameTag(s, OXYGEN.atomicNumber);
    s = equipNameTag(s, MERCURY.atomicNumber);

    expect(s.equippedNameTag).toBe(MERCURY.atomicNumber);
  });

  it('equipping across all sample tags always results in exactly one equipped', () => {
    const tags = [OXYGEN, IRON, MERCURY, HELIUM, SODIUM, GOLD];
    let state = stateWithTags(...tags);

    for (const tag of tags) {
      state = equipNameTag(state, tag.atomicNumber);
      // After each equip, exactly one tag is equipped
      expect(state.equippedNameTag).toBe(tag.atomicNumber);
      // equippedNameTag is a scalar, not an array
      expect(Array.isArray(state.equippedNameTag)).toBe(false);
    }
  });

  it('cannot equip a tag that is not in the collection', () => {
    const state = stateWithTags(IRON);
    const next = equipNameTag(state, OXYGEN.atomicNumber); // Oxygen not added
    expect(next.equippedNameTag).toBeNull();
    expect(next).toBe(state); // state unchanged
  });

  it('unequipping leaves equippedNameTag as null (no tag equipped)', () => {
    const state = stateWithTags(IRON);
    const equipped = equipNameTag(state, IRON.atomicNumber);
    const unequipped = unequipNameTag(equipped);
    expect(unequipped.equippedNameTag).toBeNull();
  });

  it('equipping after unequip works correctly — one tag equipped again', () => {
    const state = stateWithTags(IRON, OXYGEN);
    let s = equipNameTag(state, IRON.atomicNumber);
    s = unequipNameTag(s);
    s = equipNameTag(s, OXYGEN.atomicNumber);
    expect(s.equippedNameTag).toBe(OXYGEN.atomicNumber);
  });
});

// ---------------------------------------------------------------------------
// Requirement 10.4 — Equipping a different tag replaces previous abilities
// ---------------------------------------------------------------------------

describe('Requirement 10.4 — equipping a new tag replaces previous tag\'s abilities', () => {
  it('getEquippedNameTag returns the new tag after replacing the previous one', () => {
    const state = stateWithTags(IRON, OXYGEN);
    const withIron = equipNameTag(state, IRON.atomicNumber);
    const withOxygen = equipNameTag(withIron, OXYGEN.atomicNumber);

    const equipped = getEquippedNameTag(withOxygen);
    expect(equipped).toEqual(OXYGEN);
    expect(equipped?.abilityDescription).toBe(OXYGEN.abilityDescription);
  });

  it('previous tag\'s abilityDescription is no longer returned by getEquippedNameTag', () => {
    const state = stateWithTags(IRON, OXYGEN);
    const withIron = equipNameTag(state, IRON.atomicNumber);
    const withOxygen = equipNameTag(withIron, OXYGEN.atomicNumber);

    const equipped = getEquippedNameTag(withOxygen);
    // Iron's ability should NOT be active
    expect(equipped?.abilityDescription).not.toBe(IRON.abilityDescription);
    expect(equipped?.atomicNumber).not.toBe(IRON.atomicNumber);
  });

  it('ability descriptions differ between tags — replacement is meaningful', () => {
    // Verify the tags we use actually have different abilities
    expect(IRON.abilityDescription).not.toBe(OXYGEN.abilityDescription);
    expect(IRON.abilityDescription).not.toBe(MERCURY.abilityDescription);
    expect(OXYGEN.abilityDescription).not.toBe(MERCURY.abilityDescription);
  });

  it('equipping Iron then Oxygen: getEquippedNameTag reflects Oxygen\'s regeneration ability', () => {
    const state = stateWithTags(IRON, OXYGEN);
    let s = equipNameTag(state, IRON.atomicNumber);
    s = equipNameTag(s, OXYGEN.atomicNumber);

    const equipped = getEquippedNameTag(s);
    expect(equipped?.name).toBe('Oxygen');
    expect(equipped?.abilityDescription.toLowerCase()).toContain('regeneration');
  });

  it('equipping Oxygen then Iron: getEquippedNameTag reflects Iron\'s defensive ability', () => {
    const state = stateWithTags(IRON, OXYGEN);
    let s = equipNameTag(state, OXYGEN.atomicNumber);
    s = equipNameTag(s, IRON.atomicNumber);

    const equipped = getEquippedNameTag(s);
    expect(equipped?.name).toBe('Iron');
    expect(equipped?.abilityDescription.toLowerCase()).toContain('defensive reinforcement');
  });

  it('equipping Mercury replaces Iron: getEquippedNameTag reflects Mercury\'s speed ability', () => {
    const state = stateWithTags(IRON, MERCURY);
    let s = equipNameTag(state, IRON.atomicNumber);
    s = equipNameTag(s, MERCURY.atomicNumber);

    const equipped = getEquippedNameTag(s);
    expect(equipped?.name).toBe('Mercury');
    expect(equipped?.abilityDescription.toLowerCase()).toContain('movement speed');
  });

  it('equipping Helium replaces Sodium: noble gas inert shield replaces alkali burst', () => {
    const state = stateWithTags(SODIUM, HELIUM);
    let s = equipNameTag(state, SODIUM.atomicNumber);
    s = equipNameTag(s, HELIUM.atomicNumber);

    const equipped = getEquippedNameTag(s);
    expect(equipped?.name).toBe('Helium');
    expect(equipped?.abilityDescription.toLowerCase()).toMatch(/inert|immune/);
    // Sodium's burst ability is gone
    expect(equipped?.abilityDescription.toLowerCase()).not.toMatch(/reactive|burst/);
  });

  it('previous tag remains in the collection after being replaced', () => {
    const state = stateWithTags(IRON, OXYGEN);
    let s = equipNameTag(state, IRON.atomicNumber);
    s = equipNameTag(s, OXYGEN.atomicNumber);

    // Iron is still in the collection even though it's no longer equipped
    const ironInCollection = s.nameTags.find(
      (t) => t.atomicNumber === IRON.atomicNumber,
    );
    expect(ironInCollection).toBeDefined();
    expect(ironInCollection).toEqual(IRON);
  });

  it('multiple sequential replacements — each step reflects the correct active ability', () => {
    const tags = [OXYGEN, IRON, MERCURY, HELIUM, SODIUM];
    let state = stateWithTags(...tags);

    for (const tag of tags) {
      state = equipNameTag(state, tag.atomicNumber);
      const equipped = getEquippedNameTag(state);
      // The equipped tag matches the one we just equipped
      expect(equipped?.atomicNumber).toBe(tag.atomicNumber);
      expect(equipped?.abilityDescription).toBe(tag.abilityDescription);
    }
  });

  it('getEquippedNameTag returns null after unequipping — no abilities active', () => {
    const state = stateWithTags(IRON);
    let s = equipNameTag(state, IRON.atomicNumber);
    s = unequipNameTag(s);

    expect(getEquippedNameTag(s)).toBeNull();
  });

  it('state is immutable — equipping does not mutate the previous state', () => {
    const state = stateWithTags(IRON, OXYGEN);
    const withIron = equipNameTag(state, IRON.atomicNumber);
    const withOxygen = equipNameTag(withIron, OXYGEN.atomicNumber);

    // withIron still has Iron equipped
    expect(withIron.equippedNameTag).toBe(IRON.atomicNumber);
    // withOxygen has Oxygen equipped
    expect(withOxygen.equippedNameTag).toBe(OXYGEN.atomicNumber);
    // They are different state objects
    expect(withIron).not.toBe(withOxygen);
  });
});
