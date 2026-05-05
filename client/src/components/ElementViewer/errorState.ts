/**
 * ElementViewer error state logic module.
 *
 * Contains the pure state-management logic for handling model load failures
 * in the Element_Viewer.  Keeping this separate from the React/Three.js
 * component makes it fully testable without a DOM or WebGL context.
 *
 * Design spec (section 4.2):
 *   The ElementViewer renders a 3D model in an isolated Three.js canvas.
 *   If the model asset fails to load, the viewer must display a descriptive
 *   error message and provide a retry option.
 *
 * Requirements:
 *   3.8 — IF element model data fails to load, THEN THE Element_Viewer SHALL
 *          display a descriptive error message and provide a retry option.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The possible load states for an element model. */
export type ModelLoadStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * State representing a model load failure.
 * Requirement 3.8.
 */
export interface ModelErrorState {
  /** Whether the viewer is currently in an error state. */
  hasError: boolean;
  /** Human-readable error message to display to the user. */
  message: string;
  /** Number of retry attempts made so far. */
  retryCount: number;
}

/**
 * The full model load state for the Element_Viewer.
 */
export interface ModelLoadState {
  status: ModelLoadStatus;
  error: ModelErrorState | null;
}

// ---------------------------------------------------------------------------
// Error message construction
// ---------------------------------------------------------------------------

/**
 * Build a descriptive error message for a model load failure.
 * Requirement 3.8 — the message must be descriptive.
 *
 * @param elementName - The name of the element whose model failed to load.
 * @param retryCount  - How many retries have already been attempted (0 = first failure).
 * @returns A human-readable error message.
 */
export function buildErrorMessage(elementName: string, retryCount: number): string {
  const base = `Failed to load element model for ${elementName}. The 3D model could not be loaded.`;
  if (retryCount === 0) {
    return base;
  }
  return `${base} (Attempt ${retryCount + 1} failed)`;
}

// ---------------------------------------------------------------------------
// State transitions
// ---------------------------------------------------------------------------

/**
 * Produce the initial (idle, no error) model load state.
 *
 * @returns Initial model load state.
 */
export function getInitialModelLoadState(): ModelLoadState {
  return {
    status: 'idle',
    error: null,
  };
}

/**
 * Transition the model load state to "loading".
 * Clears any previous error so the UI shows a loading indicator.
 *
 * @param current - The current model load state.
 * @returns New state with status 'loading' and no error.
 */
export function applyLoadingTransition(current: ModelLoadState): ModelLoadState {
  return {
    status: 'loading',
    error: null,
  };
}

/**
 * Transition the model load state to "success".
 * Clears any previous error.
 *
 * @param _current - The current model load state (unused, kept for API symmetry).
 * @returns New state with status 'success' and no error.
 */
export function applySuccessTransition(_current: ModelLoadState): ModelLoadState {
  return {
    status: 'success',
    error: null,
  };
}

/**
 * Transition the model load state to "error".
 * Increments the retry count if a previous error existed.
 * Requirement 3.8 — sets a descriptive error message.
 *
 * @param current     - The current model load state.
 * @param elementName - The name of the element whose model failed to load.
 * @returns New state with status 'error' and a populated ModelErrorState.
 */
export function applyErrorTransition(
  current: ModelLoadState,
  elementName: string,
): ModelLoadState {
  const retryCount = current.error ? current.error.retryCount + 1 : 0;
  return {
    status: 'error',
    error: {
      hasError: true,
      message: buildErrorMessage(elementName, retryCount),
      retryCount,
    },
  };
}

/**
 * Produce the state that results from the user pressing the retry button.
 * Resets status to 'loading' while preserving the retry count so the error
 * message can reflect cumulative attempts if the next load also fails.
 * Requirement 3.8 — provides a retry option.
 *
 * @param current - The current model load state (must be in 'error' status).
 * @returns New state with status 'loading', preserving the retry count.
 */
export function applyRetryTransition(current: ModelLoadState): ModelLoadState {
  const retryCount = current.error ? current.error.retryCount : 0;
  return {
    status: 'loading',
    error: {
      hasError: false,
      message: '',
      retryCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Selectors / helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the viewer should display the error UI.
 * Requirement 3.8.
 *
 * @param state - The current model load state.
 */
export function isInErrorState(state: ModelLoadState): boolean {
  return state.status === 'error' && state.error !== null && state.error.hasError;
}

/**
 * Returns true if the retry button should be shown.
 * The retry button is available whenever the viewer is in an error state.
 * Requirement 3.8.
 *
 * @param state - The current model load state.
 */
export function shouldShowRetryButton(state: ModelLoadState): boolean {
  return isInErrorState(state);
}

/**
 * Returns the error message to display, or an empty string if there is no error.
 * Requirement 3.8.
 *
 * @param state - The current model load state.
 */
export function getErrorMessage(state: ModelLoadState): string {
  if (!isInErrorState(state)) return '';
  return state.error!.message;
}
