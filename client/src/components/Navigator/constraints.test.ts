/**
 * Unit tests for Navigator constraints.
 *
 * Validates: Requirements 1.3
 *   - Zoom, pan, and orbit values are clamped to their defined bounds.
 *   - Camera update is debounced to ≤16 ms.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  // Constants
  ZOOM_MIN,
  ZOOM_MAX,
  ORBIT_POLAR_MIN_DEG,
  ORBIT_POLAR_MAX_DEG,
  CAMERA_UPDATE_DEBOUNCE_MS,
  PAN_BOUNDS,
  // Functions
  clampZoom,
  clampPan,
  clampOrbitVertical,
  normaliseOrbitHorizontal,
  debounce,
} from './constraints';

// ---------------------------------------------------------------------------
// Zoom constraints
// ---------------------------------------------------------------------------

describe('clampZoom', () => {
  it('returns the value unchanged when within [ZOOM_MIN, ZOOM_MAX]', () => {
    expect(clampZoom(5)).toBe(5);
    expect(clampZoom(100)).toBe(100);
    expect(clampZoom(200)).toBe(200);
  });

  it('clamps to ZOOM_MIN when the requested distance is below the minimum', () => {
    expect(clampZoom(0)).toBe(ZOOM_MIN);
    expect(clampZoom(-10)).toBe(ZOOM_MIN);
    expect(clampZoom(ZOOM_MIN - 0.001)).toBe(ZOOM_MIN);
  });

  it('clamps to ZOOM_MAX when the requested distance exceeds the maximum', () => {
    expect(clampZoom(201)).toBe(ZOOM_MAX);
    expect(clampZoom(10_000)).toBe(ZOOM_MAX);
    expect(clampZoom(ZOOM_MAX + 0.001)).toBe(ZOOM_MAX);
  });

  it('returns ZOOM_MIN for exactly ZOOM_MIN', () => {
    expect(clampZoom(ZOOM_MIN)).toBe(ZOOM_MIN);
  });

  it('returns ZOOM_MAX for exactly ZOOM_MAX', () => {
    expect(clampZoom(ZOOM_MAX)).toBe(ZOOM_MAX);
  });

  it('ZOOM_MIN is 5 and ZOOM_MAX is 200 per design spec', () => {
    expect(ZOOM_MIN).toBe(5);
    expect(ZOOM_MAX).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Pan constraints
// ---------------------------------------------------------------------------

describe('clampPan', () => {
  it('returns the position unchanged when within the bounding box', () => {
    const result = clampPan(0, 0);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('clamps x to minX when x is below the left boundary', () => {
    const result = clampPan(PAN_BOUNDS.minX - 100, 0);
    expect(result.x).toBe(PAN_BOUNDS.minX);
  });

  it('clamps x to maxX when x exceeds the right boundary', () => {
    const result = clampPan(PAN_BOUNDS.maxX + 100, 0);
    expect(result.x).toBe(PAN_BOUNDS.maxX);
  });

  it('clamps y to minY when y is below the bottom boundary', () => {
    const result = clampPan(0, PAN_BOUNDS.minY - 100);
    expect(result.y).toBe(PAN_BOUNDS.minY);
  });

  it('clamps y to maxY when y exceeds the top boundary', () => {
    const result = clampPan(0, PAN_BOUNDS.maxY + 100);
    expect(result.y).toBe(PAN_BOUNDS.maxY);
  });

  it('clamps both axes simultaneously when both are out of bounds', () => {
    const result = clampPan(PAN_BOUNDS.maxX + 50, PAN_BOUNDS.maxY + 50);
    expect(result.x).toBe(PAN_BOUNDS.maxX);
    expect(result.y).toBe(PAN_BOUNDS.maxY);
  });

  it('accepts a custom bounding box', () => {
    const customBounds = { minX: -10, maxX: 10, minY: -5, maxY: 5 };
    expect(clampPan(20, 0, customBounds).x).toBe(10);
    expect(clampPan(-20, 0, customBounds).x).toBe(-10);
    expect(clampPan(0, 10, customBounds).y).toBe(5);
    expect(clampPan(0, -10, customBounds).y).toBe(-5);
  });

  it('PAN_BOUNDS includes a 20% margin beyond the raw table extent', () => {
    // The raw table is 17 * 2.5 = 42.5 wide; with 20% margin each side the
    // half-width becomes 42.5/2 * 1.2 = 25.5.
    expect(PAN_BOUNDS.maxX).toBeCloseTo(25.5, 5);
    expect(PAN_BOUNDS.minX).toBeCloseTo(-25.5, 5);
  });
});

// ---------------------------------------------------------------------------
// Orbit constraints — vertical (polar)
// ---------------------------------------------------------------------------

describe('clampOrbitVertical', () => {
  it('returns the angle unchanged when within [ORBIT_POLAR_MIN_DEG, ORBIT_POLAR_MAX_DEG]', () => {
    expect(clampOrbitVertical(0)).toBe(0);
    expect(clampOrbitVertical(45)).toBe(45);
    expect(clampOrbitVertical(-45)).toBe(-45);
  });

  it('clamps to ORBIT_POLAR_MIN_DEG when the angle is below the minimum', () => {
    expect(clampOrbitVertical(-81)).toBe(ORBIT_POLAR_MIN_DEG);
    expect(clampOrbitVertical(-180)).toBe(ORBIT_POLAR_MIN_DEG);
    expect(clampOrbitVertical(ORBIT_POLAR_MIN_DEG - 0.001)).toBe(ORBIT_POLAR_MIN_DEG);
  });

  it('clamps to ORBIT_POLAR_MAX_DEG when the angle exceeds the maximum', () => {
    expect(clampOrbitVertical(81)).toBe(ORBIT_POLAR_MAX_DEG);
    expect(clampOrbitVertical(180)).toBe(ORBIT_POLAR_MAX_DEG);
    expect(clampOrbitVertical(ORBIT_POLAR_MAX_DEG + 0.001)).toBe(ORBIT_POLAR_MAX_DEG);
  });

  it('returns ORBIT_POLAR_MIN_DEG for exactly ORBIT_POLAR_MIN_DEG', () => {
    expect(clampOrbitVertical(ORBIT_POLAR_MIN_DEG)).toBe(ORBIT_POLAR_MIN_DEG);
  });

  it('returns ORBIT_POLAR_MAX_DEG for exactly ORBIT_POLAR_MAX_DEG', () => {
    expect(clampOrbitVertical(ORBIT_POLAR_MAX_DEG)).toBe(ORBIT_POLAR_MAX_DEG);
  });

  it('vertical orbit bounds are ±80° per design spec', () => {
    expect(ORBIT_POLAR_MIN_DEG).toBe(-80);
    expect(ORBIT_POLAR_MAX_DEG).toBe(80);
  });
});

// ---------------------------------------------------------------------------
// Orbit constraints — horizontal (azimuth)
// ---------------------------------------------------------------------------

describe('normaliseOrbitHorizontal', () => {
  it('returns values in [0, 360) for typical inputs', () => {
    expect(normaliseOrbitHorizontal(0)).toBe(0);
    expect(normaliseOrbitHorizontal(180)).toBe(180);
    expect(normaliseOrbitHorizontal(359)).toBe(359);
  });

  it('wraps 360 to 0', () => {
    expect(normaliseOrbitHorizontal(360)).toBe(0);
  });

  it('wraps negative angles into [0, 360)', () => {
    expect(normaliseOrbitHorizontal(-90)).toBe(270);
    expect(normaliseOrbitHorizontal(-360)).toBe(0);
    expect(normaliseOrbitHorizontal(-1)).toBe(359);
  });

  it('wraps angles greater than 360 into [0, 360)', () => {
    expect(normaliseOrbitHorizontal(450)).toBe(90);
    expect(normaliseOrbitHorizontal(720)).toBe(0);
  });

  it('allows full 360° horizontal orbit (no clamping)', () => {
    // All values in [0, 360) should pass through unchanged.
    for (let deg = 0; deg < 360; deg += 15) {
      expect(normaliseOrbitHorizontal(deg)).toBe(deg);
    }
  });
});

// ---------------------------------------------------------------------------
// Debounce — camera update timing
// ---------------------------------------------------------------------------

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not invoke the callback immediately', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 16);
    debounced();
    expect(fn).not.toHaveBeenCalled();
  });

  it('invokes the callback after the wait interval', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 16);
    debounced();
    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer when called again within the wait window', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 16);

    debounced('first');
    vi.advanceTimersByTime(10);  // still within window
    debounced('second');         // resets timer
    vi.advanceTimersByTime(10);  // 10 ms after second call — still within window
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(6);   // now 16 ms after second call
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('invokes the callback only once for multiple rapid calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 16);

    for (let i = 0; i < 10; i++) {
      debounced(i);
    }
    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(9); // last call wins
  });

  it('uses CAMERA_UPDATE_DEBOUNCE_MS (16 ms) as the default wait interval', () => {
    const fn = vi.fn();
    const debounced = debounce(fn); // no explicit waitMs
    expect(debounced.waitMs).toBe(CAMERA_UPDATE_DEBOUNCE_MS);
    expect(CAMERA_UPDATE_DEBOUNCE_MS).toBe(16);
  });

  it('does not fire before 16 ms have elapsed (≤1 frame at 60 fps)', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, CAMERA_UPDATE_DEBOUNCE_MS);
    debounced();
    vi.advanceTimersByTime(15); // one millisecond short
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);  // exactly 16 ms
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('flush() invokes the pending callback immediately', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 16);
    debounced('pending');
    debounced.flush();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('pending');
  });

  it('flush() does nothing when there is no pending call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 16);
    debounced.flush();
    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel() discards the pending callback', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 16);
    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(16);
    expect(fn).not.toHaveBeenCalled();
  });

  it('allows subsequent calls after cancel()', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 16);
    debounced('first');
    debounced.cancel();
    debounced('second');
    vi.advanceTimersByTime(16);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('exposes the configured waitMs value', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 32);
    expect(debounced.waitMs).toBe(32);
  });
});
