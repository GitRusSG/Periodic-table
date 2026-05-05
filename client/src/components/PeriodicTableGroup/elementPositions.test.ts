/**
 * Unit tests for element position computation.
 *
 * Validates: Requirements 1.1
 *   - All 118 elements receive unique (x, y) grid positions.
 *   - Lanthanide/actinide rows are offset below the main table.
 */

import { describe, it, expect } from 'vitest';
import {
  computeGridPosition,
  computeAllGridPositions,
  computeAllWorldPositions,
  gridToWorld,
  CELL_SPACING,
  LANTHANIDE_ROW_OFFSET,
  F_BLOCK_COL_START,
  type ElementPositionInput,
} from './elementPositions';

// ---------------------------------------------------------------------------
// Minimal element fixture — all 118 elements with the fields needed for
// position computation (atomicNumber, group, period, classification).
//
// Standard periodic table layout:
//   - group 1–18, period 1–7 for main-table elements
//   - group null, classification "lanthanide" for La (57) – Lu (71)
//   - group null, classification "actinide"   for Ac (89) – Lr (103)
// ---------------------------------------------------------------------------

type MinimalElement = ElementPositionInput;

/** Build the full 118-element fixture programmatically. */
function buildAllElements(): MinimalElement[] {
  const elements: MinimalElement[] = [];

  // Helper to push a main-table element.
  const add = (
    atomicNumber: number,
    group: number,
    period: number,
    classification: string,
  ) => elements.push({ atomicNumber, group, period, classification });

  // Period 1 (2 elements)
  add(1,  1, 1, 'nonmetal');   // H
  add(2, 18, 1, 'noble_gas');  // He

  // Period 2 (8 elements)
  add(3,  1, 2, 'alkali_metal');
  add(4,  2, 2, 'alkaline_earth_metal');
  add(5, 13, 2, 'metalloid');
  add(6, 14, 2, 'nonmetal');
  add(7, 15, 2, 'nonmetal');
  add(8, 16, 2, 'nonmetal');
  add(9, 17, 2, 'halogen');
  add(10, 18, 2, 'noble_gas');

  // Period 3 (8 elements)
  add(11,  1, 3, 'alkali_metal');
  add(12,  2, 3, 'alkaline_earth_metal');
  add(13, 13, 3, 'post_transition_metal');
  add(14, 14, 3, 'metalloid');
  add(15, 15, 3, 'nonmetal');
  add(16, 16, 3, 'nonmetal');
  add(17, 17, 3, 'halogen');
  add(18, 18, 3, 'noble_gas');

  // Period 4 (18 elements)
  add(19,  1, 4, 'alkali_metal');
  add(20,  2, 4, 'alkaline_earth_metal');
  add(21,  3, 4, 'transition_metal');
  add(22,  4, 4, 'transition_metal');
  add(23,  5, 4, 'transition_metal');
  add(24,  6, 4, 'transition_metal');
  add(25,  7, 4, 'transition_metal');
  add(26,  8, 4, 'transition_metal');
  add(27,  9, 4, 'transition_metal');
  add(28, 10, 4, 'transition_metal');
  add(29, 11, 4, 'transition_metal');
  add(30, 12, 4, 'transition_metal');
  add(31, 13, 4, 'post_transition_metal');
  add(32, 14, 4, 'metalloid');
  add(33, 15, 4, 'metalloid');
  add(34, 16, 4, 'nonmetal');
  add(35, 17, 4, 'halogen');
  add(36, 18, 4, 'noble_gas');

  // Period 5 (18 elements)
  add(37,  1, 5, 'alkali_metal');
  add(38,  2, 5, 'alkaline_earth_metal');
  add(39,  3, 5, 'transition_metal');
  add(40,  4, 5, 'transition_metal');
  add(41,  5, 5, 'transition_metal');
  add(42,  6, 5, 'transition_metal');
  add(43,  7, 5, 'transition_metal');
  add(44,  8, 5, 'transition_metal');
  add(45,  9, 5, 'transition_metal');
  add(46, 10, 5, 'transition_metal');
  add(47, 11, 5, 'transition_metal');
  add(48, 12, 5, 'transition_metal');
  add(49, 13, 5, 'post_transition_metal');
  add(50, 14, 5, 'post_transition_metal');
  add(51, 15, 5, 'metalloid');
  add(52, 16, 5, 'metalloid');
  add(53, 17, 5, 'halogen');
  add(54, 18, 5, 'noble_gas');

  // Period 6 — main-table elements (La placeholder at group 3 is replaced by
  // the lanthanide series; Ce–Lu are lanthanides with null group).
  // La (57) is the first lanthanide; Ba (56) is group 2, Hf (72) is group 4.
  add(55,  1, 6, 'alkali_metal');   // Cs
  add(56,  2, 6, 'alkaline_earth_metal'); // Ba
  // La (57) – Lu (71): lanthanides (group null)
  for (let z = 57; z <= 71; z++) {
    elements.push({ atomicNumber: z, group: null, period: 6, classification: 'lanthanide' });
  }
  add(72,  4, 6, 'transition_metal');  // Hf
  add(73,  5, 6, 'transition_metal');  // Ta
  add(74,  6, 6, 'transition_metal');  // W
  add(75,  7, 6, 'transition_metal');  // Re
  add(76,  8, 6, 'transition_metal');  // Os
  add(77,  9, 6, 'transition_metal');  // Ir
  add(78, 10, 6, 'transition_metal');  // Pt
  add(79, 11, 6, 'transition_metal');  // Au
  add(80, 12, 6, 'transition_metal');  // Hg
  add(81, 13, 6, 'post_transition_metal'); // Tl
  add(82, 14, 6, 'post_transition_metal'); // Pb
  add(83, 15, 6, 'post_transition_metal'); // Bi
  add(84, 16, 6, 'post_transition_metal'); // Po
  add(85, 17, 6, 'halogen');           // At
  add(86, 18, 6, 'noble_gas');         // Rn

  // Period 7 — main-table elements
  add(87,  1, 7, 'alkali_metal');      // Fr
  add(88,  2, 7, 'alkaline_earth_metal'); // Ra
  // Ac (89) – Lr (103): actinides (group null)
  for (let z = 89; z <= 103; z++) {
    elements.push({ atomicNumber: z, group: null, period: 7, classification: 'actinide' });
  }
  add(104,  4, 7, 'transition_metal'); // Rf
  add(105,  5, 7, 'transition_metal'); // Db
  add(106,  6, 7, 'transition_metal'); // Sg
  add(107,  7, 7, 'transition_metal'); // Bh
  add(108,  8, 7, 'transition_metal'); // Hs
  add(109,  9, 7, 'transition_metal'); // Mt
  add(110, 10, 7, 'transition_metal'); // Ds
  add(111, 11, 7, 'transition_metal'); // Rg
  add(112, 12, 7, 'transition_metal'); // Cn
  add(113, 13, 7, 'post_transition_metal'); // Nh
  add(114, 14, 7, 'post_transition_metal'); // Fl
  add(115, 15, 7, 'post_transition_metal'); // Mc
  add(116, 16, 7, 'post_transition_metal'); // Lv
  add(117, 17, 7, 'halogen');          // Ts
  add(118, 18, 7, 'noble_gas');        // Og

  return elements;
}

const ALL_ELEMENTS: MinimalElement[] = buildAllElements();

// ---------------------------------------------------------------------------
// Sanity check on the fixture itself
// ---------------------------------------------------------------------------

describe('element fixture', () => {
  it('contains exactly 118 elements', () => {
    expect(ALL_ELEMENTS).toHaveLength(118);
  });

  it('has no duplicate atomic numbers', () => {
    const numbers = ALL_ELEMENTS.map((e) => e.atomicNumber);
    const unique = new Set(numbers);
    expect(unique.size).toBe(118);
  });

  it('covers atomic numbers 1 through 118 without gaps', () => {
    const numbers = ALL_ELEMENTS.map((e) => e.atomicNumber).sort((a, b) => a - b);
    for (let i = 0; i < 118; i++) {
      expect(numbers[i]).toBe(i + 1);
    }
  });
});

// ---------------------------------------------------------------------------
// computeGridPosition — individual element tests
// ---------------------------------------------------------------------------

describe('computeGridPosition', () => {
  it('places Hydrogen (Z=1, group 1, period 1) at col 0, row 0', () => {
    const pos = computeGridPosition({ atomicNumber: 1, group: 1, period: 1, classification: 'nonmetal' });
    expect(pos.col).toBe(0);
    expect(pos.row).toBe(0);
  });

  it('places Helium (Z=2, group 18, period 1) at col 17, row 0', () => {
    const pos = computeGridPosition({ atomicNumber: 2, group: 18, period: 1, classification: 'noble_gas' });
    expect(pos.col).toBe(17);
    expect(pos.row).toBe(0);
  });

  it('places Oganesson (Z=118, group 18, period 7) at col 17, row 6', () => {
    const pos = computeGridPosition({ atomicNumber: 118, group: 18, period: 7, classification: 'noble_gas' });
    expect(pos.col).toBe(17);
    expect(pos.row).toBe(6);
  });

  it('places Lanthanum (Z=57, lanthanide) at the first f-block column in the lanthanide row', () => {
    const pos = computeGridPosition({ atomicNumber: 57, group: null, period: 6, classification: 'lanthanide' });
    expect(pos.col).toBe(F_BLOCK_COL_START);
    expect(pos.row).toBe(7 + LANTHANIDE_ROW_OFFSET);
  });

  it('places Lutetium (Z=71, lanthanide) at f-block column 16 in the lanthanide row', () => {
    const pos = computeGridPosition({ atomicNumber: 71, group: null, period: 6, classification: 'lanthanide' });
    expect(pos.col).toBe(F_BLOCK_COL_START + 14); // 71 - 57 = 14
    expect(pos.row).toBe(7 + LANTHANIDE_ROW_OFFSET);
  });

  it('places Actinium (Z=89, actinide) at the first f-block column in the actinide row', () => {
    const pos = computeGridPosition({ atomicNumber: 89, group: null, period: 7, classification: 'actinide' });
    expect(pos.col).toBe(F_BLOCK_COL_START);
    expect(pos.row).toBe(7 + LANTHANIDE_ROW_OFFSET + 1);
  });

  it('places Lawrencium (Z=103, actinide) at f-block column 16 in the actinide row', () => {
    const pos = computeGridPosition({ atomicNumber: 103, group: null, period: 7, classification: 'actinide' });
    expect(pos.col).toBe(F_BLOCK_COL_START + 14); // 103 - 89 = 14
    expect(pos.row).toBe(7 + LANTHANIDE_ROW_OFFSET + 1);
  });

  it('throws when group is null but classification is not lanthanide or actinide', () => {
    expect(() =>
      computeGridPosition({ atomicNumber: 99, group: null, period: 5, classification: 'transition_metal' }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// gridToWorld — coordinate conversion
// ---------------------------------------------------------------------------

describe('gridToWorld', () => {
  it('converts (col=0, row=0) to world (x=0, y=0)', () => {
    const w = gridToWorld({ col: 0, row: 0 });
    expect(w.x).toBe(0);
    expect(w.y).toBe(0);
  });

  it('converts (col=1, row=0) to world (x=CELL_SPACING, y=0)', () => {
    const w = gridToWorld({ col: 1, row: 0 });
    expect(w.x).toBe(CELL_SPACING);
    expect(w.y).toBe(0);
  });

  it('converts (col=0, row=1) to world (x=0, y=CELL_SPACING)', () => {
    const w = gridToWorld({ col: 0, row: 1 });
    expect(w.x).toBe(0);
    expect(w.y).toBe(CELL_SPACING);
  });

  it('converts (col=17, row=6) to world (x=42.5, y=15)', () => {
    const w = gridToWorld({ col: 17, row: 6 });
    expect(w.x).toBeCloseTo(17 * CELL_SPACING);
    expect(w.y).toBeCloseTo(6 * CELL_SPACING);
  });
});

// ---------------------------------------------------------------------------
// All 118 elements — unique positions
// ---------------------------------------------------------------------------

describe('computeAllGridPositions — all 118 elements', () => {
  it('returns a position for every element (map size = 118)', () => {
    const positions = computeAllGridPositions(ALL_ELEMENTS);
    expect(positions.size).toBe(118);
  });

  it('assigns unique (col, row) pairs to all 118 elements', () => {
    const positions = computeAllGridPositions(ALL_ELEMENTS);
    const keys = new Set<string>();
    for (const [, pos] of positions) {
      const key = `${pos.col},${pos.row}`;
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
    expect(keys.size).toBe(118);
  });
});

describe('computeAllWorldPositions — all 118 elements', () => {
  it('returns a world position for every element (map size = 118)', () => {
    const positions = computeAllWorldPositions(ALL_ELEMENTS);
    expect(positions.size).toBe(118);
  });

  it('assigns unique (x, y) world positions to all 118 elements', () => {
    const positions = computeAllWorldPositions(ALL_ELEMENTS);
    const keys = new Set<string>();
    for (const [, pos] of positions) {
      const key = `${pos.x},${pos.y}`;
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
    expect(keys.size).toBe(118);
  });
});

// ---------------------------------------------------------------------------
// Lanthanide / actinide row offset
// ---------------------------------------------------------------------------

describe('lanthanide and actinide row offset', () => {
  it('lanthanide row is below the last main-table row (period 7 = row 6)', () => {
    const lanthanideRow = 7 + LANTHANIDE_ROW_OFFSET;
    expect(lanthanideRow).toBeGreaterThan(6); // row 6 = period 7
  });

  it('actinide row is one row below the lanthanide row', () => {
    const lanthanideRow = 7 + LANTHANIDE_ROW_OFFSET;
    const actinideRow = lanthanideRow + 1;
    // Verify via actual computed positions
    const la = computeGridPosition({ atomicNumber: 57, group: null, period: 6, classification: 'lanthanide' });
    const ac = computeGridPosition({ atomicNumber: 89, group: null, period: 7, classification: 'actinide' });
    expect(ac.row).toBe(la.row + 1);
    expect(ac.row).toBe(actinideRow);
  });

  it('all lanthanides (Z=57–71) are in the same row', () => {
    const lanthanides = ALL_ELEMENTS.filter((e) => e.classification === 'lanthanide');
    expect(lanthanides).toHaveLength(15);
    const rows = lanthanides.map((e) => computeGridPosition(e).row);
    const uniqueRows = new Set(rows);
    expect(uniqueRows.size).toBe(1);
  });

  it('all actinides (Z=89–103) are in the same row', () => {
    const actinides = ALL_ELEMENTS.filter((e) => e.classification === 'actinide');
    expect(actinides).toHaveLength(15);
    const rows = actinides.map((e) => computeGridPosition(e).row);
    const uniqueRows = new Set(rows);
    expect(uniqueRows.size).toBe(1);
  });

  it('lanthanide row is strictly greater than any main-table row', () => {
    const mainTableElements = ALL_ELEMENTS.filter(
      (e) => e.classification !== 'lanthanide' && e.classification !== 'actinide',
    );
    const maxMainRow = Math.max(...mainTableElements.map((e) => computeGridPosition(e).row));
    const lanthanideRow = computeGridPosition(
      ALL_ELEMENTS.find((e) => e.classification === 'lanthanide')!,
    ).row;
    expect(lanthanideRow).toBeGreaterThan(maxMainRow);
  });

  it('actinide row is strictly greater than the lanthanide row', () => {
    const lanthanideRow = computeGridPosition(
      ALL_ELEMENTS.find((e) => e.classification === 'lanthanide')!,
    ).row;
    const actinideRow = computeGridPosition(
      ALL_ELEMENTS.find((e) => e.classification === 'actinide')!,
    ).row;
    expect(actinideRow).toBeGreaterThan(lanthanideRow);
  });

  it('lanthanide world y-coordinate is greater than the maximum main-table y-coordinate', () => {
    const mainTableElements = ALL_ELEMENTS.filter(
      (e) => e.classification !== 'lanthanide' && e.classification !== 'actinide',
    );
    const maxMainY = Math.max(
      ...mainTableElements.map((e) => {
        const pos = computeGridPosition(e);
        return pos.row * CELL_SPACING;
      }),
    );
    const lanthanideY = computeGridPosition(
      ALL_ELEMENTS.find((e) => e.classification === 'lanthanide')!,
    ).row * CELL_SPACING;
    expect(lanthanideY).toBeGreaterThan(maxMainY);
  });
});

// ---------------------------------------------------------------------------
// Main-table element positioning
// ---------------------------------------------------------------------------

describe('main-table element positioning', () => {
  it('col = group - 1 for all main-table elements', () => {
    const mainTable = ALL_ELEMENTS.filter(
      (e) => e.classification !== 'lanthanide' && e.classification !== 'actinide',
    );
    for (const el of mainTable) {
      const pos = computeGridPosition(el);
      expect(pos.col).toBe(el.group! - 1);
    }
  });

  it('row = period - 1 for all main-table elements', () => {
    const mainTable = ALL_ELEMENTS.filter(
      (e) => e.classification !== 'lanthanide' && e.classification !== 'actinide',
    );
    for (const el of mainTable) {
      const pos = computeGridPosition(el);
      expect(pos.row).toBe(el.period - 1);
    }
  });

  it('all main-table columns are in range [0, 17]', () => {
    const mainTable = ALL_ELEMENTS.filter(
      (e) => e.classification !== 'lanthanide' && e.classification !== 'actinide',
    );
    for (const el of mainTable) {
      const pos = computeGridPosition(el);
      expect(pos.col).toBeGreaterThanOrEqual(0);
      expect(pos.col).toBeLessThanOrEqual(17);
    }
  });

  it('all main-table rows are in range [0, 6]', () => {
    const mainTable = ALL_ELEMENTS.filter(
      (e) => e.classification !== 'lanthanide' && e.classification !== 'actinide',
    );
    for (const el of mainTable) {
      const pos = computeGridPosition(el);
      expect(pos.row).toBeGreaterThanOrEqual(0);
      expect(pos.row).toBeLessThanOrEqual(6);
    }
  });
});

// ---------------------------------------------------------------------------
// CELL_SPACING constant
// ---------------------------------------------------------------------------

describe('CELL_SPACING', () => {
  it('is 2.5 units per design spec', () => {
    expect(CELL_SPACING).toBe(2.5);
  });
});
