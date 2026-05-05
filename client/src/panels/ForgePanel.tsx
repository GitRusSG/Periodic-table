import { useState } from 'react'
import { RARITY_COLORS } from '../types/game'
import type { LootItem, LootRarity } from '../gameData'
import { generateLoot } from '../gameData'

const RARITY_ORDER: LootRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
const SELL_PRICES: Record<LootRarity, number> = {
  Common: 5, Uncommon: 15, Rare: 40, Epic: 100, Legendary: 300,
}

// Forge recipes: [reagent symbols needed] → product name
const FORGE_RECIPES = [
  { reagents: ['Fe', 'C'],       name: 'Steel Blade',         minRarity: 'Common'   as LootRarity },
  { reagents: ['Cu', 'Sn'],      name: 'Bronze Shield',       minRarity: 'Uncommon' as LootRarity },
  { reagents: ['Au', 'Ag'],      name: 'Electrum Ring',       minRarity: 'Rare'     as LootRarity },
  { reagents: ['Nd', 'Fe', 'B'], name: 'Neodymium Core',      minRarity: 'Epic'     as LootRarity },
  { reagents: ['Og', 'Fl'],      name: 'Exotic Matter Shard', minRarity: 'Legendary' as LootRarity },
  { reagents: ['Na', 'Cl'],      name: 'Salt Crystal',        minRarity: 'Common'   as LootRarity },
  { reagents: ['H', 'O'],        name: 'Water Essence',       minRarity: 'Common'   as LootRarity },
  { reagents: ['Si', 'O'],       name: 'Quartz Lens',         minRarity: 'Uncommon' as LootRarity },
  { reagents: ['Ti', 'N'],       name: 'Titanium Nitride Edge', minRarity: 'Rare'   as LootRarity },
  { reagents: ['Pt', 'Ir'],      name: 'Iridium-Platinum Alloy', minRarity: 'Epic'  as LootRarity },
]

function highestRarity(items: LootItem[]): LootRarity {
  let best = 0
  for (const item of items) {
    const idx = RARITY_ORDER.indexOf(item.rarity)
    if (idx > best) best = idx
  }
  return RARITY_ORDER[best]
}

export function ForgePanel({ inventory, gold, onClose, onForge, onSell }: {
  inventory: LootItem[]
  gold: number
  onClose: () => void
  onForge: (consumed: string[], result: LootItem) => void
  onSell: (id: string, price: number) => void
}) {
  const [tab, setTab] = useState<'forge' | 'sell'>('forge')
  const [selected, setSelected] = useState<string[]>([])
  const [msg, setMsg] = useState('')

  const reagents = inventory.filter(i => i.slot === 'reagent')
  const sellable = inventory.filter(i => !i.equipped)

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectedItems = inventory.filter(i => selected.includes(i.id))
  const selectedSymbols = selectedItems.map(i => i.symbol).sort()

  const matchingRecipe = FORGE_RECIPES.find(r => {
    const needed = [...r.reagents].sort()
    return JSON.stringify(needed) === JSON.stringify(selectedSymbols)
  })

  const handleForge = () => {
    if (!matchingRecipe) { setMsg('No recipe matches these reagents.'); return }
    const rarity = highestRarity(selectedItems)
    const ridx = RARITY_ORDER.indexOf(rarity)
    const minIdx = RARITY_ORDER.indexOf(matchingRecipe.minRarity)
    if (ridx < minIdx) { setMsg(`Need at least ${matchingRecipe.minRarity} rarity reagent.`); return }

    // Use first selected item's element data for the forged item
    const base = selectedItems[0]
    const result = generateLoot(base.symbol, matchingRecipe.name, rarity, 'transition_metal', 100, 2, 8)
    const forgedItem: LootItem = { ...result, name: matchingRecipe.name, slot: 'weapon' }
    onForge(selected, forgedItem)
    setSelected([])
    setMsg(`⚒️ Forged: ${matchingRecipe.name} (${rarity})!`)
  }

  return (
    <div className="panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-name">⚒️ Forge & Vendor</div>
      <div className="inv-subtitle">🪙 {gold} gold</div>
      <div className="forge-tabs">
        <button className={`forge-tab${tab === 'forge' ? ' active' : ''}`} onClick={() => setTab('forge')}>⚒️ Forge</button>
        <button className={`forge-tab${tab === 'sell' ? ' active' : ''}`} onClick={() => setTab('sell')}>💰 Sell</button>
      </div>
      <hr className="panel-hr" />

      {tab === 'forge' && (
        <>
          <div className="inv-section">Select reagents to forge</div>
          {reagents.length === 0 && <div className="inv-empty">No reagents. Win battles to collect them.</div>}
          {reagents.map(item => (
            <div key={item.id} className={`inv-item${selected.includes(item.id) ? ' equipped-item' : ''}`}
              onClick={() => toggleSelect(item.id)} style={{ cursor: 'pointer' }}>
              <span className="inv-rarity-dot" style={{ background: RARITY_COLORS[item.rarity] }} />
              <div className="inv-info">
                <div className="inv-name">{item.name}</div>
                <div className="inv-stats">{item.symbol} · {item.rarity}</div>
              </div>
              {selected.includes(item.id) && <span style={{ color: '#66bb6a', fontSize: '1rem' }}>✓</span>}
            </div>
          ))}
          {selected.length >= 2 && (
            <div className="forge-preview">
              {matchingRecipe
                ? <span style={{ color: '#66bb6a' }}>✓ Recipe: {matchingRecipe.name}</span>
                : <span style={{ color: '#ef5350' }}>✗ No recipe for this combination</span>}
            </div>
          )}
          <button className="battle-btn" style={{ marginTop: 8 }} onClick={handleForge} disabled={selected.length < 2}>
            ⚒️ Forge
          </button>
          {msg && <div className="shop-msg">{msg}</div>}
          <div className="inv-section" style={{ marginTop: 12 }}>Known Recipes</div>
          {FORGE_RECIPES.map(r => (
            <div key={r.name} className="recipe-row">
              <span className="recipe-reagents">{r.reagents.join(' + ')}</span>
              <span className="recipe-arrow">→</span>
              <span className="recipe-name">{r.name}</span>
              <span className="recipe-rarity" style={{ color: RARITY_COLORS[r.minRarity] }}>{r.minRarity}+</span>
            </div>
          ))}
        </>
      )}

      {tab === 'sell' && (
        <>
          <div className="inv-section">Sell items to the NPC</div>
          {sellable.length === 0 && <div className="inv-empty">Nothing to sell.</div>}
          {sellable.map(item => (
            <div key={item.id} className="inv-item">
              <span className="inv-rarity-dot" style={{ background: RARITY_COLORS[item.rarity] }} />
              <div className="inv-info">
                <div className="inv-name">{item.name}</div>
                <div className="inv-stats">{item.rarity} · {item.slot}</div>
              </div>
              <button className="inv-btn equip" onClick={() => { onSell(item.id, SELL_PRICES[item.rarity]); setMsg(`Sold for 🪙${SELL_PRICES[item.rarity]}!`) }}>
                🪙{SELL_PRICES[item.rarity]}
              </button>
            </div>
          ))}
          {msg && <div className="shop-msg">{msg}</div>}
        </>
      )}
    </div>
  )
}
