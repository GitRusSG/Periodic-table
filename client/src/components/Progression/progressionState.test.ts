/**
 * Unit tests for XP and unlock logic.
 *
 * Validates: Requirements 4.5, 4.6
 *   4.5 — THE Progression_Service SHALL track cumulative XP per user and
 *          unlock the next Difficulty_Level when the required XP threshold for
 *          the current level is reached.
 *   4.6 — WHEN a user's cumulative XP reaches the threshold for the next
 *          Difficulty_Level, THE Progression_Service SHALL notify the user
 *          that a new Difficulty_Level has been unlocked.
 *
 * Key requirements under test:
 *   1. Each XP threshold (500, 2000, 6000, 15000) triggers the correct
 *      difficulty unlock.
 *   2. The unlock notification fires exactly ONCE per threshold crossing —
 *      not on subsequent addXP calls that do not cross a new threshold.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  type DifficultyLevel,
  type ProgressionState,
  XP_UNLOCK_THRESHOLDS,
  createInitialProgressionState,
  addXP,
  unlockDifficulty,
  computeUnlockedDifficulties,
} from './progressionState';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a progression state with a specific XP total and unlocked set. */
function stateWith(
  totalXp: number,
  unlocked: DifficultyLevel[] = [1],
): ProgressionState {
  return {
    totalXp,
    unlockedDifficulties: new Set(unlocked),
  };
}

/** A no-op notifier used when we don't care about notifications. */
const noop = () => {};

// ---------------------------------------------------------------------------
// createInitialProgressionState
// ---------------------------------------------------------------------------

describe('createInitialProgressionState', () => {
  it('starts with 0 XP', () => {
    const state = createInitialProgressionState();
    expect(state.totalXp).toBe(0);
  });

  it('has only level 1 unlocked initially', () => {
    const state = createInitialProgressionState();
    expect(state.unlockedDifficulties.has(1)).toBe(true);
    expect(state.unlockedDifficulties.size).toBe(1);
  });

  it('levels 2–5 are locked initially', () => {
    const state = createInitialProgressionState();
    const locked: DifficultyLevel[] = [2, 3, 4, 5];
    for (const level of locked) {
      expect(state.unlockedDifficulties.has(level)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// XP_UNLOCK_THRESHOLDS — constant values per design spec section 7.4
// ---------------------------------------------------------------------------

describe('XP_UNLOCK_THRESHOLDS', () => {
  it('level 1 requires 0 XP (always unlocked)', () => {
    expect(XP_UNLOCK_THRESHOLDS[1]).toBe(0);
  });

  it('level 2 requires 500 XP', () => {
    expect(XP_UNLOCK_THRESHOLDS[2]).toBe(500);
  });

  it('level 3 requires 2000 XP', () => {
    expect(XP_UNLOCK_THRESHOLDS[3]).toBe(2000);
  });

  it('level 4 requires 6000 XP', () => {
    expect(XP_UNLOCK_THRESHOLDS[4]).toBe(6000);
  });

  it('level 5 requires 15000 XP', () => {
    expect(XP_UNLOCK_THRESHOLDS[5]).toBe(15000);
  });

  it('thresholds are strictly increasing', () => {
    const levels: DifficultyLevel[] = [1, 2, 3, 4, 5];
    for (let i = 0; i < levels.length - 1; i++) {
      expect(XP_UNLOCK_THRESHOLDS[levels[i]]).toBeLessThan(
        XP_UNLOCK_THRESHOLDS[levels[i + 1]],
      );
    }
  });
});

// ---------------------------------------------------------------------------
// addXP — XP accumulation (Requirement 4.5)
// ---------------------------------------------------------------------------

describe('addXP — XP accumulation', () => {
  it('increases totalXp by the given amount', () => {
    const state = createInitialProgressionState();
    const next = addXP(state, 100, noop);
    expect(next.totalXp).toBe(100);
  });

  it('accumulates XP across multiple calls', () => {
    let state = createInitialProgressionState();
    state = addXP(state, 200, noop);
    state = addXP(state, 150, noop);
    expect(state.totalXp).toBe(350);
  });

  it('adding 0 XP does not change totalXp', () => {
    const state = stateWith(300);
    const next = addXP(state, 0, noop);
    expect(next.totalXp).toBe(300);
  });

  it('returns a new state object (immutable update)', () => {
    const state = createInitialProgressionState();
    const next = addXP(state, 100, noop);
    expect(next).not.toBe(state);
  });

  it('throws RangeError for negative XP amounts', () => {
    const state = createInitialProgressionState();
    expect(() => addXP(state, -1, noop)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// addXP — threshold unlock logic (Requirement 4.5)
// ---------------------------------------------------------------------------

describe('addXP — threshold unlock: level 2 at 500 XP', () => {
  it('does NOT unlock level 2 below the threshold (499 XP)', () => {
    const state = createInitialProgressionState();
    const next = addXP(state, 499, noop);
    expect(next.unlockedDifficulties.has(2)).toBe(false);
  });

  it('unlocks level 2 at exactly 500 XP', () => {
    const state = createInitialProgressionState();
    const next = addXP(state, 500, noop);
    expect(next.unlockedDifficulties.has(2)).toBe(true);
  });

  it('unlocks level 2 above the threshold (501 XP)', () => {
    const state = createInitialProgressionState();
    const next = addXP(state, 501, noop);
    expect(next.unlockedDifficulties.has(2)).toBe(true);
  });

  it('unlocks level 2 when XP crosses threshold across multiple addXP calls', () => {
    let state = createInitialProgressionState();
    state = addXP(state, 300, noop);
    state = addXP(state, 200, noop); // total = 500
    expect(state.unlockedDifficulties.has(2)).toBe(true);
  });
});

describe('addXP — threshold unlock: level 3 at 2000 XP', () => {
  it('does NOT unlock level 3 below the threshold (1999 XP)', () => {
    const state = stateWith(0, [1, 2]);
    const next = addXP(state, 1999, noop);
    expect(next.unlockedDifficulties.has(3)).toBe(false);
  });

  it('unlocks level 3 at exactly 2000 XP', () => {
    const state = stateWith(0, [1, 2]);
    const next = addXP(state, 2000, noop);
    expect(next.unlockedDifficulties.has(3)).toBe(true);
  });

  it('unlocks level 3 when XP crosses threshold across multiple addXP calls', () => {
    let state = stateWith(1500, [1, 2]);
    state = addXP(state, 500, noop); // total = 2000
    expect(state.unlockedDifficulties.has(3)).toBe(true);
  });
});

describe('addXP — threshold unlock: level 4 at 6000 XP', () => {
  it('does NOT unlock level 4 below the threshold (5999 XP)', () => {
    const state = stateWith(0, [1, 2, 3]);
    const next = addXP(state, 5999, noop);
    expect(next.unlockedDifficulties.has(4)).toBe(false);
  });

  it('unlocks level 4 at exactly 6000 XP', () => {
    const state = stateWith(0, [1, 2, 3]);
    const next = addXP(state, 6000, noop);
    expect(next.unlockedDifficulties.has(4)).toBe(true);
  });

  it('unlocks level 4 when XP crosses threshold across multiple addXP calls', () => {
    let state = stateWith(5000, [1, 2, 3]);
    state = addXP(state, 1000, noop); // total = 6000
    expect(state.unlockedDifficulties.has(4)).toBe(true);
  });
});

describe('addXP — threshold unlock: level 5 at 15000 XP', () => {
  it('does NOT unlock level 5 below the threshold (14999 XP)', () => {
    const state = stateWith(0, [1, 2, 3, 4]);
    const next = addXP(state, 14999, noop);
    expect(next.unlockedDifficulties.has(5)).toBe(false);
  });

  it('unlocks level 5 at exactly 15000 XP', () => {
    const state = stateWith(0, [1, 2, 3, 4]);
    const next = addXP(state, 15000, noop);
    expect(next.unlockedDifficulties.has(5)).toBe(true);
  });

  it('unlocks level 5 when XP crosses threshold across multiple addXP calls', () => {
    let state = stateWith(14000, [1, 2, 3, 4]);
    state = addXP(state, 1000, noop); // total = 15000
    expect(state.unlockedDifficulties.has(5)).toBe(true);
  });
});

describe('addXP — multiple thresholds crossed in a single call', () => {
  it('unlocks levels 2 and 3 when a single addXP call crosses both thresholds', () => {
    const state = createInitialProgressionState(); // 0 XP, only level 1
    const next = addXP(state, 2000, noop); // crosses 500 and 2000
    expect(next.unlockedDifficulties.has(2)).toBe(true);
    expect(next.unlockedDifficulties.has(3)).toBe(true);
  });

  it('unlocks all levels when a single addXP call reaches 15000 XP from 0', () => {
    const state = createInitialProgressionState();
    const next = addXP(state, 15000, noop);
    expect(next.unlockedDifficulties).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it('preserves already-unlocked levels when crossing new thresholds', () => {
    const state = stateWith(0, [1, 2]); // level 2 already unlocked
    const next = addXP(state, 2000, noop); // crosses level 3 threshold
    expect(next.unlockedDifficulties.has(1)).toBe(true);
    expect(next.unlockedDifficulties.has(2)).toBe(true);
    expect(next.unlockedDifficulties.has(3)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// addXP — unlock notification fires exactly once per threshold crossing
// (Requirement 4.6)
// ---------------------------------------------------------------------------

describe('addXP — unlock notification fires exactly once per threshold crossing', () => {
  it('calls onUnlock with level 2 when the 500 XP threshold is crossed', () => {
    const onUnlock = vi.fn();
    const state = createInitialProgressionState();
    addXP(state, 500, onUnlock);
    expect(onUnlock).toHaveBeenCalledWith(2);
  });

  it('calls onUnlock with level 3 when the 2000 XP threshold is crossed', () => {
    const onUnlock = vi.fn();
    const state = stateWith(0, [1, 2]);
    addXP(state, 2000, onUnlock);
    expect(onUnlock).toHaveBeenCalledWith(3);
  });

  it('calls onUnlock with level 4 when the 6000 XP threshold is crossed', () => {
    const onUnlock = vi.fn();
    const state = stateWith(0, [1, 2, 3]);
    addXP(state, 6000, onUnlock);
    expect(onUnlock).toHaveBeenCalledWith(4);
  });

  it('calls onUnlock with level 5 when the 15000 XP threshold is crossed', () => {
    const onUnlock = vi.fn();
    const state = stateWith(0, [1, 2, 3, 4]);
    addXP(state, 15000, onUnlock);
    expect(onUnlock).toHaveBeenCalledWith(5);
  });

  it('does NOT call onUnlock when no threshold is crossed', () => {
    const onUnlock = vi.fn();
    const state = createInitialProgressionState();
    addXP(state, 100, onUnlock); // 100 XP — below 500 threshold
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('does NOT call onUnlock for a level that is already unlocked', () => {
    const onUnlock = vi.fn();
    const state = stateWith(600, [1, 2]); // level 2 already unlocked at 600 XP
    addXP(state, 100, onUnlock); // total = 700, still below level 3 threshold
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('calls onUnlock exactly once for level 2 even when XP far exceeds the threshold', () => {
    const onUnlock = vi.fn();
    const state = createInitialProgressionState();
    addXP(state, 10000, onUnlock); // way past 500
    const level2Calls = onUnlock.mock.calls.filter(([l]) => l === 2);
    expect(level2Calls).toHaveLength(1);
  });

  it('does NOT call onUnlock on a second addXP call that does not cross a new threshold', () => {
    const onUnlock = vi.fn();
    let state = createInitialProgressionState();
    state = addXP(state, 500, onUnlock); // crosses level 2 — onUnlock called once
    onUnlock.mockClear();
    addXP(state, 100, onUnlock); // 600 XP total — no new threshold crossed
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('calls onUnlock exactly once per threshold crossing across multiple addXP calls', () => {
    const onUnlock = vi.fn();
    let state = createInitialProgressionState();

    state = addXP(state, 300, onUnlock); // 300 XP — no unlock
    expect(onUnlock).toHaveBeenCalledTimes(0);

    state = addXP(state, 200, onUnlock); // 500 XP — unlocks level 2
    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(onUnlock).toHaveBeenLastCalledWith(2);

    state = addXP(state, 100, onUnlock); // 600 XP — no new unlock
    expect(onUnlock).toHaveBeenCalledTimes(1); // still 1

    state = addXP(state, 1400, onUnlock); // 2000 XP — unlocks level 3
    expect(onUnlock).toHaveBeenCalledTimes(2);
    expect(onUnlock).toHaveBeenLastCalledWith(3);
  });

  it('calls onUnlock for each newly crossed threshold when multiple thresholds are crossed in one call', () => {
    const onUnlock = vi.fn();
    const state = createInitialProgressionState();
    addXP(state, 2000, onUnlock); // crosses 500 (level 2) and 2000 (level 3)
    expect(onUnlock).toHaveBeenCalledTimes(2);
    expect(onUnlock).toHaveBeenCalledWith(2);
    expect(onUnlock).toHaveBeenCalledWith(3);
  });

  it('calls onUnlock for all four thresholds when going from 0 to 15000 XP in one call', () => {
    const onUnlock = vi.fn();
    const state = createInitialProgressionState();
    addXP(state, 15000, onUnlock);
    expect(onUnlock).toHaveBeenCalledTimes(4); // levels 2, 3, 4, 5
    expect(onUnlock).toHaveBeenCalledWith(2);
    expect(onUnlock).toHaveBeenCalledWith(3);
    expect(onUnlock).toHaveBeenCalledWith(4);
    expect(onUnlock).toHaveBeenCalledWith(5);
  });

  it('does not call onUnlock for already-unlocked levels when crossing a higher threshold', () => {
    const onUnlock = vi.fn();
    // Levels 1–3 already unlocked; crossing level 4 threshold
    const state = stateWith(5000, [1, 2, 3]);
    addXP(state, 1000, onUnlock); // total = 6000 — crosses level 4 only
    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(onUnlock).toHaveBeenCalledWith(4);
  });
});

// ---------------------------------------------------------------------------
// addXP — immutability
// ---------------------------------------------------------------------------

describe('addXP — immutability', () => {
  it('does not mutate the original state', () => {
    const state = createInitialProgressionState();
    const originalXp = state.totalXp;
    const originalSize = state.unlockedDifficulties.size;
    addXP(state, 500, noop);
    expect(state.totalXp).toBe(originalXp);
    expect(state.unlockedDifficulties.size).toBe(originalSize);
  });

  it('does not mutate the original unlockedDifficulties set when unlocking', () => {
    const state = createInitialProgressionState();
    const originalSet = state.unlockedDifficulties;
    addXP(state, 500, noop);
    expect(originalSet.has(2)).toBe(false); // original set unchanged
  });

  it('returns the same unlockedDifficulties reference when no unlock occurs', () => {
    const state = createInitialProgressionState();
    const next = addXP(state, 100, noop); // no threshold crossed
    expect(next.unlockedDifficulties).toBe(state.unlockedDifficulties);
  });
});

// ---------------------------------------------------------------------------
// unlockDifficulty — direct unlock
// ---------------------------------------------------------------------------

describe('unlockDifficulty', () => {
  it('adds a new level to unlockedDifficulties', () => {
    const state = createInitialProgressionState();
    const next = unlockDifficulty(state, 2);
    expect(next.unlockedDifficulties.has(2)).toBe(true);
  });

  it('preserves previously unlocked levels', () => {
    const state = stateWith(0, [1, 2]);
    const next = unlockDifficulty(state, 3);
    expect(next.unlockedDifficulties.has(1)).toBe(true);
    expect(next.unlockedDifficulties.has(2)).toBe(true);
    expect(next.unlockedDifficulties.has(3)).toBe(true);
  });

  it('returns the same state reference when the level is already unlocked', () => {
    const state = stateWith(0, [1, 2]);
    const next = unlockDifficulty(state, 2);
    expect(next).toBe(state);
  });

  it('returns a new state object when a new level is unlocked', () => {
    const state = createInitialProgressionState();
    const next = unlockDifficulty(state, 2);
    expect(next).not.toBe(state);
  });

  it('does not mutate the original unlockedDifficulties set', () => {
    const state = createInitialProgressionState();
    const originalSize = state.unlockedDifficulties.size;
    unlockDifficulty(state, 2);
    expect(state.unlockedDifficulties.size).toBe(originalSize);
  });

  it('does not change totalXp when unlocking', () => {
    const state = stateWith(300, [1]);
    const next = unlockDifficulty(state, 2);
    expect(next.totalXp).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// computeUnlockedDifficulties — XP threshold logic
// ---------------------------------------------------------------------------

describe('computeUnlockedDifficulties', () => {
  it('unlocks only level 1 at 0 XP', () => {
    const unlocked = computeUnlockedDifficulties(0);
    expect(unlocked).toEqual(new Set([1]));
  });

  it('unlocks only level 1 just below the level-2 threshold (499 XP)', () => {
    const unlocked = computeUnlockedDifficulties(499);
    expect(unlocked.has(1)).toBe(true);
    expect(unlocked.has(2)).toBe(false);
  });

  it('unlocks levels 1 and 2 at exactly 500 XP', () => {
    const unlocked = computeUnlockedDifficulties(500);
    expect(unlocked.has(1)).toBe(true);
    expect(unlocked.has(2)).toBe(true);
    expect(unlocked.has(3)).toBe(false);
  });

  it('unlocks levels 1–2 just below the level-3 threshold (1999 XP)', () => {
    const unlocked = computeUnlockedDifficulties(1999);
    expect(unlocked.has(2)).toBe(true);
    expect(unlocked.has(3)).toBe(false);
  });

  it('unlocks levels 1–3 at exactly 2000 XP', () => {
    const unlocked = computeUnlockedDifficulties(2000);
    expect(unlocked.has(3)).toBe(true);
    expect(unlocked.has(4)).toBe(false);
  });

  it('unlocks levels 1–3 just below the level-4 threshold (5999 XP)', () => {
    const unlocked = computeUnlockedDifficulties(5999);
    expect(unlocked.has(3)).toBe(true);
    expect(unlocked.has(4)).toBe(false);
  });

  it('unlocks levels 1–4 at exactly 6000 XP', () => {
    const unlocked = computeUnlockedDifficulties(6000);
    expect(unlocked.has(4)).toBe(true);
    expect(unlocked.has(5)).toBe(false);
  });

  it('unlocks levels 1–4 just below the level-5 threshold (14999 XP)', () => {
    const unlocked = computeUnlockedDifficulties(14999);
    expect(unlocked.has(4)).toBe(true);
    expect(unlocked.has(5)).toBe(false);
  });

  it('unlocks all five levels at exactly 15000 XP', () => {
    const unlocked = computeUnlockedDifficulties(15000);
    expect(unlocked).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it('unlocks all five levels above 15000 XP', () => {
    const unlocked = computeUnlockedDifficulties(100000);
    expect(unlocked).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it('always includes level 1 regardless of XP', () => {
    for (const xp of [0, 1, 500, 2000, 6000, 15000, 99999]) {
      const unlocked = computeUnlockedDifficulties(xp);
      expect(unlocked.has(1)).toBe(true);
    }
  });
});
