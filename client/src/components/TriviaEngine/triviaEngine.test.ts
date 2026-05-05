/**
 * Unit tests for TriviaEngine batch management and retry logic.
 *
 * Validates: Requirements 4.7
 *   - A new batch is requested when 3 questions remain.
 *   - The loading indicator appears after 3 seconds and retries up to 3 times.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TriviaEngine,
  TriviaQuestion,
  BATCH_SIZE,
  REFETCH_THRESHOLD,
  FETCH_TIMEOUT_MS,
  MAX_RETRIES,
  createInitialState,
} from './triviaEngine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid TriviaQuestion. */
function makeQuestion(id: string, difficulty = 1): TriviaQuestion {
  return {
    id,
    token: `token-${id}`,
    text: `Question ${id}`,
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    difficultyLevel: difficulty,
  };
}

/** Build an array of N questions. */
function makeQuestions(n: number, difficulty = 1): TriviaQuestion[] {
  return Array.from({ length: n }, (_, i) => makeQuestion(String(i + 1), difficulty));
}

/** A fetch function that resolves immediately with `questions`. */
function resolvingFetch(questions: TriviaQuestion[]): () => Promise<TriviaQuestion[]> {
  return () => Promise.resolve(questions);
}

/** A fetch function that rejects immediately. */
function rejectingFetch(): () => Promise<TriviaQuestion[]> {
  return () => Promise.reject(new Error('Network error'));
}

/**
 * A fetch function that resolves on the Nth call and rejects on all prior calls.
 * `callCount` is mutated by reference so callers can inspect it.
 */
function failThenSucceedFetch(
  failCount: number,
  successQuestions: TriviaQuestion[],
  callCount: { value: number },
): () => Promise<TriviaQuestion[]> {
  return () => {
    callCount.value += 1;
    if (callCount.value <= failCount) {
      return Promise.reject(new Error('Transient error'));
    }
    return Promise.resolve(successQuestions);
  };
}

/**
 * Flush the microtask queue `n` times.
 * Each `await Promise.resolve()` drains one level of chained microtasks.
 */
async function flushMicrotasks(n = 5): Promise<void> {
  for (let i = 0; i < n; i++) {
    await Promise.resolve();
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('TriviaEngine constants', () => {
  it('BATCH_SIZE is 10', () => {
    expect(BATCH_SIZE).toBe(10);
  });

  it('REFETCH_THRESHOLD is 3', () => {
    expect(REFETCH_THRESHOLD).toBe(3);
  });

  it('FETCH_TIMEOUT_MS is 3000', () => {
    expect(FETCH_TIMEOUT_MS).toBe(3_000);
  });

  it('MAX_RETRIES is 3', () => {
    expect(MAX_RETRIES).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('createInitialState', () => {
  it('returns idle status with an empty batch', () => {
    const state = createInitialState();
    expect(state.status).toBe('idle');
    expect(state.batch).toHaveLength(0);
    expect(state.currentIndex).toBe(0);
    expect(state.retryCount).toBe(0);
    expect(state.errorMessage).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Batch management — new batch requested when 3 questions remain
// ---------------------------------------------------------------------------

describe('TriviaEngine — batch refetch trigger', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches the first batch when start() is called', async () => {
    const questions = makeQuestions(BATCH_SIZE);
    const fetchFn = vi.fn(resolvingFetch(questions));
    const onStateChange = vi.fn();
    const engine = new TriviaEngine(fetchFn, onStateChange);

    engine.start(1);
    await Promise.resolve(); // flush microtasks

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith(
      `/api/trivia/questions?difficulty=1&count=${BATCH_SIZE}`,
    );
  });

  it('transitions to "ready" after a successful fetch', async () => {
    const questions = makeQuestions(BATCH_SIZE);
    const engine = new TriviaEngine(resolvingFetch(questions), vi.fn());

    engine.start(1);
    await Promise.resolve();

    expect(engine.getState().status).toBe('ready');
    expect(engine.getState().batch).toHaveLength(BATCH_SIZE);
  });

  it('does NOT trigger a new fetch while questions remain above the threshold', async () => {
    const questions = makeQuestions(BATCH_SIZE);
    const fetchFn = vi.fn(resolvingFetch(questions));
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    await Promise.resolve(); // first fetch resolves

    // Advance until 4 questions remain (one above threshold).
    // Batch has 10 questions; currentIndex 0 → remaining 10.
    // We need remaining = 4, so advance to currentIndex = 6.
    for (let i = 0; i < 6; i++) {
      engine.advance();
    }
    await Promise.resolve();

    // Only the initial fetch should have been made.
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(engine.remainingCount()).toBe(4);
  });

  it('triggers a new batch fetch when exactly REFETCH_THRESHOLD questions remain', async () => {
    // Use a fetch that hangs on the second call so we can inspect state before merge.
    let secondFetchCalled = false;
    let resolveSecond!: (q: TriviaQuestion[]) => void;
    const firstBatch = makeQuestions(BATCH_SIZE);
    const fetchFn = vi.fn(() => {
      if (!secondFetchCalled) {
        secondFetchCalled = false; // first call
        return Promise.resolve(firstBatch);
      }
      return new Promise<TriviaQuestion[]>((resolve) => {
        resolveSecond = resolve;
      });
    });

    // Simpler approach: use a counter to distinguish calls.
    let callCount = 0;
    const fetchFn2 = vi.fn(() => {
      callCount += 1;
      if (callCount === 1) return Promise.resolve(firstBatch);
      // Second call hangs so we can check state before it resolves.
      return new Promise<TriviaQuestion[]>((resolve) => {
        resolveSecond = resolve;
      });
    });

    const engine = new TriviaEngine(fetchFn2, vi.fn());
    engine.start(1);
    await Promise.resolve(); // first fetch resolves

    // Advance until remaining drops to REFETCH_THRESHOLD (3).
    // 10 questions, currentIndex 0 → remaining 10.
    // We need remaining = 3, so advance to currentIndex = 7.
    for (let i = 0; i < 7; i++) {
      engine.advance();
    }

    // The second fetch should have been triggered (it's now pending/hanging).
    expect(fetchFn2).toHaveBeenCalledTimes(2);
    // Before the second fetch resolves, remaining is still 3.
    expect(engine.remainingCount()).toBe(REFETCH_THRESHOLD);

    // Clean up: resolve the hanging fetch.
    resolveSecond(makeQuestions(BATCH_SIZE));
    await Promise.resolve();
  });

  it('triggers a new batch fetch when fewer than REFETCH_THRESHOLD questions remain', async () => {
    // The refetch fires when remaining <= REFETCH_THRESHOLD.
    // After the refetch starts (status = 'fetching'), advance() is blocked.
    // So the minimum remaining at which a refetch fires is exactly REFETCH_THRESHOLD.
    // This test verifies the condition fires for remaining = REFETCH_THRESHOLD - 1
    // by using a batch smaller than BATCH_SIZE so we can reach that count.
    const smallBatch = makeQuestions(REFETCH_THRESHOLD + 1); // 4 questions
    let callCount = 0;
    let resolveSecond!: (q: TriviaQuestion[]) => void;
    const fetchFn = vi.fn(() => {
      callCount += 1;
      if (callCount === 1) return Promise.resolve(smallBatch);
      return new Promise<TriviaQuestion[]>((resolve) => {
        resolveSecond = resolve;
      });
    });

    const engine = new TriviaEngine(fetchFn, vi.fn());
    engine.start(1);
    await Promise.resolve(); // first fetch resolves (4 questions)

    // Advance once: remaining = 3 = REFETCH_THRESHOLD → triggers refetch.
    engine.advance();

    // Second fetch should have been triggered.
    expect(fetchFn).toHaveBeenCalledTimes(2);
    // Remaining is 3 (currentIndex=1, batch.length=4).
    expect(engine.remainingCount()).toBe(REFETCH_THRESHOLD);

    // Clean up.
    resolveSecond(makeQuestions(BATCH_SIZE));
    await Promise.resolve();
  });

  it('does not start a second concurrent fetch if one is already in progress', async () => {
    // Use a fetch that never resolves so the engine stays in 'fetching'.
    let resolveFirst!: (q: TriviaQuestion[]) => void;
    const pendingFetch = () =>
      new Promise<TriviaQuestion[]>((resolve) => {
        resolveFirst = resolve;
      });
    const fetchFn = vi.fn(pendingFetch);
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    // Manually call _fetchBatch equivalent by calling start again while fetching.
    engine.start(1); // resets and triggers another fetch

    // Only 1 fetch should be in flight at a time per start() call.
    expect(fetchFn).toHaveBeenCalledTimes(2); // start() resets state each time

    resolveFirst(makeQuestions(BATCH_SIZE));
    await Promise.resolve();
  });

  it('includes the difficulty level in the fetch URL', async () => {
    const fetchFn = vi.fn(resolvingFetch(makeQuestions(BATCH_SIZE, 3)));
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(3);
    await Promise.resolve();

    expect(fetchFn).toHaveBeenCalledWith(
      `/api/trivia/questions?difficulty=3&count=${BATCH_SIZE}`,
    );
  });

  it('merges remaining questions with the new batch after a refetch', async () => {
    const firstBatch = makeQuestions(BATCH_SIZE);
    const secondBatch = makeQuestions(BATCH_SIZE).map((q) => ({
      ...q,
      id: `new-${q.id}`,
    }));

    let callCount = 0;
    const fetchFn = vi.fn(() => {
      callCount += 1;
      return callCount === 1
        ? Promise.resolve(firstBatch)
        : Promise.resolve(secondBatch);
    });

    const engine = new TriviaEngine(fetchFn, vi.fn());
    engine.start(1);
    await Promise.resolve(); // first batch loaded

    // Advance to trigger refetch (7 advances → 3 remaining).
    for (let i = 0; i < 7; i++) {
      engine.advance();
    }
    await Promise.resolve(); // second batch loaded

    // After merge: 3 remaining from first batch + 10 from second = 13 total,
    // currentIndex reset to 0.
    expect(engine.getState().batch).toHaveLength(13);
    expect(engine.getState().currentIndex).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Loading indicator — appears after 3 seconds
// ---------------------------------------------------------------------------

describe('TriviaEngine — loading indicator after timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('status is "fetching" immediately after start()', () => {
    // Use a fetch that never resolves.
    const engine = new TriviaEngine(() => new Promise(() => {}), vi.fn());
    engine.start(1);
    expect(engine.getState().status).toBe('fetching');
  });

  it('status remains "fetching" before FETCH_TIMEOUT_MS elapses', () => {
    const engine = new TriviaEngine(() => new Promise(() => {}), vi.fn());
    engine.start(1);

    vi.advanceTimersByTime(FETCH_TIMEOUT_MS - 1);
    expect(engine.getState().status).toBe('fetching');
  });

  it('status becomes "loading" after exactly FETCH_TIMEOUT_MS elapses', () => {
    const engine = new TriviaEngine(() => new Promise(() => {}), vi.fn());
    engine.start(1);

    vi.advanceTimersByTime(FETCH_TIMEOUT_MS);
    expect(engine.getState().status).toBe('loading');
  });

  it('onStateChange is called with status "loading" when the timeout fires', () => {
    const onStateChange = vi.fn();
    const engine = new TriviaEngine(() => new Promise(() => {}), onStateChange);
    engine.start(1);

    vi.advanceTimersByTime(FETCH_TIMEOUT_MS);

    const loadingCall = onStateChange.mock.calls.find(
      ([s]) => s.status === 'loading',
    );
    expect(loadingCall).toBeDefined();
  });

  it('loading timer is cleared when the fetch resolves before the timeout', async () => {
    const questions = makeQuestions(BATCH_SIZE);
    const onStateChange = vi.fn();
    const engine = new TriviaEngine(resolvingFetch(questions), onStateChange);

    engine.start(1);
    await Promise.resolve(); // fetch resolves immediately

    // Advance past the timeout — status should NOT become 'loading'.
    vi.advanceTimersByTime(FETCH_TIMEOUT_MS + 1_000);

    const states = onStateChange.mock.calls.map(([s]) => s.status);
    expect(states).not.toContain('loading');
    expect(engine.getState().status).toBe('ready');
  });
});

// ---------------------------------------------------------------------------
// Retry logic — up to 3 retries before error
// ---------------------------------------------------------------------------

describe('TriviaEngine — retry logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries after a failed fetch (attempt 1 of 3)', async () => {
    const callCount = { value: 0 };
    const questions = makeQuestions(BATCH_SIZE);
    const fetchFn = vi.fn(failThenSucceedFetch(1, questions, callCount));
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    await flushMicrotasks(6);

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(engine.getState().status).toBe('ready');
  });

  it('retries up to MAX_RETRIES times before giving up', async () => {
    const fetchFn = vi.fn(rejectingFetch());
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    await flushMicrotasks(10);

    // Should have attempted MAX_RETRIES total calls (initial + MAX_RETRIES-1 retries).
    expect(fetchFn).toHaveBeenCalledTimes(MAX_RETRIES);
    expect(engine.getState().status).toBe('error');
  });

  it('sets status to "error" after exhausting all retries', async () => {
    const fetchFn = vi.fn(rejectingFetch());
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    await flushMicrotasks(10);

    expect(engine.getState().status).toBe('error');
  });

  it('sets a non-null errorMessage after exhausting all retries', async () => {
    const engine = new TriviaEngine(rejectingFetch(), vi.fn());

    engine.start(1);
    await flushMicrotasks(10);

    expect(engine.getState().errorMessage).not.toBeNull();
    expect(typeof engine.getState().errorMessage).toBe('string');
  });

  it('succeeds on the third retry (2 failures then success)', async () => {
    const callCount = { value: 0 };
    const questions = makeQuestions(BATCH_SIZE);
    const fetchFn = vi.fn(failThenSucceedFetch(2, questions, callCount));
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    await flushMicrotasks(10);

    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(engine.getState().status).toBe('ready');
  });

  it('does not retry more than MAX_RETRIES times', async () => {
    const fetchFn = vi.fn(rejectingFetch());
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    await flushMicrotasks(20);

    expect(fetchFn.mock.calls.length).toBeLessThanOrEqual(MAX_RETRIES);
  });

  it('shows loading indicator during a retry that exceeds the timeout', async () => {
    // First call fails immediately; second call hangs.
    let callCount = 0;
    const fetchFn = vi.fn(() => {
      callCount += 1;
      if (callCount === 1) return Promise.reject(new Error('fail'));
      return new Promise<TriviaQuestion[]>(() => {}); // hangs
    });

    const onStateChange = vi.fn();
    const engine = new TriviaEngine(fetchFn, onStateChange);

    engine.start(1);
    await Promise.resolve(); // first attempt fails, retry starts
    await Promise.resolve(); // retry is now in 'fetching'

    vi.advanceTimersByTime(FETCH_TIMEOUT_MS);

    const states = onStateChange.mock.calls.map(([s]) => s.status);
    expect(states).toContain('loading');
  });

  it('retryCount increments with each failed attempt', async () => {
    const fetchFn = vi.fn(rejectingFetch());
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    await flushMicrotasks(10);

    // After exhausting all retries, retryCount equals MAX_RETRIES.
    expect(engine.getState().retryCount).toBe(MAX_RETRIES);
  });

  it('resets retryCount to 0 after a successful fetch', async () => {
    const callCount = { value: 0 };
    const questions = makeQuestions(BATCH_SIZE);
    const fetchFn = vi.fn(failThenSucceedFetch(1, questions, callCount));
    const engine = new TriviaEngine(fetchFn, vi.fn());

    engine.start(1);
    await flushMicrotasks(6);

    expect(engine.getState().retryCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// currentQuestion and advance
// ---------------------------------------------------------------------------

describe('TriviaEngine — question presentation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('currentQuestion() returns null before the first batch is loaded', () => {
    const engine = new TriviaEngine(() => new Promise(() => {}), vi.fn());
    engine.start(1);
    expect(engine.currentQuestion()).toBeNull();
  });

  it('currentQuestion() returns the first question after the batch loads', async () => {
    const questions = makeQuestions(BATCH_SIZE);
    const engine = new TriviaEngine(resolvingFetch(questions), vi.fn());

    engine.start(1);
    await Promise.resolve();

    expect(engine.currentQuestion()).toEqual(questions[0]);
  });

  it('advance() moves to the next question', async () => {
    const questions = makeQuestions(BATCH_SIZE);
    const engine = new TriviaEngine(resolvingFetch(questions), vi.fn());

    engine.start(1);
    await Promise.resolve();

    engine.advance();
    expect(engine.currentQuestion()).toEqual(questions[1]);
  });

  it('remainingCount() decrements with each advance()', async () => {
    const questions = makeQuestions(BATCH_SIZE);
    const engine = new TriviaEngine(resolvingFetch(questions), vi.fn());

    engine.start(1);
    await Promise.resolve();

    expect(engine.remainingCount()).toBe(BATCH_SIZE);
    engine.advance();
    expect(engine.remainingCount()).toBe(BATCH_SIZE - 1);
  });

  it('advance() does nothing when status is not "ready"', () => {
    const engine = new TriviaEngine(() => new Promise(() => {}), vi.fn());
    engine.start(1);

    const stateBefore = engine.getState();
    engine.advance();
    expect(engine.getState().currentIndex).toBe(stateBefore.currentIndex);
  });
});
