/**
 * Mode system state logic module.
 *
 * Contains the pure state-transition logic for the mode system and difficulty
 * level management.  Keeping this separate from the Zustand store and React
 * components makes it fully testable without a DOM or WebGL context.
 *
 * Design spec (section 4):
 *   - Three modes: "classic" | "trivia" | "game"
 *   - Five difficulty levels: 1 | 2 | 3 | 4 | 5
 *   - Difficulty levels above 1 are locked until the required XP threshold is
 *     reached via the Progression_Service.
 *   - setDifficultyLevel rejects locked levels (returns state unchanged).
 *
 * XP unlock thresholds (design spec section 7.4):
 *   1 → 2 : 500 XP
 *   2 → 3 : 2,000 XP
 *   3 → 4 : 6,000 XP
 *   4 → 5 : 15,000 XP
 *
 * Requirements: 2.7, 4.1
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The three application modes. */
export type ActiveMode = 'classic' | 'trivia' | 'game';

/** Valid difficulty level values. */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/** The full mode slice state. */
export interface ModeState {
  /** Currently active mode. */
  active: ActiveMode;
  /** Currently selected difficulty level. */
  difficultyLevel: DifficultyLevel;
  /** Set of difficulty levels the user has unlocked. Level 1 is always unlocked. */
  unlockedDifficulties: ReadonlySet<DifficultyLevel>;
}

// ---------------------------------------------------------------------------
// XP unlock thresholds
// ---------------------------------------------------------------------------

/**
 * Cumulative XP required to unlock each difficulty level.
 * Level 1 is always unlocked (no XP required).
 */
export const XP_UNLOCK_THRESHOLDS: Readonly<Record<DifficultyLevel, number>> = {
  1: 0,
  2: 500,
  3: 2000,
  4: 6000,
  5: 15000,
};

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

/**
 * Create the default initial mode state.
 * Classic mode is active, difficulty level 1 is selected, and only level 1
 * is unlocked.
 */
export function createInitialModeState(): ModeState {
  return {
    active: 'classic',
    difficultyLevel: 1,
    unlockedDifficulties: new Set<DifficultyLevel>([1]),
  };
}

// ---------------------------------------------------------------------------
// State transition functions
// ---------------------------------------------------------------------------

/**
 * Transition to a new active mode.
 *
 * All three modes are always available for selection; mode transitions are
 * never blocked.  Returns a new state object (immutable update).
 *
 * Requirement 4.1 — mode transitions update the active mode correctly.
 *
 * @param state   - Current mode state.
 * @param newMode - The mode to activate.
 * @returns New state with the requested mode active.
 */
export function setMode(state: ModeState, newMode: ActiveMode): ModeState {
  if (state.active === newMode) return state; // no-op, same reference
  return { ...state, active: newMode };
}

/**
 * Attempt to select a difficulty level.
 *
 * If the requested level is not in `unlockedDifficulties`, the state is
 * returned unchanged (the selection is rejected).  Returns a new state object
 * on success.
 *
 * Requirement 2.7 — locked difficulty levels cannot be selected.
 *
 * @param state - Current mode state.
 * @param level - The difficulty level to select.
 * @returns New state with the requested level active, or the original state if
 *          the level is locked.
 */
export function setDifficultyLevel(
  state: ModeState,
  level: DifficultyLevel,
): ModeState {
  if (!state.unlockedDifficulties.has(level)) {
    // Level is locked — reject the selection.
    return state;
  }
  if (state.difficultyLevel === level) return state; // no-op
  return { ...state, difficultyLevel: level };
}

/**
 * Unlock a difficulty level (called by the Progression_Service when the XP
 * threshold is crossed).  Returns a new state object with the level added to
 * `unlockedDifficulties`.  If the level is already unlocked the original state
 * is returned unchanged.
 *
 * @param state - Current mode state.
 * @param level - The difficulty level to unlock.
 * @returns New state with the level unlocked.
 */
export function unlockDifficultyLevel(
  state: ModeState,
  level: DifficultyLevel,
): ModeState {
  if (state.unlockedDifficulties.has(level)) return state; // already unlocked
  const newUnlocked = new Set(state.unlockedDifficulties);
  newUnlocked.add(level);
  return { ...state, unlockedDifficulties: newUnlocked };
}

/**
 * Compute which difficulty levels should be unlocked given a cumulative XP
 * total.  Returns the set of levels whose XP threshold has been met.
 *
 * Level 1 is always included (threshold is 0 XP).
 *
 * @param totalXp - Cumulative XP earned by the user.
 * @returns Set of difficulty levels unlocked at this XP total.
 */
export function computeUnlockedDifficulties(totalXp: number): Set<DifficultyLevel> {
  const unlocked = new Set<DifficultyLevel>();
  const levels: DifficultyLevel[] = [1, 2, 3, 4, 5];
  for (const level of levels) {
    if (totalXp >= XP_UNLOCK_THRESHOLDS[level]) {
      unlocked.add(level);
    }
  }
  return unlocked;
}
