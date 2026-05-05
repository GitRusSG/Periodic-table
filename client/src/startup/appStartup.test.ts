/**
 * Integration tests for the application startup flow.
 *
 * Validates: Requirements 1.5, 6.4
 *   1.5 — THE Renderer SHALL load and display the full periodic table
 *          environment within 10 seconds on a standard broadband connection.
 *   6.4 — WHEN a user logs in, THE Progression_Service SHALL restore all
 *          saved progress, unlocks, and stats from the user's Account within
 *          5 seconds.
 *
 * Test scenarios:
 *   1. A valid session cookie triggers progress restoration (fetchProgress is
 *      called and the restored state is returned).
 *   2. An absent session cookie initializes guest state without error
 *      (fetchProgress is NOT called).
 *   3. Startup completes within a reasonable time bound (5 seconds for the
 *      authenticated path, per Requirement 6.4).
 *   4. Errors from loadElements and fetchProgress propagate to the caller.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  runStartupSequence,
  createGuestState,
  type ElementRecord,
  type RestoredProgressionState,
  type StartupDeps,
} from './appStartup';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Minimal element records used as the loadElements return value. */
const MOCK_ELEMENTS: ElementRecord[] = [
  { atomicNumber: 1, symbol: 'H', name: 'Hydrogen' },
  { atomicNumber: 2, symbol: 'He', name: 'Helium' },
];

/** A sample restored progression state returned by fetchProgress. */
const MOCK_RESTORED_STATE: RestoredProgressionState = {
  xpByDifficulty: { 1: 1200, 2: 300, 3: 0, 4: 0, 5: 0 },
  unlockedDifficulties: [1, 2],
  masteredElements: [1, 6, 8],
  nameTags: [{ atomicNumber: 1, name: 'Hydrogen Tag' }],
  equippedNameTag: 1,
  inventory: [],
};

/** A valid session token string. */
const VALID_TOKEN = 'session-token-abc123';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a StartupDeps object with sensible defaults.
 * Individual deps can be overridden per test.
 */
function makeDeps(overrides: Partial<StartupDeps> = {}): StartupDeps {
  return {
    loadElements: vi.fn().mockResolvedValue(MOCK_ELEMENTS),
    checkSession: vi.fn().mockReturnValue(null),
    fetchProgress: vi.fn().mockResolvedValue(MOCK_RESTORED_STATE),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createGuestState
// ---------------------------------------------------------------------------

describe('createGuestState', () => {
  it('returns a state marked as guest', () => {
    const state = createGuestState();
    expect(state.isGuest).toBe(true);
  });

  it('starts with 0 XP across all difficulty levels', () => {
    const state = createGuestState();
    expect(state.xpByDifficulty).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it('has only difficulty level 1 unlocked', () => {
    const state = createGuestState();
    expect(state.unlockedDifficulties).toEqual([1]);
  });

  it('has empty mastery, name tags, and inventory', () => {
    const state = createGuestState();
    expect(state.masteredElements).toHaveLength(0);
    expect(state.nameTags).toHaveLength(0);
    expect(state.inventory).toHaveLength(0);
    expect(state.equippedNameTag).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// runStartupSequence — authenticated path (valid session cookie)
// ---------------------------------------------------------------------------

describe('runStartupSequence — valid session cookie', () => {
  let deps: StartupDeps;

  beforeEach(() => {
    deps = makeDeps({
      checkSession: vi.fn().mockReturnValue(VALID_TOKEN),
      fetchProgress: vi.fn().mockResolvedValue(MOCK_RESTORED_STATE),
    });
  });

  it('calls loadElements to load the element data', async () => {
    await runStartupSequence(deps);
    expect(deps.loadElements).toHaveBeenCalledOnce();
  });

  it('calls checkSession to detect the existing session', async () => {
    await runStartupSequence(deps);
    expect(deps.checkSession).toHaveBeenCalledOnce();
  });

  it('calls fetchProgress with the session token', async () => {
    await runStartupSequence(deps);
    expect(deps.fetchProgress).toHaveBeenCalledOnce();
    expect(deps.fetchProgress).toHaveBeenCalledWith(VALID_TOKEN);
  });

  it('returns the elements loaded from loadElements', async () => {
    const result = await runStartupSequence(deps);
    expect(result.elements).toEqual(MOCK_ELEMENTS);
  });

  it('returns the progression state from fetchProgress', async () => {
    const result = await runStartupSequence(deps);
    expect(result.progressionState).toEqual(MOCK_RESTORED_STATE);
  });

  it('marks the result as authenticated', async () => {
    const result = await runStartupSequence(deps);
    expect(result.isAuthenticated).toBe(true);
  });

  it('does NOT return a guest state when a session is present', async () => {
    const result = await runStartupSequence(deps);
    expect((result.progressionState as { isGuest?: boolean }).isGuest).toBeUndefined();
  });

  it('restores XP from the server response', async () => {
    const result = await runStartupSequence(deps);
    const state = result.progressionState as RestoredProgressionState;
    expect(state.xpByDifficulty[1]).toBe(1200);
    expect(state.xpByDifficulty[2]).toBe(300);
  });

  it('restores unlocked difficulties from the server response', async () => {
    const result = await runStartupSequence(deps);
    const state = result.progressionState as RestoredProgressionState;
    expect(state.unlockedDifficulties).toContain(1);
    expect(state.unlockedDifficulties).toContain(2);
  });

  it('restores mastered elements from the server response', async () => {
    const result = await runStartupSequence(deps);
    const state = result.progressionState as RestoredProgressionState;
    expect(state.masteredElements).toEqual([1, 6, 8]);
  });

  it('completes within 5 seconds (Requirement 6.4)', async () => {
    // fetchProgress resolves immediately in tests; we verify the promise
    // settles within the 5-second SLA using a real timer.
    const start = Date.now();
    await runStartupSequence(deps);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });
});

// ---------------------------------------------------------------------------
// runStartupSequence — unauthenticated path (no session cookie)
// ---------------------------------------------------------------------------

describe('runStartupSequence — absent session cookie', () => {
  let deps: StartupDeps;

  beforeEach(() => {
    deps = makeDeps({
      checkSession: vi.fn().mockReturnValue(null),
    });
  });

  it('calls loadElements to load the element data', async () => {
    await runStartupSequence(deps);
    expect(deps.loadElements).toHaveBeenCalledOnce();
  });

  it('calls checkSession to check for a session', async () => {
    await runStartupSequence(deps);
    expect(deps.checkSession).toHaveBeenCalledOnce();
  });

  it('does NOT call fetchProgress when no session is present', async () => {
    await runStartupSequence(deps);
    expect(deps.fetchProgress).not.toHaveBeenCalled();
  });

  it('returns the elements loaded from loadElements', async () => {
    const result = await runStartupSequence(deps);
    expect(result.elements).toEqual(MOCK_ELEMENTS);
  });

  it('returns a guest progression state', async () => {
    const result = await runStartupSequence(deps);
    const state = result.progressionState as { isGuest?: boolean };
    expect(state.isGuest).toBe(true);
  });

  it('marks the result as not authenticated', async () => {
    const result = await runStartupSequence(deps);
    expect(result.isAuthenticated).toBe(false);
  });

  it('initializes guest state with 0 XP across all difficulty levels', async () => {
    const result = await runStartupSequence(deps);
    const state = result.progressionState as ReturnType<typeof createGuestState>;
    expect(state.xpByDifficulty).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it('initializes guest state with only difficulty level 1 unlocked', async () => {
    const result = await runStartupSequence(deps);
    const state = result.progressionState as ReturnType<typeof createGuestState>;
    expect(state.unlockedDifficulties).toEqual([1]);
  });

  it('initializes guest state with empty mastery, name tags, and inventory', async () => {
    const result = await runStartupSequence(deps);
    const state = result.progressionState as ReturnType<typeof createGuestState>;
    expect(state.masteredElements).toHaveLength(0);
    expect(state.nameTags).toHaveLength(0);
    expect(state.inventory).toHaveLength(0);
    expect(state.equippedNameTag).toBeNull();
  });

  it('completes without throwing any error', async () => {
    await expect(runStartupSequence(deps)).resolves.toBeDefined();
  });

  it('completes within 10 seconds (Requirement 1.5)', async () => {
    const start = Date.now();
    await runStartupSequence(deps);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });
});

// ---------------------------------------------------------------------------
// runStartupSequence — error propagation
// ---------------------------------------------------------------------------

describe('runStartupSequence — error propagation', () => {
  it('propagates errors from loadElements', async () => {
    const loadError = new Error('Failed to load elements.json');
    const deps = makeDeps({
      loadElements: vi.fn().mockRejectedValue(loadError),
    });
    await expect(runStartupSequence(deps)).rejects.toThrow('Failed to load elements.json');
  });

  it('propagates errors from fetchProgress when session is valid', async () => {
    const fetchError = new Error('GET /api/progress returned 500');
    const deps = makeDeps({
      checkSession: vi.fn().mockReturnValue(VALID_TOKEN),
      fetchProgress: vi.fn().mockRejectedValue(fetchError),
    });
    await expect(runStartupSequence(deps)).rejects.toThrow('GET /api/progress returned 500');
  });

  it('does NOT call fetchProgress when loadElements fails', async () => {
    const fetchProgress = vi.fn();
    const deps = makeDeps({
      loadElements: vi.fn().mockRejectedValue(new Error('network error')),
      checkSession: vi.fn().mockReturnValue(VALID_TOKEN),
      fetchProgress,
    });
    await expect(runStartupSequence(deps)).rejects.toThrow();
    expect(fetchProgress).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// runStartupSequence — ordering guarantees
// ---------------------------------------------------------------------------

describe('runStartupSequence — ordering guarantees', () => {
  it('loads elements before checking the session', async () => {
    const callOrder: string[] = [];
    const deps: StartupDeps = {
      loadElements: vi.fn().mockImplementation(async () => {
        callOrder.push('loadElements');
        return MOCK_ELEMENTS;
      }),
      checkSession: vi.fn().mockImplementation(() => {
        callOrder.push('checkSession');
        return null;
      }),
      fetchProgress: vi.fn(),
    };

    await runStartupSequence(deps);

    expect(callOrder.indexOf('loadElements')).toBeLessThan(
      callOrder.indexOf('checkSession'),
    );
  });

  it('checks session before calling fetchProgress', async () => {
    const callOrder: string[] = [];
    const deps: StartupDeps = {
      loadElements: vi.fn().mockImplementation(async () => {
        callOrder.push('loadElements');
        return MOCK_ELEMENTS;
      }),
      checkSession: vi.fn().mockImplementation(() => {
        callOrder.push('checkSession');
        return VALID_TOKEN;
      }),
      fetchProgress: vi.fn().mockImplementation(async () => {
        callOrder.push('fetchProgress');
        return MOCK_RESTORED_STATE;
      }),
    };

    await runStartupSequence(deps);

    expect(callOrder.indexOf('checkSession')).toBeLessThan(
      callOrder.indexOf('fetchProgress'),
    );
  });
});
