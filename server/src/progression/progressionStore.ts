/**
 * In-memory Progression Store.
 *
 * Holds ProgressionState per user (keyed by userId).
 * Also maintains an in-memory leaderboard (simulating Redis sorted sets):
 *   leaderboard: Map<difficultyLevel, Map<userId, xp>>
 *
 * Requirements: 6.3, 6.4, 5.1, 5.4, 10.1
 */

import { EventEmitter } from "events";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface NameTag {
  atomicNumber: number;
  name: string;
  symbol: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  atomicNumber: number;
  rarity: string;
  stats: Record<string, number>;
}

/**
 * Server-side ProgressionState.
 * Uses plain arrays (not Sets) for JSON serialisation compatibility.
 */
export interface ProgressionState {
  xpByDifficulty: Record<DifficultyLevel, number>;
  unlockedDifficulties: number[];
  masteredElements: number[];   // atomic numbers
  nameTags: NameTag[];
  equippedNameTag: number | null;
  inventory: InventoryItem[];
}

/** Partial update accepted by PUT /api/progress */
export type PartialProgressionState = Partial<ProgressionState>;

// ---------------------------------------------------------------------------
// Default state factory
// ---------------------------------------------------------------------------

function defaultState(): ProgressionState {
  return {
    xpByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    unlockedDifficulties: [1],
    masteredElements: [],
    nameTags: [],
    equippedNameTag: null,
    inventory: [],
  };
}

// ---------------------------------------------------------------------------
// Leaderboard EventEmitter (simulates Redis pub/sub)
// ---------------------------------------------------------------------------

export const leaderboardEmitter = new EventEmitter();

export interface LeaderboardUpdateEvent {
  difficultyLevel: DifficultyLevel;
  userId: string;
  xp: number;
}

// ---------------------------------------------------------------------------
// ProgressionStore
// ---------------------------------------------------------------------------

export class ProgressionStore {
  /** userId → ProgressionState */
  private store: Map<string, ProgressionState> = new Map();

  /**
   * Simulated Redis leaderboard:
   *   difficultyLevel → (userId → xp)
   */
  private leaderboard: Map<DifficultyLevel, Map<string, number>> = new Map();

  // -------------------------------------------------------------------------
  // State access
  // -------------------------------------------------------------------------

  /** Returns the full ProgressionState for a user, creating a default if absent. */
  getState(userId: string): ProgressionState {
    if (!this.store.has(userId)) {
      this.store.set(userId, defaultState());
    }
    // Return a deep copy to prevent accidental mutation of internal state.
    return JSON.parse(JSON.stringify(this.store.get(userId)!));
  }

  /**
   * Merges a partial update into the stored state (last-write-wins per field).
   * After merging, if xpByDifficulty changed the leaderboard is updated.
   *
   * Requirements: 6.3, 6.4
   */
  mergeState(userId: string, partial: PartialProgressionState): ProgressionState {
    const current = this.getState(userId);

    // Merge top-level fields (last-write-wins per field).
    const updated: ProgressionState = {
      ...current,
      ...partial,
      // For xpByDifficulty, merge at the sub-key level so a partial
      // difficulty update doesn't wipe other difficulty XP values.
      xpByDifficulty: partial.xpByDifficulty
        ? { ...current.xpByDifficulty, ...partial.xpByDifficulty }
        : current.xpByDifficulty,
    };

    this.store.set(userId, updated);

    // Update leaderboard for any difficulty whose XP changed.
    if (partial.xpByDifficulty) {
      for (const [key, xp] of Object.entries(partial.xpByDifficulty)) {
        const level = Number(key) as DifficultyLevel;
        this.updateLeaderboard(userId, level, xp);
      }
    }

    return JSON.parse(JSON.stringify(updated));
  }

  // -------------------------------------------------------------------------
  // Mastery / Name Tag
  // -------------------------------------------------------------------------

  /**
   * Records first-defeat of an element and awards a Name_Tag.
   * Idempotent: if the element is already mastered, returns the existing
   * Name_Tag without creating a duplicate.
   *
   * Returns { awarded: boolean; nameTag: NameTag }
   * Requirements: 10.1
   */
  recordMastery(
    userId: string,
    atomicNumber: number,
    nameTagData: Omit<NameTag, "atomicNumber">
  ): { awarded: boolean; nameTag: NameTag } {
    const state = this.getState(userId);

    const alreadyMastered = state.masteredElements.includes(atomicNumber);
    if (alreadyMastered) {
      // Idempotent: return the existing Name_Tag without awarding a new one.
      const existing = state.nameTags.find(
        (t) => t.atomicNumber === atomicNumber
      );
      // existing should always be present if mastered, but guard defensively.
      const nameTag: NameTag = existing ?? {
        atomicNumber,
        ...nameTagData,
      };
      return { awarded: false, nameTag };
    }

    // First defeat — award Name_Tag.
    const nameTag: NameTag = { atomicNumber, ...nameTagData };
    const updated: ProgressionState = {
      ...state,
      masteredElements: [...state.masteredElements, atomicNumber],
      nameTags: [...state.nameTags, nameTag],
    };
    this.store.set(userId, updated);

    return { awarded: true, nameTag };
  }

  // -------------------------------------------------------------------------
  // Leaderboard (in-memory sorted structure)
  // -------------------------------------------------------------------------

  /**
   * Updates the in-memory leaderboard for a given difficulty level and
   * publishes a leaderboard:update event.
   *
   * Requirements: 5.1, 5.4
   */
  updateLeaderboard(
    userId: string,
    difficultyLevel: DifficultyLevel,
    xp: number
  ): void {
    if (!this.leaderboard.has(difficultyLevel)) {
      this.leaderboard.set(difficultyLevel, new Map());
    }
    this.leaderboard.get(difficultyLevel)!.set(userId, xp);

    const event: LeaderboardUpdateEvent = { difficultyLevel, userId, xp };
    leaderboardEmitter.emit("leaderboard:update", event);
  }

  /**
   * Returns the leaderboard for a difficulty level as a sorted array
   * (descending by XP).
   */
  getLeaderboard(
    difficultyLevel: DifficultyLevel
  ): Array<{ userId: string; xp: number }> {
    const map = this.leaderboard.get(difficultyLevel);
    if (!map) return [];

    return Array.from(map.entries())
      .map(([userId, xp]) => ({ userId, xp }))
      .sort((a, b) => b.xp - a.xp);
  }

  // -------------------------------------------------------------------------
  // Test helpers
  // -------------------------------------------------------------------------

  /** Clears all stored state — used in tests. */
  clear(): void {
    this.store.clear();
    this.leaderboard.clear();
  }
}

/** Singleton store instance shared across the application. */
export const progressionStore = new ProgressionStore();
