/**
 * Navigator constraints module.
 *
 * Contains the pure constraint logic for the Navigator (camera controls).
 * Keeping this separate from the React/Three.js component makes it fully
 * testable without a DOM or WebGL context.
 *
 * Design spec (section 2.4):
 *   - Zoom:  min distance 5 units, max distance 200 units
 *   - Pan:   clamped to bounding box enclosing full periodic table + 20% margin
 *   - Orbit: full 360° horizontal, ±80° vertical (prevents flipping)
 *   - Smooth damping factor: 0.08
 *   - Camera updates debounced to 16 ms (≤1 frame at 60 fps)
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum camera distance (zoom in limit). */
export const ZOOM_MIN = 5;

/** Maximum camera distance (zoom out limit). */
export const ZOOM_MAX = 200;

/** Minimum vertical orbit angle in degrees (prevents flipping below). */
export const ORBIT_POLAR_MIN_DEG = -80;

/** Maximum vertical orbit angle in degrees (prevents flipping above). */
export const ORBIT_POLAR_MAX_DEG = 80;

/** Smooth damping factor for OrbitControls. */
export const DAMPING_FACTOR = 0.08;

/**
 * Debounce interval for camera update events in milliseconds.
 * Corresponds to ≤1 frame at 60 fps.
 */
export const CAMERA_UPDATE_DEBOUNCE_MS = 16;

// ---------------------------------------------------------------------------
// Periodic table bounding box (world-space)
// ---------------------------------------------------------------------------

/**
 * Standard periodic table layout:
 *   - 18 columns (groups 1–18), spacing 2.5 units each
 *   - 7 rows  (periods 1–7),   spacing 2.5 units each
 *   - Lanthanide/actinide rows offset 3 rows below period 7
 *
 * The bounding box is computed from the outermost element positions and then
 * expanded by 20% on each side.
 */
const CELL_SPACING = 2.5;
const TABLE_COLS = 18;
const TABLE_ROWS = 10; // 7 main + 3 gap/offset rows for lanthanides/actinides

const RAW_WIDTH = (TABLE_COLS - 1) * CELL_SPACING;
const RAW_HEIGHT = (TABLE_ROWS - 1) * CELL_SPACING;
const MARGIN_FACTOR = 0.2;

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Pan bounding box: full periodic table extent + 20% margin on each side. */
export const PAN_BOUNDS: BoundingBox2D = {
  minX: -(RAW_WIDTH / 2) * (1 + MARGIN_FACTOR),
  maxX: (RAW_WIDTH / 2) * (1 + MARGIN_FACTOR),
  minY: -(RAW_HEIGHT / 2) * (1 + MARGIN_FACTOR),
  maxY: (RAW_HEIGHT / 2) * (1 + MARGIN_FACTOR),
};

// ---------------------------------------------------------------------------
// Constraint functions
// ---------------------------------------------------------------------------

/**
 * Clamp a zoom distance to [ZOOM_MIN, ZOOM_MAX].
 *
 * @param distance - Requested camera distance.
 * @returns Clamped distance within valid zoom range.
 */
export function clampZoom(distance: number): number {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, distance));
}

/**
 * Clamp a pan target position to the allowed bounding box.
 *
 * @param x - Requested pan X position.
 * @param y - Requested pan Y position.
 * @param bounds - The bounding box to clamp within (defaults to PAN_BOUNDS).
 * @returns Clamped {x, y} position.
 */
export function clampPan(
  x: number,
  y: number,
  bounds: BoundingBox2D = PAN_BOUNDS,
): { x: number; y: number } {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
  };
}

/**
 * Clamp a vertical orbit angle (polar angle) to [ORBIT_POLAR_MIN_DEG, ORBIT_POLAR_MAX_DEG].
 *
 * @param angleDeg - Requested vertical orbit angle in degrees.
 * @returns Clamped angle in degrees.
 */
export function clampOrbitVertical(angleDeg: number): number {
  return Math.max(ORBIT_POLAR_MIN_DEG, Math.min(ORBIT_POLAR_MAX_DEG, angleDeg));
}

/**
 * Normalise a horizontal orbit angle to the range [0, 360).
 * Horizontal orbit is unconstrained (full 360°), so this is a pass-through
 * that wraps the value into the canonical range.
 *
 * @param angleDeg - Requested horizontal orbit angle in degrees.
 * @returns Angle wrapped to [0, 360).
 */
export function normaliseOrbitHorizontal(angleDeg: number): number {
  return ((angleDeg % 360) + 360) % 360;
}

// ---------------------------------------------------------------------------
// Debounce utility
// ---------------------------------------------------------------------------

/**
 * Create a debounced version of a callback that fires at most once per
 * `waitMs` milliseconds.  The returned function also exposes a `.flush()`
 * method to invoke the callback immediately and a `.cancel()` method to
 * discard any pending invocation.
 *
 * @param fn    - The function to debounce.
 * @param waitMs - Debounce window in milliseconds (default: CAMERA_UPDATE_DEBOUNCE_MS).
 */
export interface DebouncedFn<T extends unknown[]> {
  (...args: T): void;
  flush(): void;
  cancel(): void;
  /** The wait interval this debounce was created with (ms). */
  readonly waitMs: number;
}

export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  waitMs: number = CAMERA_UPDATE_DEBOUNCE_MS,
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: T | null = null;

  const debounced = (...args: T): void => {
    lastArgs = args;
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      if (lastArgs !== null) {
        fn(...lastArgs);
        lastArgs = null;
      }
    }, waitMs);
  };

  debounced.flush = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (lastArgs !== null) {
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  debounced.cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  Object.defineProperty(debounced, 'waitMs', { value: waitMs, writable: false });

  return debounced as DebouncedFn<T>;
}
