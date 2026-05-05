/**
 * Element position computation module.
 *
 * Computes world-space (x, y) grid positions for all 118 elements following
 * the standard 18-column × 7-row periodic table layout.  Lanthanides and
 * actinides (whose `group` field is null) are placed in two offset rows below
 * the main table.
 *
 * Design spec (section 2.2):
 *   "Element positioning follows the standard 18-column × 7-row periodic table
 *    layout, with lanthanides and actinides offset below.  Each element occupies
 *    a fixed grid cell.  World-space coordinates are computed from (group, period)
 *    at load time."
 *
 * Keeping this logic in a pure module (no React / Three.js imports) makes it
 * fully testable without a DOM or WebGL context.
 */

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

/** Distance between adjacent grid cells in world-space units. */
export const CELL_SPACING = 2.5;

/**
 * Number of empty rows between the bottom of the main table (period 7) and
 * the first lanthanide/actinide row.  A gap of 1 row is the conventional
 * periodic table presentation.
 */
export const LANTHANIDE_ROW_OFFSET = 1; // rows below period 7

/**
 * Column offset applied to lanthanide/actinide rows so they align under
 * groups 3–17 (columns 3–17, 0-indexed: 2–16).  In the standard layout the
 * f-block starts at column index 2 (group 3 position).
 */
export const F_BLOCK_COL_START = 2; // 0-indexed column

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal element fields required for position computation. */
export interface ElementPositionInput {
  atomicNumber: number;
  group: number | null; // 1–18, or null for lanthanides/actinides
  period: number;       // 1–7
  classification: string;
}

/** Computed grid position (column and row, 0-indexed). */
export interface GridPosition {
  col: number; // 0-indexed column (0 = group 1 / leftmost f-block position)
  row: number; // 0-indexed row    (0 = period 1)
}

/** Computed world-space position. */
export interface WorldPosition {
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return true when an element belongs to the lanthanide series.
 * Lanthanides: La (57) – Lu (71), classification "lanthanide".
 */
function isLanthanide(el: ElementPositionInput): boolean {
  return el.classification === 'lanthanide';
}

/**
 * Return true when an element belongs to the actinide series.
 * Actinides: Ac (89) – Lr (103), classification "actinide".
 */
function isActinide(el: ElementPositionInput): boolean {
  return el.classification === 'actinide';
}

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

/**
 * Compute the 0-indexed (col, row) grid position for a single element.
 *
 * Main-table elements (group 1–18):
 *   col = group - 1
 *   row = period - 1
 *
 * Lanthanides (La 57 – Lu 71):
 *   Placed in a row below the main table.
 *   row = 7 + LANTHANIDE_ROW_OFFSET          (i.e. row 8 with offset 1)
 *   col = F_BLOCK_COL_START + (atomicNumber - 57)
 *
 * Actinides (Ac 89 – Lr 103):
 *   Placed one row below the lanthanide row.
 *   row = 7 + LANTHANIDE_ROW_OFFSET + 1      (i.e. row 9 with offset 1)
 *   col = F_BLOCK_COL_START + (atomicNumber - 89)
 */
export function computeGridPosition(el: ElementPositionInput): GridPosition {
  if (isLanthanide(el)) {
    return {
      col: F_BLOCK_COL_START + (el.atomicNumber - 57),
      row: 7 + LANTHANIDE_ROW_OFFSET,
    };
  }

  if (isActinide(el)) {
    return {
      col: F_BLOCK_COL_START + (el.atomicNumber - 89),
      row: 7 + LANTHANIDE_ROW_OFFSET + 1,
    };
  }

  // Main-table element — group must be non-null here.
  if (el.group === null) {
    throw new Error(
      `Element ${el.atomicNumber} has null group but is not classified as lanthanide or actinide`,
    );
  }

  return {
    col: el.group - 1,
    row: el.period - 1,
  };
}

/**
 * Convert a grid position to world-space (x, y) coordinates.
 *
 * The origin (0, 0) is at the top-left corner of the grid.
 * x increases to the right (column direction).
 * y increases downward (row direction) — consistent with the Three.js scene
 * where the table is laid out in the XY plane with Y pointing down.
 */
export function gridToWorld(pos: GridPosition): WorldPosition {
  return {
    x: pos.col * CELL_SPACING,
    y: pos.row * CELL_SPACING,
  };
}

/**
 * Compute the world-space (x, y) position for a single element.
 * Convenience wrapper combining `computeGridPosition` and `gridToWorld`.
 */
export function computeElementWorldPosition(el: ElementPositionInput): WorldPosition {
  return gridToWorld(computeGridPosition(el));
}

/**
 * Compute grid positions for all elements in the provided array.
 *
 * @returns A Map from atomicNumber → GridPosition.
 */
export function computeAllGridPositions(
  elements: ElementPositionInput[],
): Map<number, GridPosition> {
  const result = new Map<number, GridPosition>();
  for (const el of elements) {
    result.set(el.atomicNumber, computeGridPosition(el));
  }
  return result;
}

/**
 * Compute world-space positions for all elements in the provided array.
 *
 * @returns A Map from atomicNumber → WorldPosition.
 */
export function computeAllWorldPositions(
  elements: ElementPositionInput[],
): Map<number, WorldPosition> {
  const result = new Map<number, WorldPosition>();
  for (const el of elements) {
    result.set(el.atomicNumber, computeElementWorldPosition(el));
  }
  return result;
}
