/**
 * ElementViewer data panel logic module.
 *
 * Contains the pure data-extraction and state-management logic for the
 * Element_Viewer data panel.  Keeping this separate from the React/Three.js
 * component makes it fully testable without a DOM or WebGL context.
 *
 * Design spec (section 4.2):
 *   The ElementViewer renders a data panel with:
 *     - atomic number
 *     - atomic mass
 *     - element group
 *     - element classification
 *     - Electron_Shell_Configuration (comma-separated shell counts)
 *   It also provides isotope and ion-form dropdowns that update the viewer
 *   state when a selection is made.
 *
 * Requirements:
 *   3.3 — data panel fields
 *   3.6 — isotope selection updates the 3D model
 *   3.7 — ion selection updates the data panel
 */

// ---------------------------------------------------------------------------
// Types (subset of the full Element interface needed by this module)
// ---------------------------------------------------------------------------

export interface Isotope {
  massNumber: number;
  abundance: number | null; // natural abundance %, null if synthetic
  halfLife: string | null;  // null if stable
}

export interface IonForm {
  charge: number;
  notation: string; // e.g. "Fe²⁺"
}

/** Minimal element fields required by the data panel. */
export interface DataPanelElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  group: number | null;
  period: number;
  classification: string;
  atomicMass: number;
  electronShells: number[]; // e.g. [2, 8, 14, 2]
  isotopes: Isotope[];
  ionForms: IonForm[];
}

// ---------------------------------------------------------------------------
// Data panel field extraction
// ---------------------------------------------------------------------------

/**
 * The set of fields displayed in the Element_Viewer data panel.
 * Requirement 3.3.
 */
export interface DataPanelFields {
  atomicNumber: number;
  atomicMass: number;
  group: number | null;
  classification: string;
  /** Electron_Shell_Configuration: comma-separated shell counts, e.g. "2,8,14,2" */
  electronShellConfiguration: string;
}

/**
 * Extract the data panel display fields from an element record.
 *
 * @param element - The element to extract fields from.
 * @returns The fields to display in the data panel.
 */
export function extractDataPanelFields(element: DataPanelElement): DataPanelFields {
  return {
    atomicNumber: element.atomicNumber,
    atomicMass: element.atomicMass,
    group: element.group,
    classification: element.classification,
    electronShellConfiguration: element.electronShells.join(','),
  };
}

// ---------------------------------------------------------------------------
// Isotope selection state
// ---------------------------------------------------------------------------

/**
 * State produced when a user selects an isotope from the dropdown.
 * Requirement 3.6 — the 3D model should update to reflect the selected
 * isotope's mass number.
 */
export interface IsotopeSelectionState {
  /** The currently selected isotope, or null if the default (most abundant) is shown. */
  selectedIsotope: Isotope | null;
  /** The mass number to use for the 3D model (selected isotope or base atomic mass rounded). */
  modelMassNumber: number;
}

/**
 * Compute the initial isotope selection state for an element.
 * Selects the most naturally abundant isotope (highest abundance), or the
 * first isotope if none have a known abundance.
 *
 * @param element - The element to compute initial state for.
 * @returns Initial isotope selection state.
 */
export function getInitialIsotopeState(element: DataPanelElement): IsotopeSelectionState {
  if (element.isotopes.length === 0) {
    return {
      selectedIsotope: null,
      modelMassNumber: Math.round(element.atomicMass),
    };
  }

  // Find the most abundant isotope (highest abundance value).
  const withAbundance = element.isotopes.filter((iso) => iso.abundance !== null);
  const mostAbundant =
    withAbundance.length > 0
      ? withAbundance.reduce((best, iso) =>
          (iso.abundance as number) > (best.abundance as number) ? iso : best,
        )
      : element.isotopes[0];

  return {
    selectedIsotope: mostAbundant,
    modelMassNumber: mostAbundant.massNumber,
  };
}

/**
 * Produce a new isotope selection state when the user picks an isotope from
 * the dropdown.  Requirement 3.6.
 *
 * @param element  - The element whose isotopes are listed.
 * @param massNumber - The mass number of the selected isotope.
 * @returns Updated isotope selection state, or null if the mass number is not found.
 */
export function selectIsotope(
  element: DataPanelElement,
  massNumber: number,
): IsotopeSelectionState | null {
  const isotope = element.isotopes.find((iso) => iso.massNumber === massNumber);
  if (!isotope) return null;

  return {
    selectedIsotope: isotope,
    modelMassNumber: isotope.massNumber,
  };
}

// ---------------------------------------------------------------------------
// Ion form selection state
// ---------------------------------------------------------------------------

/**
 * State produced when a user selects an ion form from the dropdown.
 * Requirement 3.7 — the data panel should update to reflect the ion's charge
 * and notation.
 */
export interface IonSelectionState {
  /** The currently selected ion form, or null if the neutral atom is shown. */
  selectedIon: IonForm | null;
  /** The charge to display in the data panel (0 for neutral atom). */
  displayCharge: number;
  /** The notation to display (e.g. "Fe²⁺"), or the element symbol for neutral. */
  displayNotation: string;
}

/**
 * Compute the initial (neutral atom) ion selection state for an element.
 *
 * @param element - The element to compute initial state for.
 * @returns Initial ion selection state (neutral atom).
 */
export function getInitialIonState(element: DataPanelElement): IonSelectionState {
  return {
    selectedIon: null,
    displayCharge: 0,
    displayNotation: element.symbol,
  };
}

/**
 * Produce a new ion selection state when the user picks an ion form from the
 * dropdown.  Requirement 3.7.
 *
 * @param element - The element whose ion forms are listed.
 * @param charge  - The charge of the selected ion form.
 * @returns Updated ion selection state, or null if the charge is not found.
 */
export function selectIon(
  element: DataPanelElement,
  charge: number,
): IonSelectionState | null {
  const ion = element.ionForms.find((f) => f.charge === charge);
  if (!ion) return null;

  return {
    selectedIon: ion,
    displayCharge: ion.charge,
    displayNotation: ion.notation,
  };
}

/**
 * Reset the ion selection back to the neutral atom state.
 *
 * @param element - The element to reset to.
 * @returns Ion selection state representing the neutral atom.
 */
export function resetIonSelection(element: DataPanelElement): IonSelectionState {
  return getInitialIonState(element);
}

// ---------------------------------------------------------------------------
// Combined viewer state
// ---------------------------------------------------------------------------

/**
 * The full state of the Element_Viewer data panel for a given element.
 */
export interface ElementViewerState {
  element: DataPanelElement;
  panelFields: DataPanelFields;
  isotopeState: IsotopeSelectionState;
  ionState: IonSelectionState;
}

/**
 * Build the initial Element_Viewer state for a given element.
 *
 * @param element - The element to open in the viewer.
 * @returns Initial viewer state.
 */
export function buildInitialViewerState(element: DataPanelElement): ElementViewerState {
  return {
    element,
    panelFields: extractDataPanelFields(element),
    isotopeState: getInitialIsotopeState(element),
    ionState: getInitialIonState(element),
  };
}

/**
 * Apply an isotope selection to an existing viewer state.
 * Returns a new state object (immutable update).  Requirement 3.6.
 *
 * @param state      - Current viewer state.
 * @param massNumber - Mass number of the isotope to select.
 * @returns Updated viewer state, or the original state if the mass number is invalid.
 */
export function applyIsotopeSelection(
  state: ElementViewerState,
  massNumber: number,
): ElementViewerState {
  const newIsotopeState = selectIsotope(state.element, massNumber);
  if (!newIsotopeState) return state;

  return { ...state, isotopeState: newIsotopeState };
}

/**
 * Apply an ion selection to an existing viewer state.
 * Returns a new state object (immutable update).  Requirement 3.7.
 *
 * @param state  - Current viewer state.
 * @param charge - Charge of the ion form to select.
 * @returns Updated viewer state, or the original state if the charge is invalid.
 */
export function applyIonSelection(
  state: ElementViewerState,
  charge: number,
): ElementViewerState {
  const newIonState = selectIon(state.element, charge);
  if (!newIonState) return state;

  return { ...state, ionState: newIonState };
}
