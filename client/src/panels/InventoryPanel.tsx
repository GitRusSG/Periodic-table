import { RARITY_COLORS } from '../types/game'
import type { LootItem, LootRarity } from '../gameData'

const RARITY_ORDER: LootRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
const rarityScore = (r: LootRarity) => RARITY_ORDER.indexOf(r)

// For each slot, find the item with the highest total stats
function bestPerSlot(inventory: LootItem[]): Record<string, string> {
  const slots = ['weapon', 'armor', 'accessory']
  const result: Record<string, string> = {}
  for (const slot of slots) {
    const candidates = inventory.filter(i => i.slot === slot)
    if (candidates.length === 0) continue
    const best = candidates.reduce((a, b) => {
      const scoreA = a.atk + a.def + a.spd + rarityScore(a.rarity) * 10
      const scoreB = b.atk + b.def + b.spd + rarityScore(b.rarity) * 10
      return scoreB > scoreA ? b : a
    })
    result[slot] = best.id
  }
  return result
}

export function InventoryPanel({ inventory, gold, onEquip, onEquipBest, onClose }: {
  inventory: LootItem[]
  gold: number
  onEquip: (id: string) => void
  onEquipBest: () => void
  onClose: () => void
}) {
  const equipped = inventory.filter(i => i.equipped)
  const bag = inventory.filter(i => !i.equipped)
  const best = bestPerSlot(inventory)

  return (
    <div className="panel inventory-panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-name">🎒 Inventory</div>
      <div className="inv-subtitle">{inventory.length} items · 🪙 {gold} gold</div>

      <button
        className="battle-btn special"
        style={{ marginBottom: 10, width: '100%' }}
        onClick={onEquipBest}
        title="Automatically equip the highest-scoring weapon, armor, and accessory"
      >
        ⚡ Equip Best
      </button>

      {equipped.length > 0 && (
        <>
          <div className="inv-section">⚡ Equipped</div>
          {equipped.map(item => (
            <div key={item.id} className="inv-item equipped-item">
              <span className="inv-rarity-dot" style={{ background: RARITY_COLORS[item.rarity] }} />
              <div className="inv-info">
                <div className="inv-name">{item.name}</div>
                <div className="inv-stats">⚔️{item.atk} 🛡{item.def} ⚡{item.spd} · {item.slot}</div>
              </div>
              <button className="inv-btn unequip" onClick={() => onEquip(item.id)}>Unequip</button>
            </div>
          ))}
        </>
      )}

      {bag.length > 0 && (
        <>
          <div className="inv-section">🎒 Bag</div>
          {bag.map(item => (
            <div key={item.id} className={`inv-item${best[item.slot] === item.id ? ' best-item' : ''}`}>
              <span className="inv-rarity-dot" style={{ background: RARITY_COLORS[item.rarity] }} />
              <div className="inv-info">
                <div className="inv-name">
                  {item.name}
                  {best[item.slot] === item.id && <span className="best-badge">★ Best</span>}
                </div>
                <div className="inv-stats">⚔️{item.atk} 🛡{item.def} ⚡{item.spd} · {item.slot}</div>
                {item.description && <div className="inv-desc">{item.description}</div>}
              </div>
              {item.slot !== 'reagent' && (
                <button className="inv-btn equip" onClick={() => onEquip(item.id)}>Equip</button>
              )}
            </div>
          ))}
        </>
      )}

      {inventory.length === 0 && (
        <div className="inv-empty">No items yet.<br />Win battles to earn loot!</div>
      )}
    </div>
  )
}
