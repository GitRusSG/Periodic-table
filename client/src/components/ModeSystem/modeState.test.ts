/**
 * Unit tests for mode and difficulty state transitions.
 *
 * Validates: Requirements 2.7, 4.1
 *   - Locked difficulty levels cannot be selected.
 *   - Mode transitions update the active mode correctly.
 */

import { describe, it, expect } from 'vitest';
import {
  // Types
  type ActiveMode,
  type DifficultyLevel,
  type ModeState,
  // Constants
  XP_UNLOCK_THRESHOLDS,
  // Functions
  createInitialModeState,
  setMode,
  setDifficultyLevel,
  unlockDifficultyLevel,
  computeUnlockedDifficulties,
} from './modeState';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a state with a specific set of unlocked difficulties. */
function stateWithUnlocked(
  unlocked: DifficultyLevel[],
  active: ActiveMode = 'classic',
  difficultyLevel: DifficultyLevel = 1,
): ModeState {
  return {
    active,
    difficultyLevel,
    unlockedDifficulties: new Set(unlocked),
  };
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('createInitialModeState', () => {
  it('starts in classic mode', () => {
    const state = createInitialModeState();
    expect(state.active).toBe('classic');
  });

  it('starts at difficulty level 1', () => {
    const state = createInitialModeState();
    expect(state.difficultyLevel).toBe(1);
  });

  it('has only level 1 unlocked initially', () => {
    const state = createInitialModeState();
    expect(state.unlockedDifficulties.has(1)).toBe(true);
    expect(state.unlockedDifficulties.size).toBe(1);
  });

  it('levels 2–5 are locked initially', () => {
    const state = createInitialModeState();
    const locked: DifficultyLevel[] = [2, 3, 4, 5];
    for (const level of locked) {
      expect(state.unlockedDifficulties.has(level)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// setMode — mode transitions (Requirement 4.1)
// ---------------------------------------------------------------------------

describe('setMode', () => {
  it('transitions from classic to trivia', () => {
    const state = createInitialModeState();
    const next = setMode(state, 'trivia');
    expect(next.active).toBe('trivia');
  });

  it('transitions from classic to game', () => {
    const state = createInitialModeState();
    const next = setMode(state, 'game');
    expect(next.active).toBe('game');
  });

  it('transitions from trivia to classic', () => {
    const state = stateWithUnlocked([1], 'trivia');
    const next = setMode(state, 'classic');
    expect(next.active).toBe('classic');
  });

  it('transitions from trivia to game', () => {
    const state = stateWithUnlocked([1], 'trivia');
    const next = setMode(state, 'game');
    expect(next.active).toBe('game');
  });

  it('transitions from game to classic', () => {
    const state = stateWithUnlocked([1], 'game');
    const next = setMode(state, 'classic');
    expect(next.active).toBe('classic');
  });

  it('transitions from game to trivia', () => {
    const state = stateWithUnlocked([1], 'game');
    const next = setMode(state, 'trivia');
    expect(next.active).toBe('trivia');
  });

  it('does not change other state fields when transitioning modes', () => {
    const state = stateWithUnlocked([1, 2], 'classic', 2);
    const next = setMode(state, 'trivia');
    expect(next.difficultyLevel).toBe(2);
    expect(next.unlockedDifficulties).toBe(state.unlockedDifficulties);
  });

  it('returns the same state reference when the mode is already active (no-op)', () => {
    const state = createInitialModeState();
    const next = setMode(state, 'classic');
    expect(next).toBe(state);
  });

  it('returns a new state object (immutable update) when the mode changes', () => {
    const state = createInitialModeState();
    const next = setMode(state, 'trivia');
    expect(next).not.toBe(state);
  });

  it('all three modes can be set from any starting mode', () => {
    const modes: ActiveMode[] = ['classic', 'trivia', 'game'];
    for (const from of modes) {
      for (const to of modes) {
        const state = stateWithUnlocked([1], from);
        const next = setMode(state, to);
        expect(next.active).toBe(to);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// setDifficultyLevel — locked level rejection (Requirement 2.7)
// ---------------------------------------------------------------------------

describe('setDifficultyLevel — locked levels are rejected', () => {
  it('rejects level 2 when only level 1 is unlocked', () => {
    const state = stateWithUnlocked([1]);
    const next = setDifficultyLevel(state, 2);
    expect(next.difficultyLevel).toBe(1);
    expect(next).toBe(state); // same reference — no change
  });

  it('rejects level 3 when only levels 1–2 are unlocked', () => {
    const state = stateWithUnlocked([1, 2], 'classic', 1);
    const next = setDifficultyLevel(state, 3);
    expect(next.difficultyLevel).toBe(1);
    expect(next).toBe(state);
  });

  it('rejects level 4 when only levels 1–3 are unlocked', () => {
    const state = stateWithUnlocked([1, 2, 3], 'classic', 1);
    const next = setDifficultyLevel(state, 4);
    expect(next.difficultyLevel).toBe(1);
    expect(next).toBe(state);
  });

  it('rejects level 5 when only levels 1–4 are unlocked', () => {
    const state = stateWithUnlocked([1, 2, 3, 4], 'classic', 1);
    const next = setDifficultyLevel(state, 5);
    expect(next.difficultyLevel).toBe(1);
    expect(next).toBe(state);
  });

  it('rejects all locked levels when only level 1 is unlocked', () => {
    const state = stateWithUnlocked([1]);
    const locked: DifficultyLevel[] = [2, 3, 4, 5];
    for (const level of locked) {
      const next = setDifficultyLevel(state, level);
      expect(next.difficultyLevel).toBe(1);
      expect(next).toBe(state);
    }
  });

  it('does not modify unlockedDifficulties when a locked level is rejected', () => {
    const state = stateWithUnlocked([1]);
    const next = setDifficultyLevel(state, 5);
    expect(next.unlockedDifficulties).toBe(state.unlockedDifficulties);
  });
});

describe('setDifficultyLevel — unlocked levels are accepted', () => {
  it('accepts level 1 (always unlocked)', () => {
    const state = stateWithUnlocked([1], 'classic', 1);
    // Switch to level 1 from level 1 — no-op
    const next = setDifficultyLevel(state, 1);
    expect(next.difficultyLevel).toBe(1);
  });

  it('accepts level 2 when it is unlocked', () => {
    const state = stateWithUnlocked([1, 2]);
    const next = setDifficultyLevel(state, 2);
    expect(next.difficultyLevel).toBe(2);
  });

  it('accepts level 3 when it is unlocked', () => {
    const state = stateWithUnlocked([1, 2, 3]);
    const next = setDifficultyLevel(state, 3);
    expect(next.difficultyLevel).toBe(3);
  });

  it('accepts level 4 when it is unlocked', () => {
    const state = stateWithUnlocked([1, 2, 3, 4]);
    const next = setDifficultyLevel(state, 4);
    expect(next.difficultyLevel).toBe(4);
  });

  it('accepts level 5 when all levels are unlocked', () => {
    const state = stateWithUnlocked([1, 2, 3, 4, 5]);
    const next = setDifficultyLevel(state, 5);
    expect(next.difficultyLevel).toBe(5);
  });

  it('returns a new state object (immutable update) when the level changes', () => {
    const state = stateWithUnlocked([1, 2]);
    const next = setDifficultyLevel(state, 2);
    expect(next).not.toBe(state);
  });

  it('returns the same state reference when the level is already selected (no-op)', () => {
    const state = stateWithUnlocked([1, 2], 'classic', 2);
    const next = setDifficultyLevel(state, 2);
    expect(next).toBe(state);
  });

  it('does not change the active mode when selecting a difficulty level', () => {
    const state = stateWithUnlocked([1, 2], 'trivia', 1);
    const next = setDifficultyLevel(state, 2);
    expect(next.active).toBe('trivia');
  });

  it('does not change unlockedDifficulties when selecting a difficulty level', () => {
    const state = stateWithUnlocked([1, 2]);
    const next = setDifficultyLevel(state, 2);
    expect(next.unlockedDifficulties).toBe(state.unlockedDifficulties);
  });
});

// ---------------------------------------------------------------------------
// unlockDifficultyLevel
// ---------------------------------------------------------------------------

describe('unlockDifficultyLevel', () => {
  it('adds a new level to unlockedDifficulties', () => {
    const state = stateWithUnlocked([1]);
    const next = unlockDifficultyLevel(state, 2);
    expect(next.unlockedDifficulties.has(2)).toBe(true);
  });

  it('preserves previously unlocked levels', () => {
    const state = stateWithUnlocked([1, 2]);
    const next = unlockDifficultyLevel(state, 3);
    expect(next.unlockedDifficulties.has(1)).toBe(true);
    expect(next.unlockedDifficulties.has(2)).toBe(true);
    expect(next.unlockedDifficulties.has(3)).toBe(true);
  });

  it('returns the same state reference when the level is already unlocked', () => {
    const state = stateWithUnlocked([1, 2]);
    const next = unlockDifficultyLevel(state, 2);
    expect(next).toBe(state);
  });

  it('returns a new state object when a new level is unlocked', () => {
    const state = stateWithUnlocked([1]);
    const next = unlockDifficultyLevel(state, 2);
    expect(next).not.toBe(state);
  });

  it('does not mutate the original unlockedDifficulties set', () => {
    const state = stateWithUnlocked([1]);
    const originalSize = state.unlockedDifficulties.size;
    unlockDifficultyLevel(state, 2);
    expect(state.unlockedDifficulties.size).toBe(originalSize);
  });

  it('does not change active mode or difficultyLevel when unlocking', () => {
    const state = stateWithUnlocked([1], 'trivia', 1);
    const next = unlockDifficultyLevel(state, 2);
    expect(next.active).toBe('trivia');
    expect(next.difficultyLevel).toBe(1);
  });

  it('after unlocking level 2, setDifficultyLevel accepts level 2', () => {
    const state = stateWithUnlocked([1]);
    const unlocked = unlockDifficultyLevel(state, 2);
    const selected = setDifficultyLevel(unlocked, 2);
    expect(selected.difficultyLevel).toBe(2);
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

// ---------------------------------------------------------------------------
// XP_UNLOCK_THRESHOLDS — constant values per design spec
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
// Integration: combined mode + difficulty transitions
// ---------------------------------------------------------------------------

describe('combined mode and difficulty transitions', () => {
  it('mode change does not affect difficulty level', () => {
    const state = stateWithUnlocked([1, 2], 'classic', 2);
    const next = setMode(state, 'game');
    expect(next.difficultyLevel).toBe(2);
  });

  it('difficulty change does not affect active mode', () => {
    const state = stateWithUnlocked([1, 2], 'trivia', 1);
    const next = setDifficultyLevel(state, 2);
    expect(next.active).toBe('trivia');
  });

  it('can chain mode and difficulty transitions independently', () => {
    let state = createInitialModeState();
    state = unlockDifficultyLevel(state, 2);
    state = setMode(state, 'trivia');
    state = setDifficultyLevel(state, 2);
    expect(state.active).toBe('trivia');
    expect(state.difficultyLevel).toBe(2);
  });

  it('locked level remains rejected after a mode change', () => {
    let state = createInitialModeState();
    state = setMode(state, 'game');
    const next = setDifficultyLevel(state, 3);
    expect(next.difficultyLevel).toBe(1); // still locked
  });

  it('unlocking a level then selecting it succeeds', () => {
    let state = createInitialModeState();
    state = unlockDifficultyLevel(state, 2);
    state = unlockDifficultyLevel(state, 3);
    state = setDifficultyLevel(state, 3);
    expect(state.difficultyLevel).toBe(3);
  });
});
