/**
 * In-memory Encounter Store.
 *
 * Holds active encounter records keyed by encounterId (UUID).
 * Each record stores the seed and element/difficulty context needed
 * for server-side loot recomputation on encounter completion.
 *
 * Requirements: 8.1, 8.4, 9.1
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EncounterRecord {
  encounterId: string;
  userId: string;
  elementAtomicNumber: number;
  difficultyLevel: number;
  seed: number;           // 32-bit unsigned integer
  createdAt: number;      // Date.now() timestamp
  completed: boolean;
  outcome: "victory" | "defeat" | null;
}

// ---------------------------------------------------------------------------
// EncounterStore
// ---------------------------------------------------------------------------

export class EncounterStore {
  private store: Map<string, EncounterRecord> = new Map();

  /** Persist a new encounter record. */
  create(record: EncounterRecord): void {
    this.store.set(record.encounterId, record);
  }

  /** Retrieve an encounter by ID. Returns undefined if not found. */
  get(encounterId: string): EncounterRecord | undefined {
    return this.store.get(encounterId);
  }

  /** Mark an encounter as completed with the given outcome. */
  complete(encounterId: string, outcome: "victory" | "defeat"): void {
    const record = this.store.get(encounterId);
    if (record) {
      record.completed = true;
      record.outcome = outcome;
    }
  }

  /** Clears all stored encounters — used in tests. */
  clear(): void {
    this.store.clear();
  }
}

/** Singleton store instance shared across the application. */
export const encounterStore = new EncounterStore();
