/**
 * Progression state logic module.
 *
 * Contains the pure state-transition logic for XP tracking and difficulty
 * unlock management.  Keeping this separate from the Zustand store and React
 * components makes it fully testable without a DOM or WebGL context.
 *
 * Design spec (section 7.4):
 *   XP unlock thresholds:
 *     1 → 2 : 500 XP
 *     2 → 3 : 2,000 XP
 *     3 → 4 : 6,000 XP
 *     4 → 5 : 15,000 XP
 *
 * After addXP, check thresholds and call unlockDifficulty + notify user when
 * threshold is crossed.  The notification fires exactly once per threshold
 * crossing — subsequent addXP calls that do not cross a new threshold do NOT
 * fire the notification again.
 *
 * Requirements: 4.5, 4.6
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Valid difficulty level values. */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * The progression slice state.
 *
 * `totalXp` is the cumulative XP across all difficulty levels (used for
 * unlock threshold checks, per design spec section 7.4).
 * `unlockedDifficulties` is the set of difficulty levels the user has
 * unlocked.  Level 1 is always unlocked.
 */
export interface ProgressionState {
  /** Cumulative XP earned by the user. */
  totalXp: number;
  /** Set of difficulty levels the user has unlocked. Level 1 is always unlocked. */
  unlockedDifficulties: ReadonlySet<DifficultyLevel>;
}

/**
 * Callback invoked when a new difficulty level is unlocked.
 *
 * Requirement 4.6 — the Progression_Service SHALL notify the user that a new
 * Difficulty_Level has been unlocked.
 *
 * @param level - The difficulty level that was just unlocked.
 */
export type UnlockNotifier = (level: DifficultyLevel) => void;

// ---------------------------------------------------------------------------
// XP unlock thresholds (design spec section 7.4)
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

/**
 * Ordered list of difficulty levels that can be unlocked via XP thresholds
 * (levels 2–5; level 1 is always unlocked).
 */
const LOCKABLE_LEVELS: ReadonlyArray<DifficultyLevel> = [2, 3, 4, 5];

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

/**
 * Create the default initial progression state.
 * XP starts at 0 and only level 1 is unlocked.
 */
export function createInitialProgressionState(): ProgressionState {
  return {
    totalXp: 0,
    unlockedDifficulties: new Set<DifficultyLevel>([1]),
  };
}

// ---------------------------------------------------------------------------
// State transition functions
// ---------------------------------------------------------------------------

/**
 * Add XP to the progression state.
 *
 * After updating the XP total, checks each unlock threshold in order.  For
 * every threshold that is newly crossed (i.e., the level was locked before
 * and the new XP total meets or exceeds the threshold), the level is unlocked
 * and `onUnlock` is called exactly once for that level.
 *
 * Subsequent calls to `addXP` that do not cross a new threshold will NOT
 * invoke `onUnlock` again for already-unlocked levels.
 *
 * Requirements:
 *   4.5 — track cumulative XP and unlock the next Difficulty_Level when the
 *          required XP threshold is reached.
 *   4.6 — notify the user exactly once when a new Difficulty_Level is
 *          unlocked.
 *
 * @param state    - Current progression state.
 * @param amount   - Non-negative XP amount to add.
 * @param onUnlock - Callback invoked once per newly unlocked difficulty level.
 * @returns New progression state with updated XP and unlocked difficulties.
 */
export function addXP(
  state: ProgressionState,
  amount: number,
  onUnlock: UnlockNotifier,
): ProgressionState {
  if (amount < 0) {
    throw new RangeError(`addXP: amount must be non-negative, got ${amount}`);
  }

  const newTotalXp = state.totalXp + amount;
  let newUnlocked = state.unlockedDifficulties as Set<DifficultyLevel>;
  let mutated = false;

  for (const level of LOCKABLE_LEVELS) {
    if (
      !newUnlocked.has(level) &&
      newTotalXp >= XP_UNLOCK_THRESHOLDS[level]
    ) {
      // Clone the set on first mutation to preserve immutability.
      if (!mutated) {
        newUnlocked = new Set(newUnlocked);
        mutated = true;
      }
      newUnlocked.add(level);
      // Notify exactly once per threshold crossing.
      onUnlock(level);
    }
  }

  return {
    totalXp: newTotalXp,
    unlockedDifficulties: newUnlocked,
  };
}

/**
 * Unlock a difficulty level directly (e.g., called by the backend sync
 * response).  Returns a new state with the level added to
 * `unlockedDifficulties`.  If the level is already unlocked the original
 * state is returned unchanged.
 *
 * @param state - Current progression state.
 * @param level - The difficulty level to unlock.
 * @returns New state with the level unlocked.
 */
export function unlockDifficulty(
  state: ProgressionState,
  level: DifficultyLevel,
): ProgressionState {
  if (state.unlockedDifficulties.has(level)) return state;
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
export function computeUnlockedDifficulties(
  totalXp: number,
): Set<DifficultyLevel> {
  const unlocked = new Set<DifficultyLevel>();
  const levels: DifficultyLevel[] = [1, 2, 3, 4, 5];
  for (const level of levels) {
    if (totalXp >= XP_UNLOCK_THRESHOLDS[level]) {
      unlocked.add(level);
    }
  }
  return unlocked;
}
