/**
 * Zone Encounter Routing — pure function module.
 *
 * Handles zone-specific encounter behavior as described in design section 5.3:
 *   - Passive: No combat initiated. Opens a service menu (trade, craft, buff, recover).
 *   - Combat: Standard encounter. Behavior pattern selected by chemical group.
 *   - Neutral: Balanced encounter. Standard loot table.
 *   - Boss: High HP, radiation/instability status effects, guaranteed Rare+ loot.
 *   - Anomalous: Randomized mechanics each encounter. Guaranteed Epic or Legendary loot.
 *
 * Requirements: 7.2, 7.5, 7.6
 */

import { createPrng } from './combatEngine';
import type { ZoneType } from './combatEngine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LootRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface LootItem {
  name: string;
  rarity: LootRarity;
  sourceElementAtomicNumber: number;
}

export interface ServiceMenu {
  services: Array<'trade' | 'craft' | 'buff' | 'recover'>;
}

/** Result of routing a zone encounter. */
export type EncounterRouteResult =
  | { type: 'service_menu'; menu: ServiceMenu }
  | { type: 'combat'; zone: Exclude<ZoneType, 'Passive'>; loot: LootItem[] };

export interface EncounterConfig {
  zone: ZoneType;
  elementAtomicNumber: number;
  elementName: string;
  lootRarityTier: LootRarity;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  /** Deterministic seed for loot generation. */
  seed: number;
}

// ---------------------------------------------------------------------------
// Rarity ordering helpers
// ---------------------------------------------------------------------------

const RARITY_ORDER: Record<LootRarity, number> = {
  Common: 0,
  Uncommon: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 4,
};

export function rarityAtLeast(rarity: LootRarity, minimum: LootRarity): boolean {
  return RARITY_ORDER[rarity] >= RARITY_ORDER[minimum];
}

// ---------------------------------------------------------------------------
// Drop table
// ---------------------------------------------------------------------------

/**
 * Base drop rates by rarity tier (design section 6.2).
 */
const BASE_DROP_RATES: Record<LootRarity, number> = {
  Common: 0.70,
  Uncommon: 0.20,
  Rare: 0.07,
  Epic: 0.025,
  Legendary: 0.005,
};

/**
 * Zone multipliers applied to base drop rates (design section 6.2).
 */
const ZONE_MULTIPLIERS: Record<Exclude<ZoneType, 'Passive'>, Record<LootRarity, number>> = {
  Combat: { Common: 1.0, Uncommon: 1.0, Rare: 1.0, Epic: 1.0, Legendary: 1.0 },
  Neutral: { Common: 1.0, Uncommon: 1.0, Rare: 1.0, Epic: 1.0, Legendary: 1.0 },
  Boss: { Common: 1.0, Uncommon: 1.5, Rare: 3.0, Epic: 5.0, Legendary: 8.0 },
  Anomalous: { Common: 0.5, Uncommon: 0.8, Rare: 1.5, Epic: 3.0, Legendary: 6.0 },
};

export interface DropTable {
  zone: Exclude<ZoneType, 'Passive'>;
  entries: Array<{ rarity: LootRarity; weight: number }>;
}

/**
 * Build a weighted drop table for the given zone and difficulty level.
 *
 * Requirements: 9.2, 9.3, 9.6, 9.7
 */
export function DetermineDropTable(
  zone: Exclude<ZoneType, 'Passive'>,
  difficultyLevel: number,
): DropTable {
  const multipliers = ZONE_MULTIPLIERS[zone];
  const rarities: LootRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  // Difficulty scales up higher-rarity weights slightly.
  const difficultyBonus = (difficultyLevel - 1) * 0.01;

  const entries = rarities.map((rarity) => {
    const base = BASE_DROP_RATES[rarity];
    const mult = multipliers[rarity];
    // Higher rarities get a small bonus from difficulty.
    const rarityIndex = RARITY_ORDER[rarity];
    const weight = base * mult * (1 + rarityIndex * difficultyBonus);
    return { rarity, weight };
  });

  return { zone, entries };
}

/**
 * Roll a single loot item rarity from the drop table using the PRNG.
 *
 * Uses weighted random selection: pick a random value in [0, totalWeight)
 * and walk the entries until the cumulative weight exceeds the roll.
 */
function rollRarity(dropTable: DropTable, prng: () => number): LootRarity {
  const totalWeight = dropTable.entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = prng() * totalWeight;

  for (const entry of dropTable.entries) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.rarity;
    }
  }

  // Fallback (should not be reached with valid weights).
  return 'Common';
}

/**
 * Roll a set of loot drops from the drop table.
 *
 * For Boss zone: re-rolls until at least one Rare+ item is present.
 * For Anomalous zone: re-rolls until at least one Epic+ item is present.
 *
 * Requirements: 9.6, 9.7
 */
export function RollDrops(
  dropTable: DropTable,
  elementAtomicNumber: number,
  elementName: string,
  seed: number,
  itemCount = 3,
): LootItem[] {
  const prng = createPrng(seed);

  const rollBatch = (): LootItem[] => {
    const items: LootItem[] = [];
    for (let i = 0; i < itemCount; i++) {
      const rarity = rollRarity(dropTable, prng);
      items.push({
        name: `${elementName} ${rarity} Drop`,
        rarity,
        sourceElementAtomicNumber: elementAtomicNumber,
      });
    }
    return items;
  };

  let items = rollBatch();

  // Boss guarantee: at least one Rare+ item.
  if (dropTable.zone === 'Boss') {
    let attempts = 0;
    while (!items.some((item) => rarityAtLeast(item.rarity, 'Rare')) && attempts < 100) {
      items = rollBatch();
      attempts++;
    }
    // If still no Rare+ after max attempts, force one.
    if (!items.some((item) => rarityAtLeast(item.rarity, 'Rare'))) {
      items[0] = {
        name: `${elementName} Rare Artifact`,
        rarity: 'Rare',
        sourceElementAtomicNumber: elementAtomicNumber,
      };
    }
  }

  // Anomalous guarantee: at least one Epic+ item.
  if (dropTable.zone === 'Anomalous') {
    let attempts = 0;
    while (!items.some((item) => rarityAtLeast(item.rarity, 'Epic')) && attempts < 100) {
      items = rollBatch();
      attempts++;
    }
    // If still no Epic+ after max attempts, force one.
    if (!items.some((item) => rarityAtLeast(item.rarity, 'Epic'))) {
      items[0] = {
        name: `${elementName} Epic Anomaly`,
        rarity: 'Epic',
        sourceElementAtomicNumber: elementAtomicNumber,
      };
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Zone encounter router
// ---------------------------------------------------------------------------

/**
 * Route a zone encounter based on the element's zone type.
 *
 * - Passive zone: returns a service menu without initiating combat (Req 7.2).
 * - All other zones: initiates combat and generates loot (Req 7.3–7.6).
 *
 * Requirements: 7.2, 7.5, 7.6
 */
export function routeZoneEncounter(config: EncounterConfig): EncounterRouteResult {
  if (config.zone === 'Passive') {
    // Req 7.2: present trading, crafting upgrade, passive buff, and recovery
    // services without initiating combat.
    return {
      type: 'service_menu',
      menu: {
        services: ['trade', 'craft', 'buff', 'recover'],
      },
    };
  }

  // For all combat zones, generate loot.
  const dropTable = DetermineDropTable(config.zone, config.difficultyLevel);
  const loot = RollDrops(
    dropTable,
    config.elementAtomicNumber,
    config.elementName,
    config.seed,
  );

  return {
    type: 'combat',
    zone: config.zone,
    loot,
  };
}
