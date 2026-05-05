/**
 * In-memory Trivia Question Store.
 *
 * Holds a static set of chemistry questions organised by difficulty level (1–5).
 * Each question has: id, text, options (4 strings), correctIndex (0–3), difficultyLevel.
 *
 * Requirements: 4.1, 4.2
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TriviaQuestion {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

// ---------------------------------------------------------------------------
// Question bank — at least 5 questions per difficulty level (1–5)
// ---------------------------------------------------------------------------

const QUESTIONS: TriviaQuestion[] = [
  // -------------------------------------------------------------------------
  // Difficulty 1 — basic element identification
  // -------------------------------------------------------------------------
  {
    id: "d1-q1",
    text: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctIndex: 2,
    difficultyLevel: 1,
  },
  {
    id: "d1-q2",
    text: "Which element has atomic number 1?",
    options: ["Helium", "Lithium", "Hydrogen", "Carbon"],
    correctIndex: 2,
    difficultyLevel: 1,
  },
  {
    id: "d1-q3",
    text: "What is the symbol for Sodium?",
    options: ["So", "Sd", "Sn", "Na"],
    correctIndex: 3,
    difficultyLevel: 1,
  },
  {
    id: "d1-q4",
    text: "Which element is represented by the symbol 'O'?",
    options: ["Osmium", "Oganesson", "Oxygen", "Osmium"],
    correctIndex: 2,
    difficultyLevel: 1,
  },
  {
    id: "d1-q5",
    text: "How many elements are in the periodic table?",
    options: ["108", "112", "118", "124"],
    correctIndex: 2,
    difficultyLevel: 1,
  },
  {
    id: "d1-q6",
    text: "Which element has the symbol 'Fe'?",
    options: ["Fluorine", "Francium", "Iron", "Fermium"],
    correctIndex: 2,
    difficultyLevel: 1,
  },

  // -------------------------------------------------------------------------
  // Difficulty 2 — periodic trends and basic chemistry
  // -------------------------------------------------------------------------
  {
    id: "d2-q1",
    text: "Which group of elements is known as the Noble Gases?",
    options: ["Group 1", "Group 7", "Group 17", "Group 18"],
    correctIndex: 3,
    difficultyLevel: 2,
  },
  {
    id: "d2-q2",
    text: "What is the most electronegative element?",
    options: ["Oxygen", "Chlorine", "Fluorine", "Nitrogen"],
    correctIndex: 2,
    difficultyLevel: 2,
  },
  {
    id: "d2-q3",
    text: "Which period contains the element Potassium (K)?",
    options: ["Period 2", "Period 3", "Period 4", "Period 5"],
    correctIndex: 2,
    difficultyLevel: 2,
  },
  {
    id: "d2-q4",
    text: "What type of bond forms between two non-metal atoms?",
    options: ["Ionic bond", "Metallic bond", "Covalent bond", "Hydrogen bond"],
    correctIndex: 2,
    difficultyLevel: 2,
  },
  {
    id: "d2-q5",
    text: "Which element is a liquid at room temperature and is a metal?",
    options: ["Bromine", "Mercury", "Gallium", "Cesium"],
    correctIndex: 1,
    difficultyLevel: 2,
  },
  {
    id: "d2-q6",
    text: "Atomic radius generally increases as you move down a group because:",
    options: [
      "Nuclear charge decreases",
      "More electron shells are added",
      "Electronegativity increases",
      "Ionisation energy increases",
    ],
    correctIndex: 1,
    difficultyLevel: 2,
  },

  // -------------------------------------------------------------------------
  // Difficulty 3 — electron configuration and isotopes
  // -------------------------------------------------------------------------
  {
    id: "d3-q1",
    text: "What is the electron configuration of Carbon (Z=6)?",
    options: ["1s² 2s² 2p¹", "1s² 2s² 2p²", "1s² 2s² 2p³", "1s² 2s¹ 2p³"],
    correctIndex: 1,
    difficultyLevel: 3,
  },
  {
    id: "d3-q2",
    text: "Carbon-14 is an isotope of Carbon-12. What differs between them?",
    options: [
      "Number of protons",
      "Number of electrons",
      "Number of neutrons",
      "Atomic number",
    ],
    correctIndex: 2,
    difficultyLevel: 3,
  },
  {
    id: "d3-q3",
    text: "Which subshell is filled after the 4s subshell according to the Aufbau principle?",
    options: ["3p", "3d", "4p", "5s"],
    correctIndex: 1,
    difficultyLevel: 3,
  },
  {
    id: "d3-q4",
    text: "How many valence electrons does Sulfur (Z=16) have?",
    options: ["2", "4", "6", "8"],
    correctIndex: 2,
    difficultyLevel: 3,
  },
  {
    id: "d3-q5",
    text: "Which of the following is the correct electron configuration for Fe²⁺ (Iron, Z=26)?",
    options: [
      "[Ar] 3d⁶ 4s²",
      "[Ar] 3d⁵ 4s¹",
      "[Ar] 3d⁶",
      "[Ar] 3d⁴ 4s²",
    ],
    correctIndex: 2,
    difficultyLevel: 3,
  },
  {
    id: "d3-q6",
    text: "Uranium-235 and Uranium-238 are isotopes. How many neutrons does U-235 have?",
    options: ["92", "143", "146", "235"],
    correctIndex: 1,
    difficultyLevel: 3,
  },

  // -------------------------------------------------------------------------
  // Difficulty 4 — subatomic physics and advanced periodic trends
  // -------------------------------------------------------------------------
  {
    id: "d4-q1",
    text: "What quantum number describes the shape of an atomic orbital?",
    options: [
      "Principal quantum number (n)",
      "Azimuthal quantum number (l)",
      "Magnetic quantum number (mₗ)",
      "Spin quantum number (mₛ)",
    ],
    correctIndex: 1,
    difficultyLevel: 4,
  },
  {
    id: "d4-q2",
    text: "Which effect causes inner electrons to reduce the effective nuclear charge felt by outer electrons?",
    options: [
      "Photoelectric effect",
      "Shielding (screening) effect",
      "Auger effect",
      "Compton scattering",
    ],
    correctIndex: 1,
    difficultyLevel: 4,
  },
  {
    id: "d4-q3",
    text: "The first ionisation energy of Oxygen is lower than that of Nitrogen. Why?",
    options: [
      "Oxygen has a higher atomic mass",
      "Oxygen's 2p subshell is half-filled",
      "Nitrogen's 2p subshell is half-filled, giving extra stability",
      "Oxygen has more protons",
    ],
    correctIndex: 2,
    difficultyLevel: 4,
  },
  {
    id: "d4-q4",
    text: "What is the de Broglie wavelength associated with a particle?",
    options: [
      "λ = mv/h",
      "λ = h/(mv)",
      "λ = hv/m",
      "λ = m/(hv)",
    ],
    correctIndex: 1,
    difficultyLevel: 4,
  },
  {
    id: "d4-q5",
    text: "Which transition in the hydrogen spectrum corresponds to the Lyman series?",
    options: [
      "Transitions to n=1",
      "Transitions to n=2",
      "Transitions to n=3",
      "Transitions to n=4",
    ],
    correctIndex: 0,
    difficultyLevel: 4,
  },
  {
    id: "d4-q6",
    text: "Hund's rule states that electrons in degenerate orbitals will:",
    options: [
      "Pair up in the lowest energy orbital first",
      "Occupy separate orbitals with parallel spins before pairing",
      "Always have opposite spins",
      "Fill higher energy orbitals before lower ones",
    ],
    correctIndex: 1,
    difficultyLevel: 4,
  },

  // -------------------------------------------------------------------------
  // Difficulty 5 — quantum mechanics and advanced bonding
  // -------------------------------------------------------------------------
  {
    id: "d5-q1",
    text: "In molecular orbital theory, which orbital results from the destructive interference of two atomic orbitals?",
    options: [
      "Bonding molecular orbital",
      "Non-bonding orbital",
      "Antibonding molecular orbital",
      "Hybrid orbital",
    ],
    correctIndex: 2,
    difficultyLevel: 5,
  },
  {
    id: "d5-q2",
    text: "The Heisenberg Uncertainty Principle states that:",
    options: [
      "Energy and time cannot both be precisely known",
      "Position and momentum cannot both be precisely known simultaneously",
      "Spin and charge cannot both be measured",
      "Mass and velocity are always uncertain",
    ],
    correctIndex: 1,
    difficultyLevel: 5,
  },
  {
    id: "d5-q3",
    text: "Which quantum number can take values of +½ or −½?",
    options: [
      "Principal quantum number (n)",
      "Azimuthal quantum number (l)",
      "Magnetic quantum number (mₗ)",
      "Spin quantum number (mₛ)",
    ],
    correctIndex: 3,
    difficultyLevel: 5,
  },
  {
    id: "d5-q4",
    text: "In crystal field theory, the splitting of d-orbitals in an octahedral field produces which two sets?",
    options: [
      "t₂g and eg",
      "dxy and dz²",
      "σ and π sets",
      "bonding and antibonding sets",
    ],
    correctIndex: 0,
    difficultyLevel: 5,
  },
  {
    id: "d5-q5",
    text: "Which of the following best describes a wavefunction (ψ) in quantum mechanics?",
    options: [
      "The exact position of an electron",
      "A mathematical function whose square gives the probability density of finding a particle",
      "The kinetic energy of an electron",
      "The electric field around a nucleus",
    ],
    correctIndex: 1,
    difficultyLevel: 5,
  },
  {
    id: "d5-q6",
    text: "Relativistic effects in heavy elements (e.g., Gold) cause the 6s orbital to:",
    options: [
      "Expand and destabilise",
      "Contract and stabilise, lowering its energy",
      "Become degenerate with 5d",
      "Lose its spherical symmetry",
    ],
    correctIndex: 1,
    difficultyLevel: 5,
  },
];

// ---------------------------------------------------------------------------
// QuestionStore
// ---------------------------------------------------------------------------

export class QuestionStore {
  private questions: TriviaQuestion[] = QUESTIONS;

  /**
   * Returns up to `count` questions for the given difficulty level.
   * Questions are shuffled randomly on each call.
   *
   * Requirements: 4.1, 4.2
   */
  getQuestions(
    difficultyLevel: 1 | 2 | 3 | 4 | 5,
    count: number
  ): TriviaQuestion[] {
    const pool = this.questions.filter(
      (q) => q.difficultyLevel === difficultyLevel
    );

    // Fisher-Yates shuffle on a copy.
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  /**
   * Finds a question by its id.
   * Returns undefined if not found.
   */
  findById(id: string): TriviaQuestion | undefined {
    return this.questions.find((q) => q.id === id);
  }
}

/** Singleton instance shared across the application. */
export const questionStore = new QuestionStore();
