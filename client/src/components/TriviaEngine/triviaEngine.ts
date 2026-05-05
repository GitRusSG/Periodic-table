/**
 * TriviaEngine — pure client-side batch management and retry logic.
 *
 * This module contains no React or fetch dependencies. The fetch function and
 * timer functions are injected so the module is fully testable without a DOM,
 * network, or real timers.
 *
 * Design spec (section 4.3):
 *   - Requests a question batch from the backend
 *     (GET /api/trivia/questions?difficulty=N&count=10)
 *   - Caches the batch locally; fetches the next batch when 3 questions remain
 *   - Presents one question at a time; evaluates answers locally
 *   - Submits answer results to the backend for XP award
 *
 * Requirement 4.7:
 *   IF the Trivia_Engine cannot retrieve a question within 3 seconds,
 *   THEN the Trivia_Engine SHALL display a loading indicator and retry the
 *   request up to 3 times before displaying an error message.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of questions per batch fetched from the backend. */
export const BATCH_SIZE = 10;

/**
 * When this many questions remain in the local cache, a new batch fetch is
 * triggered proactively so the user never waits between questions.
 */
export const REFETCH_THRESHOLD = 3;

/** Timeout in milliseconds before a loading indicator is shown and a retry is attempted. */
export const FETCH_TIMEOUT_MS = 3_000;

/** Maximum number of retry attempts before an error message is displayed. */
export const MAX_RETRIES = 3;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TriviaQuestion {
  id: string;
  token: string; // HMAC-signed token from backend
  text: string;
  options: string[];
  correctIndex: number;
  difficultyLevel: number;
}

export type EngineStatus =
  | 'idle'
  | 'fetching'
  | 'loading' // shown after FETCH_TIMEOUT_MS elapses
  | 'ready'
  | 'error';

export interface TriviaEngineState {
  status: EngineStatus;
  batch: TriviaQuestion[];
  /** Index of the question currently being presented (0-based within batch). */
  currentIndex: number;
  retryCount: number;
  errorMessage: string | null;
}

/** Dependency-injected fetch function signature. */
export type FetchFn = (url: string) => Promise<TriviaQuestion[]>;

/** Dependency-injected timer functions (allows fake timers in tests). */
export interface TimerDeps {
  setTimeout: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (id: ReturnType<typeof setTimeout>) => void;
}

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

export function createInitialState(): TriviaEngineState {
  return {
    status: 'idle',
    batch: [],
    currentIndex: 0,
    retryCount: 0,
    errorMessage: null,
  };
}

// ---------------------------------------------------------------------------
// TriviaEngine class
// ---------------------------------------------------------------------------

/**
 * TriviaEngine manages the local question batch and the fetch/retry lifecycle.
 *
 * Usage:
 *   const engine = new TriviaEngine(fetchFn, onStateChange);
 *   engine.start(difficultyLevel);
 */
export class TriviaEngine {
  private state: TriviaEngineState;
  private readonly fetchFn: FetchFn;
  private readonly onStateChange: (state: TriviaEngineState) => void;
  private readonly timers: TimerDeps;
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  private difficultyLevel = 1;

  constructor(
    fetchFn: FetchFn,
    onStateChange: (state: TriviaEngineState) => void,
    timers: TimerDeps = {
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
    },
  ) {
    this.fetchFn = fetchFn;
    this.onStateChange = onStateChange;
    this.timers = timers;
    this.state = createInitialState();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /** Start the engine for the given difficulty level. Fetches the first batch. */
  start(difficultyLevel: number): void {
    this.difficultyLevel = difficultyLevel;
    this.state = createInitialState();
    this._fetchBatch();
  }

  /** Return the current engine state (read-only snapshot). */
  getState(): Readonly<TriviaEngineState> {
    return { ...this.state };
  }

  /**
   * Advance to the next question.
   * If the remaining question count drops to REFETCH_THRESHOLD, a new batch
   * fetch is triggered automatically.
   */
  advance(): void {
    if (this.state.status !== 'ready') return;

    const nextIndex = this.state.currentIndex + 1;
    this._setState({ currentIndex: nextIndex });

    const remaining = this.state.batch.length - nextIndex;
    if (remaining <= REFETCH_THRESHOLD) {
      this._fetchBatch();
    }
  }

  /** Return the question currently being presented, or null if not ready. */
  currentQuestion(): TriviaQuestion | null {
    if (this.state.status !== 'ready') return null;
    return this.state.batch[this.state.currentIndex] ?? null;
  }

  /** Remaining questions in the current batch (including the current one). */
  remainingCount(): number {
    return Math.max(0, this.state.batch.length - this.state.currentIndex);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _setState(partial: Partial<TriviaEngineState>): void {
    this.state = { ...this.state, ...partial };
    this.onStateChange({ ...this.state });
  }

  /**
   * Fetch a new batch from the backend.
   * - Sets status to 'fetching'.
   * - Starts a FETCH_TIMEOUT_MS timer; if it fires, sets status to 'loading'
   *   and schedules a retry (up to MAX_RETRIES times).
   * - On success, appends the new questions to the batch and sets status to 'ready'.
   * - On exhausted retries, sets status to 'error'.
   */
  private _fetchBatch(): void {
    // Don't start a second concurrent fetch.
    if (this.state.status === 'fetching' || this.state.status === 'loading') {
      return;
    }

    this._setState({ status: 'fetching', errorMessage: null });
    this._attemptFetch(this.state.retryCount);
  }

  private _attemptFetch(attempt: number): void {
    const url = `/api/trivia/questions?difficulty=${this.difficultyLevel}&count=${BATCH_SIZE}`;

    // Start the loading-indicator timer.
    this._clearLoadingTimer();
    this.loadingTimer = this.timers.setTimeout(() => {
      // Timeout fired — show loading indicator.
      this._setState({ status: 'loading' });
    }, FETCH_TIMEOUT_MS);

    this.fetchFn(url)
      .then((questions) => {
        this._clearLoadingTimer();

        // Append new questions; keep only unplayed ones from the old batch.
        const remaining = this.state.batch.slice(this.state.currentIndex);
        const merged = [...remaining, ...questions];

        this._setState({
          status: 'ready',
          batch: merged,
          currentIndex: 0,
          retryCount: 0,
          errorMessage: null,
        });
      })
      .catch(() => {
        this._clearLoadingTimer();

        const nextAttempt = attempt + 1;
        if (nextAttempt < MAX_RETRIES) {
          // Retry.
          this._setState({ status: 'fetching', retryCount: nextAttempt });
          this._attemptFetch(nextAttempt);
        } else {
          // Exhausted retries.
          this._setState({
            status: 'error',
            retryCount: nextAttempt,
            errorMessage:
              'Unable to load trivia questions. Please check your connection and try again.',
          });
        }
      });
  }

  private _clearLoadingTimer(): void {
    if (this.loadingTimer !== null) {
      this.timers.clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
  }
}
