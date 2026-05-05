/**
 * Application startup sequence module.
 *
 * Implements the startup flow described in design spec section 9.1:
 *
 *   Browser loads SPA
 *     → Load elements.json (static asset, ~200 KB)
 *     → Initialize Three.js scene
 *     → Mount PeriodicTableGroup with Level-1 meshes
 *     → Check for existing session (cookie)
 *       → If valid: fetch /api/progress → restore ProgressionState
 *       → If none: show guest state (progress not persisted)
 *     → Render complete (target: <10s on broadband)
 *
 * This module is a pure function with dependency injection so it is fully
 * testable without a DOM, network, or WebGL context.
 *
 * Requirements: 1.5, 6.4
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Phases of the startup sequence.
 *
 * - 'loading' : startup is in progress
 * - 'ready'   : startup completed successfully
 * - 'error'   : startup failed with an unrecoverable error
 */
export type StartupPhase = 'loading' | 'ready' | 'error';

/**
 * Minimal element record shape expected from elements.json.
 * The full Element interface lives in client/src/types/index.ts; we use a
 * structural subset here so the startup module has no hard dependency on the
 * full type definition.
 */
export interface ElementRecord {
  atomicNumber: number;
  symbol: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Progression state restored from the backend for an authenticated user.
 * Mirrors the server-side ProgressionState shape (design spec section 7.1).
 */
export interface RestoredProgressionState {
  xpByDifficulty: Record<1 | 2 | 3 | 4 | 5, number>;
  unlockedDifficulties: number[];
  masteredElements: number[];
  nameTags: unknown[];
  equippedNameTag: number | null;
  inventory: unknown[];
}

/**
 * Guest state used when no valid session is present.
 * Progress is not persisted for guest users.
 */
export interface GuestProgressionState {
  isGuest: true;
  xpByDifficulty: Record<1 | 2 | 3 | 4 | 5, number>;
  unlockedDifficulties: number[];
  masteredElements: number[];
  nameTags: never[];
  equippedNameTag: null;
  inventory: never[];
}

/** Union of the two possible progression state shapes after startup. */
export type StartupProgressionState = RestoredProgressionState | GuestProgressionState;

/**
 * The result returned by a successful startup sequence.
 *
 * Requirements:
 *   1.5 — Renderer SHALL load and display the full periodic table environment
 *          within 10 seconds on a standard broadband connection.
 *   6.4 — WHEN a user logs in, THE Progression_Service SHALL restore all
 *          saved progress, unlocks, and stats from the user's Account within
 *          5 seconds.
 */
export interface StartupResult {
  /** All 118 element records loaded from elements.json. */
  elements: ElementRecord[];
  /** Progression state — either restored from the server or a fresh guest state. */
  progressionState: StartupProgressionState;
  /** Whether the user is authenticated (has a valid session). */
  isAuthenticated: boolean;
}

/**
 * Dependency bag injected into `runStartupSequence`.
 * Each dependency is a function so it can be replaced in tests.
 */
export interface StartupDeps {
  /**
   * Load the elements.json static asset.
   * Should resolve to an array of 118 element records.
   */
  loadElements: () => Promise<ElementRecord[]>;

  /**
   * Check for an existing session.
   * Returns the session token string if a valid session cookie is present,
   * or `null` if no session exists.
   */
  checkSession: () => string | null;

  /**
   * Fetch the user's progression state from the backend.
   * Called only when `checkSession` returns a non-null token.
   * Should call `GET /api/progress`.
   *
   * @param token - The session token returned by `checkSession`.
   */
  fetchProgress: (token: string) => Promise<RestoredProgressionState>;
}

// ---------------------------------------------------------------------------
// Guest state factory
// ---------------------------------------------------------------------------

/**
 * Create a fresh guest progression state.
 * All XP starts at 0, only difficulty level 1 is unlocked, and no items or
 * name tags are present.
 */
export function createGuestState(): GuestProgressionState {
  return {
    isGuest: true,
    xpByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    unlockedDifficulties: [1],
    masteredElements: [],
    nameTags: [],
    equippedNameTag: null,
    inventory: [],
  };
}

// ---------------------------------------------------------------------------
// Startup sequence
// ---------------------------------------------------------------------------

/**
 * Run the full application startup sequence.
 *
 * Steps (design spec section 9.1):
 *   1. Load elements.json via `deps.loadElements`.
 *   2. Check for an existing session via `deps.checkSession`.
 *   3a. If a session token is present: fetch progress via `deps.fetchProgress`
 *       and return the restored `ProgressionState`.
 *   3b. If no session: return a fresh guest state.
 *
 * The Three.js scene initialization and PeriodicTableGroup mounting are
 * handled by the React component tree after this function resolves; this
 * module is responsible only for the data-loading phase.
 *
 * Target: resolves within 10 seconds on a standard broadband connection
 * (Requirement 1.5).  Progress restoration resolves within 5 seconds of
 * login (Requirement 6.4).
 *
 * @param deps - Injected dependencies (loadElements, checkSession, fetchProgress).
 * @returns A `StartupResult` containing the loaded elements and progression state.
 * @throws Re-throws any error from `loadElements` or `fetchProgress` so the
 *         caller can transition to the 'error' phase.
 */
export async function runStartupSequence(
  deps: StartupDeps,
): Promise<StartupResult> {
  // Step 1: Load element data (static asset, ~200 KB).
  const elements = await deps.loadElements();

  // Step 2: Check for an existing session cookie.
  const token = deps.checkSession();

  if (token !== null) {
    // Step 3a: Valid session — restore progression state from the backend.
    // Requirement 6.4: restore within 5 seconds.
    const progressionState = await deps.fetchProgress(token);
    return {
      elements,
      progressionState,
      isAuthenticated: true,
    };
  }

  // Step 3b: No session — initialize guest state.
  return {
    elements,
    progressionState: createGuestState(),
    isAuthenticated: false,
  };
}
