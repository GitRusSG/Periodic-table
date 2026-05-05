import { RARITY_COLORS } from '../types/game'
import type { LootItem } from '../gameData'

export function InventoryPanel({ inventory, gold, onEquip, onClose }: {
  inventory: LootItem[]; gold: number
  onEquip: (id: string) => void; onClose: () => void
}) {
  const equipped = inventory.filter(i => i.equipped)
  const bag = inventory.filter(i => !i.equipped)

  return (
    <div className="panel inventory-panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-name">🎒 Inventory</div>
      <div className="inv-subtitle">{inventory.length} items · 🪙 {gold} gold</div>

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
            <div key={item.id} className="inv-item">
              <span className="inv-rarity-dot" style={{ background: RARITY_COLORS[item.rarity] }} />
              <div className="inv-info">
                <div className="inv-name">{item.name}</div>
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
