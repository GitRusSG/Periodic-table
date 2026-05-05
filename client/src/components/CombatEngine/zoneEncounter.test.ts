/**
 * Unit tests for zone encounter routing.
 *
 * Tests:
 *   - Passive zone opens service menu without initiating combat (Req 7.2)
 *   - Boss zone guarantees at least one Rare+ loot item (Req 7.5)
 *   - Anomalous zone guarantees at least one Epic+ loot item (Req 7.6)
 *
 * Requirements: 7.2, 7.5, 7.6
 */

import { describe, it, expect } from 'vitest';
import {
  routeZoneEncounter,
  DetermineDropTable,
  RollDrops,
  rarityAtLeast,
  LootRarity,
  EncounterConfig,
} from './zoneEncounter';

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const baseConfig: Omit<EncounterConfig, 'zone'> = {
  elementAtomicNumber: 92,
  elementName: 'Uranium',
  lootRarityTier: 'Epic',
  difficultyLevel: 3,
  seed: 12345,
};

// ---------------------------------------------------------------------------
// Req 7.2 — Passive zone: service menu, no combat
// ---------------------------------------------------------------------------

describe('Zone Routing — Passive zone (Req 7.2)', () => {
  it('returns a service_menu result for a Passive zone element', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Passive' });

    expect(result.type).toBe('service_menu');
  });

  it('does NOT return a combat result for a Passive zone element', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Passive' });

    expect(result.type).not.toBe('combat');
  });

  it('service menu includes all four services: trade, craft, buff, recover', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Passive' });

    expect(result.type).toBe('service_menu');
    if (result.type === 'service_menu') {
      expect(result.menu.services).toContain('trade');
      expect(result.menu.services).toContain('craft');
      expect(result.menu.services).toContain('buff');
      expect(result.menu.services).toContain('recover');
    }
  });

  it('service menu contains exactly the four expected services', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Passive' });

    expect(result.type).toBe('service_menu');
    if (result.type === 'service_menu') {
      expect(result.menu.services).toHaveLength(4);
      expect(result.menu.services.sort()).toEqual(['buff', 'craft', 'recover', 'trade']);
    }
  });

  it('Passive zone does not generate any loot', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Passive' });

    // A service_menu result has no loot property.
    expect(result).not.toHaveProperty('loot');
  });

  it('Noble Gas element (Helium) in Passive zone returns service menu', () => {
    const heliumConfig: EncounterConfig = {
      zone: 'Passive',
      elementAtomicNumber: 2,
      elementName: 'Helium',
      lootRarityTier: 'Common',
      difficultyLevel: 1,
      seed: 99,
    };

    const result = routeZoneEncounter(heliumConfig);

    expect(result.type).toBe('service_menu');
  });
});

// ---------------------------------------------------------------------------
// Req 7.5 — Boss zone: guaranteed Rare+ loot
// ---------------------------------------------------------------------------

describe('Zone Routing — Boss zone (Req 7.5)', () => {
  it('returns a combat result for a Boss zone element', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Boss' });

    expect(result.type).toBe('combat');
  });

  it('Boss zone encounter includes at least one Rare+ loot item', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Boss' });

    expect(result.type).toBe('combat');
    if (result.type === 'combat') {
      const hasRarePlus = result.loot.some((item) =>
        rarityAtLeast(item.rarity, 'Rare'),
      );
      expect(hasRarePlus).toBe(true);
    }
  });

  it('Boss zone loot guarantee holds across multiple seeds', () => {
    // Test with 50 different seeds to ensure the guarantee is robust.
    for (let seed = 0; seed < 50; seed++) {
      const result = routeZoneEncounter({ ...baseConfig, zone: 'Boss', seed });

      expect(result.type).toBe('combat');
      if (result.type === 'combat') {
        const hasRarePlus = result.loot.some((item) =>
          rarityAtLeast(item.rarity, 'Rare'),
        );
        expect(hasRarePlus).toBe(true);
      }
    }
  });

  it('Boss zone loot guarantee holds for all difficulty levels', () => {
    const difficulties: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

    for (const difficultyLevel of difficulties) {
      const result = routeZoneEncounter({
        ...baseConfig,
        zone: 'Boss',
        difficultyLevel,
        seed: 777,
      });

      expect(result.type).toBe('combat');
      if (result.type === 'combat') {
        const hasRarePlus = result.loot.some((item) =>
          rarityAtLeast(item.rarity, 'Rare'),
        );
        expect(hasRarePlus).toBe(true);
      }
    }
  });

  it('RollDrops for Boss zone always contains at least one Rare+ item', () => {
    const dropTable = DetermineDropTable('Boss', 3);

    // Test with 100 different seeds.
    for (let seed = 0; seed < 100; seed++) {
      const items = RollDrops(dropTable, 92, 'Uranium', seed);
      const hasRarePlus = items.some((item) => rarityAtLeast(item.rarity, 'Rare'));
      expect(hasRarePlus).toBe(true);
    }
  });

  it('Boss zone loot items have the correct source element', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Boss' });

    expect(result.type).toBe('combat');
    if (result.type === 'combat') {
      result.loot.forEach((item) => {
        expect(item.sourceElementAtomicNumber).toBe(baseConfig.elementAtomicNumber);
      });
    }
  });

  it('Boss zone drop table has higher Rare/Epic/Legendary weights than Neutral', () => {
    const bossTable = DetermineDropTable('Boss', 1);
    const neutralTable = DetermineDropTable('Neutral', 1);

    const bossRareWeight = bossTable.entries.find((e) => e.rarity === 'Rare')!.weight;
    const neutralRareWeight = neutralTable.entries.find((e) => e.rarity === 'Rare')!.weight;

    expect(bossRareWeight).toBeGreaterThan(neutralRareWeight);
  });
});

// ---------------------------------------------------------------------------
// Req 7.6 — Anomalous zone: guaranteed Epic+ loot
// ---------------------------------------------------------------------------

describe('Zone Routing — Anomalous zone (Req 7.6)', () => {
  it('returns a combat result for an Anomalous zone element', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Anomalous' });

    expect(result.type).toBe('combat');
  });

  it('Anomalous zone encounter includes at least one Epic+ loot item', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Anomalous' });

    expect(result.type).toBe('combat');
    if (result.type === 'combat') {
      const hasEpicPlus = result.loot.some((item) =>
        rarityAtLeast(item.rarity, 'Epic'),
      );
      expect(hasEpicPlus).toBe(true);
    }
  });

  it('Anomalous zone loot guarantee holds across multiple seeds', () => {
    // Test with 50 different seeds to ensure the guarantee is robust.
    for (let seed = 0; seed < 50; seed++) {
      const result = routeZoneEncounter({ ...baseConfig, zone: 'Anomalous', seed });

      expect(result.type).toBe('combat');
      if (result.type === 'combat') {
        const hasEpicPlus = result.loot.some((item) =>
          rarityAtLeast(item.rarity, 'Epic'),
        );
        expect(hasEpicPlus).toBe(true);
      }
    }
  });

  it('Anomalous zone loot guarantee holds for all difficulty levels', () => {
    const difficulties: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

    for (const difficultyLevel of difficulties) {
      const result = routeZoneEncounter({
        ...baseConfig,
        zone: 'Anomalous',
        difficultyLevel,
        seed: 888,
      });

      expect(result.type).toBe('combat');
      if (result.type === 'combat') {
        const hasEpicPlus = result.loot.some((item) =>
          rarityAtLeast(item.rarity, 'Epic'),
        );
        expect(hasEpicPlus).toBe(true);
      }
    }
  });

  it('RollDrops for Anomalous zone always contains at least one Epic+ item', () => {
    const dropTable = DetermineDropTable('Anomalous', 3);

    // Test with 100 different seeds.
    for (let seed = 0; seed < 100; seed++) {
      const items = RollDrops(dropTable, 118, 'Oganesson', seed);
      const hasEpicPlus = items.some((item) => rarityAtLeast(item.rarity, 'Epic'));
      expect(hasEpicPlus).toBe(true);
    }
  });

  it('Anomalous zone loot items have the correct source element', () => {
    const result = routeZoneEncounter({ ...baseConfig, zone: 'Anomalous' });

    expect(result.type).toBe('combat');
    if (result.type === 'combat') {
      result.loot.forEach((item) => {
        expect(item.sourceElementAtomicNumber).toBe(baseConfig.elementAtomicNumber);
      });
    }
  });

  it('Anomalous zone drop table has higher Epic/Legendary weights than Neutral', () => {
    const anomalousTable = DetermineDropTable('Anomalous', 1);
    const neutralTable = DetermineDropTable('Neutral', 1);

    const anomalousEpicWeight = anomalousTable.entries.find((e) => e.rarity === 'Epic')!.weight;
    const neutralEpicWeight = neutralTable.entries.find((e) => e.rarity === 'Epic')!.weight;

    expect(anomalousEpicWeight).toBeGreaterThan(neutralEpicWeight);
  });

  it('Anomalous zone guarantee is stricter than Boss (Epic+ vs Rare+)', () => {
    // Anomalous requires Epic+, Boss only requires Rare+.
    // Any Anomalous loot set satisfying Epic+ also satisfies Rare+.
    for (let seed = 0; seed < 20; seed++) {
      const result = routeZoneEncounter({ ...baseConfig, zone: 'Anomalous', seed });

      expect(result.type).toBe('combat');
      if (result.type === 'combat') {
        const hasEpicPlus = result.loot.some((item) =>
          rarityAtLeast(item.rarity, 'Epic'),
        );
        const hasRarePlus = result.loot.some((item) =>
          rarityAtLeast(item.rarity, 'Rare'),
        );
        // Epic+ implies Rare+ (since Epic > Rare in the ordering).
        expect(hasEpicPlus).toBe(true);
        expect(hasRarePlus).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// rarityAtLeast helper tests
// ---------------------------------------------------------------------------

describe('rarityAtLeast helper', () => {
  it('Common is at least Common', () => {
    expect(rarityAtLeast('Common', 'Common')).toBe(true);
  });

  it('Common is NOT at least Rare', () => {
    expect(rarityAtLeast('Common', 'Rare')).toBe(false);
  });

  it('Rare is at least Rare', () => {
    expect(rarityAtLeast('Rare', 'Rare')).toBe(true);
  });

  it('Epic is at least Rare', () => {
    expect(rarityAtLeast('Epic', 'Rare')).toBe(true);
  });

  it('Legendary is at least Epic', () => {
    expect(rarityAtLeast('Legendary', 'Epic')).toBe(true);
  });

  it('Uncommon is NOT at least Rare', () => {
    expect(rarityAtLeast('Uncommon', 'Rare')).toBe(false);
  });

  it('Rare is NOT at least Epic', () => {
    expect(rarityAtLeast('Rare', 'Epic')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Non-Passive zones return combat results
// ---------------------------------------------------------------------------

describe('Zone Routing — non-Passive zones return combat', () => {
  const combatZones: Array<Exclude<EncounterConfig['zone'], 'Passive'>> = [
    'Combat',
    'Neutral',
    'Boss',
    'Anomalous',
  ];

  for (const zone of combatZones) {
    it(`${zone} zone returns a combat result`, () => {
      const result = routeZoneEncounter({ ...baseConfig, zone });

      expect(result.type).toBe('combat');
    });

    it(`${zone} zone result includes a non-empty loot array`, () => {
      const result = routeZoneEncounter({ ...baseConfig, zone });

      expect(result.type).toBe('combat');
      if (result.type === 'combat') {
        expect(result.loot.length).toBeGreaterThan(0);
      }
    });
  }
});
