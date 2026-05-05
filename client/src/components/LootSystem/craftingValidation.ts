/**
 * CraftingValidation — pure function module for compound crafting logic.
 *
 * Design spec (section 6.5):
 *   The crafting UI shows available recipes filtered to reagents the user
 *   currently holds. The output item's rarity equals the highest rarity among
 *   the input reagents. If a recipe requires a minimum rarity tier, the UI
 *   disables the craft button and shows the missing requirement.
 *
 * Requirements: 9.11, 9.12
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LootRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

/**
 * A crafting reagent held in the player's inventory.
 * Matches the relevant fields of the full Element_Loot record.
 */
export interface InventoryReagent {
  symbol: string;
  rarity: LootRarity;
  quantity: number;
}

/**
 * A crafting recipe as defined in design section 6.5.
 */
export interface CraftingRecipe {
  /** Required reagents (element symbol + quantity). */
  reagents: { symbol: string; quantity: number }[];
  /** The item produced by this recipe. */
  product: { name: string };
  /**
   * Minimum rarity tier required to craft this recipe.
   * At least one reagent in the player's inventory must meet or exceed this tier.
   */
  minimumRarityRequired: LootRarity;
}

/**
 * Result of validating whether a recipe can be crafted.
 */
export type CraftingValidationResult =
  | { canCraft: true }
  | { canCraft: false; reason: string };

// ---------------------------------------------------------------------------
// Rarity ordering
// ---------------------------------------------------------------------------

/**
 * Numeric rank for each rarity tier (higher = rarer).
 * Used for comparisons throughout this module.
 */
export const RARITY_RANK: Record<LootRarity, number> = {
  Common:    0,
  Uncommon:  1,
  Rare:      2,
  Epic:      3,
  Legendary: 4,
};

/**
 * Ordered list of rarity tiers from lowest to highest.
 */
export const RARITY_ORDER: LootRarity[] = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
];

/**
 * Return true when `rarity` is at least as high as `minimum`.
 */
export function rarityAtLeast(rarity: LootRarity, minimum: LootRarity): boolean {
  return RARITY_RANK[rarity] >= RARITY_RANK[minimum];
}

// ---------------------------------------------------------------------------
// Core validation functions
// ---------------------------------------------------------------------------

/**
 * Determine the rarity of a crafted item.
 *
 * Per design section 6.5 and Requirement 9.11:
 *   "the Loot_Rarity of the crafted item SHALL be determined by the highest
 *    Loot_Rarity tier among the reagents used."
 *
 * Returns the highest rarity among the provided reagents.
 * Throws if the reagents array is empty (cannot craft with no reagents).
 *
 * Requirements: 9.11
 */
export function determineCraftedRarity(reagents: InventoryReagent[]): LootRarity {
  if (reagents.length === 0) {
    throw new Error('Cannot determine crafted rarity: no reagents provided');
  }
  return reagents.reduce<LootRarity>((highest, reagent) => {
    return RARITY_RANK[reagent.rarity] > RARITY_RANK[highest]
      ? reagent.rarity
      : highest;
  }, reagents[0].rarity);
}

/**
 * Validate whether a crafting recipe can be executed given the player's
 * current inventory.
 *
 * Validation rules (design section 6.5, Requirements 9.11, 9.12):
 *
 * 1. The player must hold at least the required quantity of each reagent
 *    symbol listed in the recipe.
 *
 * 2. At least one reagent in the player's inventory must meet or exceed the
 *    recipe's `minimumRarityRequired` tier. If no reagent meets the minimum
 *    rarity, crafting is disabled and a message indicating the missing
 *    requirement is returned.
 *
 * @param recipe   - The recipe to validate.
 * @param inventory - The player's current reagent inventory.
 * @returns `{ canCraft: true }` when all conditions are met, or
 *          `{ canCraft: false, reason: string }` with a descriptive message.
 *
 * Requirements: 9.11, 9.12
 */
export function validateCraftingRecipe(
  recipe: CraftingRecipe,
  inventory: InventoryReagent[],
): CraftingValidationResult {
  // Build a lookup map from symbol → inventory entry for O(1) access.
  const inventoryMap = new Map<string, InventoryReagent>();
  for (const item of inventory) {
    const existing = inventoryMap.get(item.symbol);
    if (existing) {
      // Accumulate quantities if the same symbol appears multiple times.
      inventoryMap.set(item.symbol, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        // Keep the highest rarity for this symbol.
        rarity:
          RARITY_RANK[item.rarity] > RARITY_RANK[existing.rarity]
            ? item.rarity
            : existing.rarity,
      });
    } else {
      inventoryMap.set(item.symbol, { ...item });
    }
  }

  // Rule 1: Check that all required reagent symbols are present in sufficient
  // quantity.
  for (const required of recipe.reagents) {
    const held = inventoryMap.get(required.symbol);
    if (!held || held.quantity < required.quantity) {
      const heldQty = held?.quantity ?? 0;
      return {
        canCraft: false,
        reason: `Missing reagent: ${required.symbol} (need ${required.quantity}, have ${heldQty})`,
      };
    }
  }

  // Rule 2: Check that at least one reagent in the inventory meets the
  // minimum rarity requirement (Requirement 9.12).
  const reagentSymbols = new Set(recipe.reagents.map((r) => r.symbol));
  const recipeReagentsInInventory = inventory.filter((item) =>
    reagentSymbols.has(item.symbol),
  );

  const hasRequiredRarity = recipeReagentsInInventory.some((item) =>
    rarityAtLeast(item.rarity, recipe.minimumRarityRequired),
  );

  if (!hasRequiredRarity) {
    return {
      canCraft: false,
      reason: `Requires at least one ${recipe.minimumRarityRequired} reagent (missing rarity requirement)`,
    };
  }

  return { canCraft: true };
}
