import { useState, useEffect } from 'react'
import {
  dbGetListings, dbPostListing, dbCancelListing, dbBuyListing,
  type TradeListing,
} from '../supabase'
import { RARITY_COLORS } from '../types/game'
import type { LootItem } from '../gameData'

export function TradingHall({ username, gold, inventory, onGoldChange, onInventoryChange, onClose }: {
  username: string | null
  gold: number
  inventory: LootItem[]
  onGoldChange: (delta: number) => void
  onInventoryChange: (add?: LootItem, removeId?: string) => void
  onClose: () => void
}) {
  const [listings, setListings] = useState<TradeListing[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'browse' | 'sell'>('browse')
  const [sellItem, setSellItem] = useState<string>('')
  const [sellPrice, setSellPrice] = useState(50)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    setListings(await dbGetListings())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const myListings = listings.filter(l => l.seller === username)
  const otherListings = listings.filter(l => l.seller !== username)
  const sellableItems = inventory.filter(i => !i.equipped)

  const handleSell = async () => {
    if (!username) { setMsg('Log in to sell items.'); return }
    const item = inventory.find(i => i.id === sellItem)
    if (!item) { setMsg('Select an item.'); return }
    if (sellPrice < 1) { setMsg('Price must be at least 1 gold.'); return }
    await dbPostListing(username, item, sellPrice)
    onInventoryChange(undefined, item.id)
    setMsg(`Listed "${item.name}" for 🪙${sellPrice}`)
    setSellItem('')
    load()
  }

  const handleBuy = async (listing: TradeListing) => {
    if (!username) { setMsg('Log in to buy items.'); return }
    if (gold < listing.price) { setMsg('Not enough gold!'); return }
    const result = await dbBuyListing(listing.id)
    if (!result) { setMsg('Item already sold.'); load(); return }
    onGoldChange(-listing.price)
    onInventoryChange(result.item as LootItem)
    setMsg(`Bought "${(result.item as LootItem).name}" for 🪙${listing.price}!`)
    load()
  }

  const handleCancel = async (id: string) => {
    const listing = listings.find(l => l.id === id)
    if (!listing) return
    await dbCancelListing(id)
    // Return item to inventory
    onInventoryChange(listing.item as LootItem)
    setMsg('Listing cancelled — item returned.')
    load()
  }

  const getItem = (l: TradeListing) => l.item as LootItem

  return (
    <div className="panel trading-panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-name">🏪 Trading Hall</div>
      <div className="inv-subtitle">🪙 {gold} gold available</div>
      <div className="forge-tabs" style={{ marginBottom: 10 }}>
        <button className={`forge-tab${tab === 'browse' ? ' active' : ''}`} onClick={() => setTab('browse')}>🛒 Browse</button>
        <button className={`forge-tab${tab === 'sell' ? ' active' : ''}`} onClick={() => setTab('sell')}>💰 Sell</button>
      </div>
      <hr className="panel-hr" />

      {loading && <div className="inv-empty">Loading listings…</div>}

      {!loading && tab === 'browse' && (
        <>
          {myListings.length > 0 && (
            <>
              <div className="inv-section">Your Listings</div>
              {myListings.map(l => {
                const item = getItem(l)
                return (
                  <div key={l.id} className="trade-row">
                    <span className="inv-rarity-dot" style={{ background: RARITY_COLORS[item.rarity] }} />
                    <div className="inv-info">
                      <div className="inv-name">{item.name}</div>
                      <div className="inv-stats">⚔️{item.atk} 🛡{item.def} ⚡{item.spd}</div>
                    </div>
                    <span className="trade-price">🪙{l.price}</span>
                    <button className="inv-btn unequip" onClick={() => handleCancel(l.id)}>Cancel</button>
                  </div>
                )
              })}
            </>
          )}
          <div className="inv-section">All Listings ({otherListings.length})</div>
          {otherListings.length === 0 && <div className="inv-empty">No items for sale. Be the first to list!</div>}
          {otherListings.map(l => {
            const item = getItem(l)
            return (
              <div key={l.id} className="trade-row">
                <span className="inv-rarity-dot" style={{ background: RARITY_COLORS[item.rarity] }} />
                <div className="inv-info">
                  <div className="inv-name">{item.name}</div>
                  <div className="inv-stats">⚔️{item.atk} 🛡{item.def} ⚡{item.spd} · @{l.seller}</div>
                </div>
                <span className="trade-price">🪙{l.price}</span>
                <button
                  className={`inv-btn equip${gold < l.price ? ' disabled' : ''}`}
                  disabled={gold < l.price}
                  onClick={() => handleBuy(l)}
                >Buy</button>
              </div>
            )
          })}
          <button className="battle-btn flee" style={{ marginTop: 10 }} onClick={load}>🔄 Refresh</button>
        </>
      )}

      {!loading && tab === 'sell' && (
        <>
          {!username && <div className="acc-guest">Log in to sell items.</div>}
          {username && (
            <>
              <div className="inv-section">Select item to sell</div>
              {sellableItems.length === 0 && <div className="inv-empty">No unequipped items to sell.</div>}
              {sellableItems.map(item => (
                <div key={item.id}
                  className={`inv-item${sellItem === item.id ? ' equipped-item' : ''}`}
                  onClick={() => setSellItem(item.id)}
                  style={{ cursor: 'pointer' }}>
                  <span className="inv-rarity-dot" style={{ background: RARITY_COLORS[item.rarity] }} />
                  <div className="inv-info">
                    <div className="inv-name">{item.name}</div>
                    <div className="inv-stats">⚔️{item.atk} 🛡{item.def} ⚡{item.spd} · {item.rarity}</div>
                  </div>
                  {sellItem === item.id && <span style={{ color: '#66bb6a' }}>✓</span>}
                </div>
              ))}
              <div className="inv-section" style={{ marginTop: 10 }}>Price (gold)</div>
              <input className="auth-input" type="number" min="1" value={sellPrice}
                onChange={e => setSellPrice(Number(e.target.value))} />
              <button className="battle-btn special" onClick={handleSell} disabled={!sellItem}>
                💰 List for 🪙{sellPrice}
              </button>
            </>
          )}
        </>
      )}
      {msg && <div className="shop-msg">{msg}</div>}
    </div>
  )
}
