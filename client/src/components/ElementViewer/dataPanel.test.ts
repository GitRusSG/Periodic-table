/**
 * Unit tests for ElementViewer data panel logic.
 *
 * Validates:
 *   Requirement 3.3 — data panel displays atomic number, atomic mass, element
 *                     group, element classification, and Electron_Shell_Configuration.
 *   Requirement 3.6 — isotope selection updates the model (modelMassNumber).
 *   Requirement 3.7 — ion selection updates the data panel (charge, notation).
 */

import { describe, it, expect } from 'vitest';
import {
  extractDataPanelFields,
  getInitialIsotopeState,
  selectIsotope,
  getInitialIonState,
  selectIon,
  resetIonSelection,
  buildInitialViewerState,
  applyIsotopeSelection,
  applyIonSelection,
  type DataPanelElement,
  type DataPanelFields,
} from './dataPanel';

// ---------------------------------------------------------------------------
// Sample element fixtures
// ---------------------------------------------------------------------------

/** Iron (Fe) — a main-table transition metal with multiple isotopes and ions. */
const IRON: DataPanelElement = {
  atomicNumber: 26,
  symbol: 'Fe',
  name: 'Iron',
  group: 8,
  period: 4,
  classification: 'transition_metal',
  atomicMass: 55.845,
  electronShells: [2, 8, 14, 2],
  isotopes: [
    { massNumber: 54, abundance: 5.845, halfLife: null },
    { massNumber: 56, abundance: 91.754, halfLife: null },
    { massNumber: 57, abundance: 2.119, halfLife: null },
    { massNumber: 58, abundance: 0.282, halfLife: null },
  ],
  ionForms: [
    { charge: 2, notation: 'Fe²⁺' },
    { charge: 3, notation: 'Fe³⁺' },
  ],
};

/** Hydrogen (H) — period 1, group 1, no ion forms, three isotopes. */
const HYDROGEN: DataPanelElement = {
  atomicNumber: 1,
  symbol: 'H',
  name: 'Hydrogen',
  group: 1,
  period: 1,
  classification: 'nonmetal',
  atomicMass: 1.008,
  electronShells: [1],
  isotopes: [
    { massNumber: 1, abundance: 99.985, halfLife: null },
    { massNumber: 2, abundance: 0.015, halfLife: null },
    { massNumber: 3, abundance: null, halfLife: '12.32 years' },
  ],
  ionForms: [
    { charge: 1, notation: 'H⁺' },
    { charge: -1, notation: 'H⁻' },
  ],
};

/** Helium (He) — noble gas, group 18, null group would be lanthanide/actinide;
 *  here group is 18 as per the standard table. */
const HELIUM: DataPanelElement = {
  atomicNumber: 2,
  symbol: 'He',
  name: 'Helium',
  group: 18,
  period: 1,
  classification: 'noble_gas',
  atomicMass: 4.0026,
  electronShells: [2],
  isotopes: [
    { massNumber: 4, abundance: 99.9999, halfLife: null },
    { massNumber: 3, abundance: 0.0001, halfLife: null },
  ],
  ionForms: [],
};

/** Lanthanum (La) — lanthanide, group null. */
const LANTHANUM: DataPanelElement = {
  atomicNumber: 57,
  symbol: 'La',
  name: 'Lanthanum',
  group: null,
  period: 6,
  classification: 'lanthanide',
  atomicMass: 138.905,
  electronShells: [2, 8, 18, 18, 9, 2],
  isotopes: [
    { massNumber: 139, abundance: 99.91, halfLife: null },
    { massNumber: 138, abundance: 0.09, halfLife: '1.02e11 years' },
  ],
  ionForms: [
    { charge: 3, notation: 'La³⁺' },
  ],
};

/** An element with no isotopes (edge case). */
const NO_ISOTOPES_ELEMENT: DataPanelElement = {
  atomicNumber: 118,
  symbol: 'Og',
  name: 'Oganesson',
  group: 18,
  period: 7,
  classification: 'noble_gas',
  atomicMass: 294,
  electronShells: [2, 8, 18, 32, 32, 18, 8],
  isotopes: [],
  ionForms: [],
};

// ---------------------------------------------------------------------------
// extractDataPanelFields — Requirement 3.3
// ---------------------------------------------------------------------------

describe('extractDataPanelFields', () => {
  it('returns the atomic number for Iron', () => {
    const fields = extractDataPanelFields(IRON);
    expect(fields.atomicNumber).toBe(26);
  });

  it('returns the atomic mass for Iron', () => {
    const fields = extractDataPanelFields(IRON);
    expect(fields.atomicMass).toBe(55.845);
  });

  it('returns the element group for Iron', () => {
    const fields = extractDataPanelFields(IRON);
    expect(fields.group).toBe(8);
  });

  it('returns the element classification for Iron', () => {
    const fields = extractDataPanelFields(IRON);
    expect(fields.classification).toBe('transition_metal');
  });

  it('returns the Electron_Shell_Configuration as a comma-separated string for Iron', () => {
    const fields = extractDataPanelFields(IRON);
    // Iron: [2, 8, 14, 2] → "2,8,14,2"
    expect(fields.electronShellConfiguration).toBe('2,8,14,2');
  });

  it('returns all five required fields for Iron (none undefined)', () => {
    const fields: DataPanelFields = extractDataPanelFields(IRON);
    expect(fields.atomicNumber).toBeDefined();
    expect(fields.atomicMass).toBeDefined();
    expect(fields.group).toBeDefined();
    expect(fields.classification).toBeDefined();
    expect(fields.electronShellConfiguration).toBeDefined();
  });

  it('returns correct fields for Hydrogen (period 1, group 1, single shell)', () => {
    const fields = extractDataPanelFields(HYDROGEN);
    expect(fields.atomicNumber).toBe(1);
    expect(fields.atomicMass).toBe(1.008);
    expect(fields.group).toBe(1);
    expect(fields.classification).toBe('nonmetal');
    expect(fields.electronShellConfiguration).toBe('1');
  });

  it('returns correct fields for Helium (noble gas, group 18)', () => {
    const fields = extractDataPanelFields(HELIUM);
    expect(fields.atomicNumber).toBe(2);
    expect(fields.atomicMass).toBe(4.0026);
    expect(fields.group).toBe(18);
    expect(fields.classification).toBe('noble_gas');
    expect(fields.electronShellConfiguration).toBe('2');
  });

  it('returns null group for Lanthanum (lanthanide)', () => {
    const fields = extractDataPanelFields(LANTHANUM);
    expect(fields.group).toBeNull();
  });

  it('returns correct shell configuration for Lanthanum (6 shells)', () => {
    const fields = extractDataPanelFields(LANTHANUM);
    expect(fields.electronShellConfiguration).toBe('2,8,18,18,9,2');
  });

  it('returns correct shell configuration for Oganesson (7 shells)', () => {
    const fields = extractDataPanelFields(NO_ISOTOPES_ELEMENT);
    expect(fields.electronShellConfiguration).toBe('2,8,18,32,32,18,8');
  });
});

// ---------------------------------------------------------------------------
// getInitialIsotopeState — default isotope selection
// ---------------------------------------------------------------------------

describe('getInitialIsotopeState', () => {
  it('selects the most abundant isotope for Iron (Fe-56, 91.754%)', () => {
    const state = getInitialIsotopeState(IRON);
    expect(state.selectedIsotope?.massNumber).toBe(56);
    expect(state.modelMassNumber).toBe(56);
  });

  it('selects the most abundant isotope for Hydrogen (H-1, 99.985%)', () => {
    const state = getInitialIsotopeState(HYDROGEN);
    expect(state.selectedIsotope?.massNumber).toBe(1);
    expect(state.modelMassNumber).toBe(1);
  });

  it('selects the most abundant isotope for Helium (He-4, 99.9999%)', () => {
    const state = getInitialIsotopeState(HELIUM);
    expect(state.selectedIsotope?.massNumber).toBe(4);
    expect(state.modelMassNumber).toBe(4);
  });

  it('falls back to the first isotope when all abundances are null', () => {
    const element: DataPanelElement = {
      ...IRON,
      isotopes: [
        { massNumber: 60, abundance: null, halfLife: '1.5e6 years' },
        { massNumber: 61, abundance: null, halfLife: '3 min' },
      ],
    };
    const state = getInitialIsotopeState(element);
    expect(state.selectedIsotope?.massNumber).toBe(60);
    expect(state.modelMassNumber).toBe(60);
  });

  it('returns null selectedIsotope and rounded atomicMass when no isotopes exist', () => {
    const state = getInitialIsotopeState(NO_ISOTOPES_ELEMENT);
    expect(state.selectedIsotope).toBeNull();
    expect(state.modelMassNumber).toBe(294); // Math.round(294)
  });
});

// ---------------------------------------------------------------------------
// selectIsotope — Requirement 3.6
// ---------------------------------------------------------------------------

describe('selectIsotope', () => {
  it('returns a state with the selected isotope when a valid mass number is given', () => {
    const state = selectIsotope(IRON, 54);
    expect(state).not.toBeNull();
    expect(state!.selectedIsotope?.massNumber).toBe(54);
  });

  it('updates modelMassNumber to the selected isotope mass number', () => {
    const state = selectIsotope(IRON, 57);
    expect(state!.modelMassNumber).toBe(57);
  });

  it('returns null when the mass number does not exist in the element isotopes', () => {
    const state = selectIsotope(IRON, 999);
    expect(state).toBeNull();
  });

  it('can select each of Iron\'s four isotopes', () => {
    for (const massNumber of [54, 56, 57, 58]) {
      const state = selectIsotope(IRON, massNumber);
      expect(state).not.toBeNull();
      expect(state!.modelMassNumber).toBe(massNumber);
    }
  });

  it('can select the radioactive Tritium isotope (H-3, abundance null)', () => {
    const state = selectIsotope(HYDROGEN, 3);
    expect(state).not.toBeNull();
    expect(state!.selectedIsotope?.massNumber).toBe(3);
    expect(state!.selectedIsotope?.halfLife).toBe('12.32 years');
    expect(state!.modelMassNumber).toBe(3);
  });

  it('returns null for an element with no isotopes', () => {
    const state = selectIsotope(NO_ISOTOPES_ELEMENT, 294);
    expect(state).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getInitialIonState — neutral atom default
// ---------------------------------------------------------------------------

describe('getInitialIonState', () => {
  it('returns null selectedIon for the neutral atom', () => {
    const state = getInitialIonState(IRON);
    expect(state.selectedIon).toBeNull();
  });

  it('returns charge 0 for the neutral atom', () => {
    const state = getInitialIonState(IRON);
    expect(state.displayCharge).toBe(0);
  });

  it('returns the element symbol as the display notation for the neutral atom', () => {
    const state = getInitialIonState(IRON);
    expect(state.displayNotation).toBe('Fe');
  });

  it('uses the correct symbol for Hydrogen', () => {
    const state = getInitialIonState(HYDROGEN);
    expect(state.displayNotation).toBe('H');
    expect(state.displayCharge).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// selectIon — Requirement 3.7
// ---------------------------------------------------------------------------

describe('selectIon', () => {
  it('returns a state with the selected ion when a valid charge is given', () => {
    const state = selectIon(IRON, 2);
    expect(state).not.toBeNull();
    expect(state!.selectedIon?.charge).toBe(2);
  });

  it('updates displayCharge to the selected ion charge', () => {
    const state = selectIon(IRON, 3);
    expect(state!.displayCharge).toBe(3);
  });

  it('updates displayNotation to the selected ion notation', () => {
    const state = selectIon(IRON, 2);
    expect(state!.displayNotation).toBe('Fe²⁺');
  });

  it('updates displayNotation for Fe³⁺', () => {
    const state = selectIon(IRON, 3);
    expect(state!.displayNotation).toBe('Fe³⁺');
  });

  it('returns null when the charge does not exist in the element ion forms', () => {
    const state = selectIon(IRON, 99);
    expect(state).toBeNull();
  });

  it('can select a negative ion (H⁻)', () => {
    const state = selectIon(HYDROGEN, -1);
    expect(state).not.toBeNull();
    expect(state!.displayCharge).toBe(-1);
    expect(state!.displayNotation).toBe('H⁻');
  });

  it('can select a positive ion (H⁺)', () => {
    const state = selectIon(HYDROGEN, 1);
    expect(state).not.toBeNull();
    expect(state!.displayCharge).toBe(1);
    expect(state!.displayNotation).toBe('H⁺');
  });

  it('returns null for an element with no ion forms', () => {
    const state = selectIon(NO_ISOTOPES_ELEMENT, 1);
    expect(state).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resetIonSelection
// ---------------------------------------------------------------------------

describe('resetIonSelection', () => {
  it('resets to neutral atom state after an ion was selected', () => {
    const state = resetIonSelection(IRON);
    expect(state.selectedIon).toBeNull();
    expect(state.displayCharge).toBe(0);
    expect(state.displayNotation).toBe('Fe');
  });
});

// ---------------------------------------------------------------------------
// buildInitialViewerState — combined state
// ---------------------------------------------------------------------------

describe('buildInitialViewerState', () => {
  it('includes all five required data panel fields for Iron', () => {
    const state = buildInitialViewerState(IRON);
    expect(state.panelFields.atomicNumber).toBe(26);
    expect(state.panelFields.atomicMass).toBe(55.845);
    expect(state.panelFields.group).toBe(8);
    expect(state.panelFields.classification).toBe('transition_metal');
    expect(state.panelFields.electronShellConfiguration).toBe('2,8,14,2');
  });

  it('initialises isotope state to the most abundant isotope', () => {
    const state = buildInitialViewerState(IRON);
    expect(state.isotopeState.selectedIsotope?.massNumber).toBe(56);
    expect(state.isotopeState.modelMassNumber).toBe(56);
  });

  it('initialises ion state to the neutral atom', () => {
    const state = buildInitialViewerState(IRON);
    expect(state.ionState.selectedIon).toBeNull();
    expect(state.ionState.displayCharge).toBe(0);
    expect(state.ionState.displayNotation).toBe('Fe');
  });

  it('stores the original element reference', () => {
    const state = buildInitialViewerState(IRON);
    expect(state.element).toBe(IRON);
  });
});

// ---------------------------------------------------------------------------
// applyIsotopeSelection — Requirement 3.6
// ---------------------------------------------------------------------------

describe('applyIsotopeSelection', () => {
  it('updates the isotope state when a valid mass number is selected', () => {
    const initial = buildInitialViewerState(IRON);
    const updated = applyIsotopeSelection(initial, 54);
    expect(updated.isotopeState.selectedIsotope?.massNumber).toBe(54);
    expect(updated.isotopeState.modelMassNumber).toBe(54);
  });

  it('does not mutate the original state (returns a new object)', () => {
    const initial = buildInitialViewerState(IRON);
    const updated = applyIsotopeSelection(initial, 54);
    expect(updated).not.toBe(initial);
    // Original state is unchanged
    expect(initial.isotopeState.modelMassNumber).toBe(56);
  });

  it('preserves the panel fields and ion state when isotope changes', () => {
    const initial = buildInitialViewerState(IRON);
    const updated = applyIsotopeSelection(initial, 58);
    expect(updated.panelFields).toEqual(initial.panelFields);
    expect(updated.ionState).toEqual(initial.ionState);
  });

  it('returns the original state unchanged when the mass number is invalid', () => {
    const initial = buildInitialViewerState(IRON);
    const result = applyIsotopeSelection(initial, 999);
    expect(result).toBe(initial);
  });

  it('can cycle through all four Iron isotopes', () => {
    let state = buildInitialViewerState(IRON);
    for (const massNumber of [54, 56, 57, 58]) {
      state = applyIsotopeSelection(state, massNumber);
      expect(state.isotopeState.modelMassNumber).toBe(massNumber);
    }
  });
});

// ---------------------------------------------------------------------------
// applyIonSelection — Requirement 3.7
// ---------------------------------------------------------------------------

describe('applyIonSelection', () => {
  it('updates the ion state when a valid charge is selected', () => {
    const initial = buildInitialViewerState(IRON);
    const updated = applyIonSelection(initial, 2);
    expect(updated.ionState.selectedIon?.charge).toBe(2);
    expect(updated.ionState.displayCharge).toBe(2);
    expect(updated.ionState.displayNotation).toBe('Fe²⁺');
  });

  it('does not mutate the original state (returns a new object)', () => {
    const initial = buildInitialViewerState(IRON);
    const updated = applyIonSelection(initial, 2);
    expect(updated).not.toBe(initial);
    // Original state is unchanged
    expect(initial.ionState.displayCharge).toBe(0);
  });

  it('preserves the panel fields and isotope state when ion changes', () => {
    const initial = buildInitialViewerState(IRON);
    const updated = applyIonSelection(initial, 3);
    expect(updated.panelFields).toEqual(initial.panelFields);
    expect(updated.isotopeState).toEqual(initial.isotopeState);
  });

  it('returns the original state unchanged when the charge is invalid', () => {
    const initial = buildInitialViewerState(IRON);
    const result = applyIonSelection(initial, 99);
    expect(result).toBe(initial);
  });

  it('can switch between Fe²⁺ and Fe³⁺', () => {
    let state = buildInitialViewerState(IRON);
    state = applyIonSelection(state, 2);
    expect(state.ionState.displayNotation).toBe('Fe²⁺');
    state = applyIonSelection(state, 3);
    expect(state.ionState.displayNotation).toBe('Fe³⁺');
  });

  it('can select a negative ion (H⁻)', () => {
    const initial = buildInitialViewerState(HYDROGEN);
    const updated = applyIonSelection(initial, -1);
    expect(updated.ionState.displayCharge).toBe(-1);
    expect(updated.ionState.displayNotation).toBe('H⁻');
  });

  it('data panel fields remain correct after ion selection (Req 3.7)', () => {
    const initial = buildInitialViewerState(IRON);
    const updated = applyIonSelection(initial, 3);
    // Panel fields (atomic number, mass, group, classification, shells) unchanged
    expect(updated.panelFields.atomicNumber).toBe(26);
    expect(updated.panelFields.atomicMass).toBe(55.845);
    expect(updated.panelFields.group).toBe(8);
    expect(updated.panelFields.classification).toBe('transition_metal');
    expect(updated.panelFields.electronShellConfiguration).toBe('2,8,14,2');
    // Ion state updated
    expect(updated.ionState.displayCharge).toBe(3);
    expect(updated.ionState.displayNotation).toBe('Fe³⁺');
  });
});

// ---------------------------------------------------------------------------
// Combined isotope + ion interaction
// ---------------------------------------------------------------------------

describe('combined isotope and ion selection', () => {
  it('isotope and ion selections are independent of each other', () => {
    let state = buildInitialViewerState(IRON);
    state = applyIsotopeSelection(state, 54);
    state = applyIonSelection(state, 3);

    expect(state.isotopeState.modelMassNumber).toBe(54);
    expect(state.ionState.displayCharge).toBe(3);
    expect(state.ionState.displayNotation).toBe('Fe³⁺');
  });

  it('changing isotope does not reset ion selection', () => {
    let state = buildInitialViewerState(IRON);
    state = applyIonSelection(state, 2);
    state = applyIsotopeSelection(state, 57);

    expect(state.ionState.displayCharge).toBe(2);
    expect(state.isotopeState.modelMassNumber).toBe(57);
  });

  it('changing ion does not reset isotope selection', () => {
    let state = buildInitialViewerState(IRON);
    state = applyIsotopeSelection(state, 58);
    state = applyIonSelection(state, 3);

    expect(state.isotopeState.modelMassNumber).toBe(58);
    expect(state.ionState.displayCharge).toBe(3);
  });
});
