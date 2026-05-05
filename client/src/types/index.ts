// Shared TypeScript interfaces for the Periodic Table 3D Game

// ─── Element Classification ───────────────────────────────────────────────────

export type ElementClassification =
  | "alkali_metal"
  | "alkaline_earth_metal"
  | "transition_metal"
  | "post_transition_metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble_gas"
  | "lanthanide"
  | "actinide";

// ─── Zone and Rarity ──────────────────────────────────────────────────────────

export type ZoneType = "Passive" | "Combat" | "Neutral" | "Boss" | "Anomalous";

export type LootRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

// ─── Sub-types ────────────────────────────────────────────────────────────────

export interface Isotope {
  massNumber: number;
  abundance: number | null; // natural abundance %, null if synthetic
  halfLife: string | null;  // null if stable
}

export interface IonForm {
  charge: number;
  notation: string; // e.g. "Fe²⁺"
}

// ─── Core Element Interface ───────────────────────────────────────────────────

export interface Element {
  // Identity
  atomicNumber: number;          // 1–118
  symbol: string;                // e.g. "Fe"
  name: string;                  // e.g. "Iron"

  // Periodic table position
  group: number | null;          // 1–18, null for lanthanides/actinides
  period: number;                // 1–7
  block: "s" | "p" | "d" | "f";
  classification: ElementClassification;

  // Physical/chemical properties (used for stat derivation)
  atomicMass: number;            // unified atomic mass units
  density: number | null;        // g/cm³ at STP
  electronegativity: number | null; // Pauling scale
  electronConfiguration: string; // e.g. "[Ar] 3d6 4s2"
  electronShells: number[];      // e.g. [2, 8, 14, 2]
  oxidationStates: number[];
  isotopes: Isotope[];
  ionForms: IonForm[];

  // Abundance (drives Loot_Rarity)
  crustalAbundancePpm: number | null;
  cosmicAbundance: number | null;
  isSynthetic: boolean;
  isRadioactive: boolean;

  // Game classification
  zone: ZoneType;
  lootRarity: LootRarity;
}

// ─── Loot System ─────────────────────────────────────────────────────────────

export interface LootStatBlock {
  attack: number;
  defense: number;
  energy: number;
  weight: number;
  debuffPotency: number;
}

export interface CraftingRecipe {
  reagents: { symbol: string; quantity: number }[];
  product: CraftedItem;
  minimumRarityRequired: LootRarity;
}

export interface CraftedItem {
  name: string;
  description: string;
  rarity: LootRarity;
  stats: LootStatBlock;
  specialEffect?: string;
}

export interface InventoryItem {
  id: string;
  elementAtomicNumber: number;
  name: string;
  description: string;
  rarity: LootRarity;
  stats: LootStatBlock;
  category: "equipment_offensive" | "equipment_defensive" | "crafting_reagent" | "passive_buff" | "unstable_artifact";
  specialEffect?: string;
  uniqueAbility?: string;
}

// ─── Name Tag System ──────────────────────────────────────────────────────────

export interface NameTag {
  elementAtomicNumber: number;
  elementSymbol: string;
  elementName: string;
  abilityDescription: string;
  abilityType: "regeneration" | "defense" | "speed" | "attack" | "debuff" | "special";
}

// ─── Progression ─────────────────────────────────────────────────────────────

export interface ProgressionState {
  xpByDifficulty: Record<1 | 2 | 3 | 4 | 5, number>;
  unlockedDifficulties: Set<1 | 2 | 3 | 4 | 5>;
  masteredElements: Set<number>;       // atomic numbers
  nameTags: NameTag[];
  equippedNameTag: number | null;      // atomic number
  inventory: InventoryItem[];
}

// ─── Mode System ─────────────────────────────────────────────────────────────

export type ActiveMode = "classic" | "trivia" | "game";

export interface ModeState {
  active: ActiveMode;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

// ─── Combat System ───────────────────────────────────────────────────────────

export type CombatActionType = "attack" | "defend" | "special" | "flee";

export interface CombatAction {
  type: CombatActionType;
  sourceId: string;       // player or element atomicNumber as string
  targetId: string;
  modifiers: string[];    // e.g. ["electronegativity_debuff", "density_armor"]
}

export type StatusEffectType =
  | "radiation"
  | "corrosion"
  | "stagger"
  | "debuff"
  | "buff"
  | "regeneration";

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;       // turns remaining
  magnitude: number;
}

export interface TurnResult {
  damageDealt: number;
  damageTaken: number;
  statusEffectsApplied: StatusEffect[];
  narrative: string;      // e.g. "Iron's high density absorbs 12 damage"
}

export type CombatPhase =
  | "Idle"
  | "EncounterInit"
  | "EncounterActive"
  | "PlayerTurn"
  | "ElementTurn"
  | "PlayerWin"
  | "PlayerDefeat";

export interface EncounterConfig {
  zone: ZoneType;
  elementAtomicNumber: number;
  difficultyLevel: number;
  lootRarityTier: LootRarity;
}

export interface CombatState {
  phase: CombatPhase;
  playerHp: number;
  playerMaxHp: number;
  elementHp: number;
  elementMaxHp: number;
  playerStatusEffects: StatusEffect[];
  elementStatusEffects: StatusEffect[];
  turn: number;
  encounterId: string | null;
  seed: number | null;
  config: EncounterConfig | null;
}
