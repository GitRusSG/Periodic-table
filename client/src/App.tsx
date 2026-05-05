import { useState, useCallback, useEffect } from 'react'
import elementsData from './data/elements.json'
import { computeElementWorldPosition } from './components/PeriodicTableGroup/elementPositions'
import { CLASS_COLORS, ZONE_COLORS, type ElementRecord } from './types/game'
import { ClassicPanel } from './panels/ClassicPanel'
import { TriviaPanel } from './panels/TriviaPanel'
import { ShopPanel } from './panels/ShopPanel'
import { BattlePanel } from './panels/BattlePanel'
import { InventoryPanel } from './panels/InventoryPanel'
import { AccountPanel, type Account } from './panels/AccountPanel'
import { ForgePanel } from './panels/ForgePanel'
import { Confetti } from './components/Confetti'
import { checkTriggers, createEggState, recordClick, type EggTriggerState } from './easterEggs'
import type { LootItem } from './gameData'
import type { ActiveMode } from './types/index'
import './App.css'

const elements = elementsData as ElementRecord[]
const CELL = 52

const positions = elements.map(el => {
  const pos = computeElementWorldPosition({
    atomicNumber: el.atomicNumber, group: el.group,
    period: el.period, classification: el.classification,
  })
  return { el, col: Math.round(pos.x / 2.5), row: Math.round(pos.y / 2.5) }
})
const maxCol = Math.max(...positions.map(p => p.col))
const maxRow = Math.max(...positions.map(p => p.row))

type Tab = ActiveMode | 'inventory' | 'account' | 'forge'

// ─── Persistence helpers ──────────────────────────────────────────────────────

interface SavedState {
  xp: number; gold: number; rebirths: number
  inventory: LootItem[]
  nameTags: { symbol: string; name: string }[]
  discoveredEggs: string[]
  atkBuff: number
}

function loadSave(): SavedState | null {
  try {
    const raw = localStorage.getItem('pt3d_save')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeSave(s: SavedState) {
  try { localStorage.setItem('pt3d_save', JSON.stringify(s)) } catch {}
}

export default function App() {
  const saved = loadSave()
  const [tab, setTab] = useState<Tab>('classic')
  const [selected, setSelected] = useState<ElementRecord | null>(null)
  const [search, setSearch] = useState('')
  const [xp, setXp] = useState(saved?.xp ?? 0)
  const [gold, setGold] = useState(saved?.gold ?? 50)
  const [inventory, setInventory] = useState<LootItem[]>(saved?.inventory ?? [])
  const [atkBuff, setAtkBuff] = useState(saved?.atkBuff ?? 0)
  const [playerHp, setPlayerHp] = useState(100)
  const [playerHpMax] = useState(100)
  const [nameTags, setNameTags] = useState<{ symbol: string; name: string }[]>(saved?.nameTags ?? [])
  const [account, setAccount] = useState<Account | null>(null)
  const [rebirths, setRebirths] = useState(saved?.rebirths ?? 0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [easterEgg, setEasterEgg] = useState<{ title: string; message: string } | null>(null)
  const [discoveredEggs, setDiscoveredEggs] = useState<string[]>(saved?.discoveredEggs ?? [])
  const [eggState, setEggState] = useState<EggTriggerState>(createEggState())

  const addXP = (n: number) => setXp(x => x + n)
  const addGold = (n: number) => setGold(g => g + n)
  const spendGold = (n: number) => setGold(g => Math.max(0, g - n))
  const addLoot = (item: LootItem) => setInventory(inv => [...inv, item])

  // Auto-save whenever key state changes
  useEffect(() => {
    writeSave({ xp, gold, rebirths, inventory, nameTags, discoveredEggs, atkBuff })
  }, [xp, gold, rebirths, inventory, nameTags, discoveredEggs, atkBuff])

  const awardNameTag = (symbol: string, name: string) => {
    setNameTags(prev => prev.some(t => t.symbol === symbol) ? prev : [...prev, { symbol, name }])
  }

  // Claim any pending admin gift items on login
  const claimGifts = (username: string) => {
    const key = `pt3d_gift_${username}`
    const gifts: LootItem[] = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (gifts.length > 0) {
      setInventory(inv => [...inv, ...gifts])
      localStorage.removeItem(key)
    }
  }

  const handleRebirth = () => {
    if (xp < 5000) return
    // Reset everything except rebirths count
    setXp(0)
    setGold(50)
    setInventory([])
    setAtkBuff(0)
    setPlayerHp(100)
    setNameTags([])
    setDiscoveredEggs([])
    setRebirths(r => r + 1)
  }

  const toggleEquip = useCallback((id: string) => {
    setInventory(inv => {
      const target = inv.find(i => i.id === id)
      if (!target) return inv
      if (target.equipped) return inv.map(i => i.id === id ? { ...i, equipped: false } : i)
      return inv.map(i => {
        if (i.id === id) return { ...i, equipped: true }
        if (i.slot === target.slot && i.equipped) return { ...i, equipped: false }
        return i
      })
    })
  }, [])

  const equipBest = useCallback(() => {
    setInventory(inv => {
      const slots = ['weapon', 'armor', 'accessory'] as const
      const bestIds = new Set<string>()
      for (const slot of slots) {
        const candidates = inv.filter(i => i.slot === slot)
        if (candidates.length === 0) continue
        const best = candidates.reduce((a, b) =>
          (b.atk + b.def + b.spd) > (a.atk + a.def + a.spd) ? b : a
        )
        bestIds.add(best.id)
      }
      return inv.map(i => ({
        ...i,
        equipped: bestIds.has(i.id),
      }))
    })
  }, [])

  const heal = (full: boolean) => setPlayerHp(full ? playerHpMax : Math.round(playerHpMax * 0.5))
  const applyAtkBuff = () => setAtkBuff(b => b + 5)

  const handleForge = (consumedIds: string[], result: LootItem) => {
    setInventory(inv => [...inv.filter(i => !consumedIds.includes(i.id)), result])
  }

  const handleSell = (id: string, price: number) => {
    setInventory(inv => inv.filter(i => i.id !== id))
    addGold(price)
  }

  const handleVictory = (xpGain: number, goldGain: number, loot: LootItem, symbol: string, name: string) => {
    addXP(xpGain)
    addGold(goldGain)
    addLoot(loot)
    awardNameTag(symbol, name)
    setShowConfetti(true)
  }

  // Easter egg check on element click — uses sequence tracker, no visible hints
  const handleElementClick = (el: ElementRecord) => {
    setSelected(prev => prev?.atomicNumber === el.atomicNumber ? null : el)
    const newEggState = recordClick(eggState, el.symbol)
    setEggState(newEggState)
    const triggered = checkTriggers(newEggState, discoveredEggs)
    if (triggered) {
      setDiscoveredEggs(prev => [...prev, triggered.id])
      setEasterEgg({ title: triggered.title, message: triggered.message })
      addGold(triggered.goldReward)
      addXP(triggered.xpReward)
    }
  }

  const equipped = inventory.filter(i => i.equipped)

  const filtered = search.trim()
    ? elements.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.symbol.toLowerCase().includes(search.toLowerCase()) ||
        String(e.atomicNumber).includes(search))
    : elements

  const getColor = (el: ElementRecord) =>
    (tab === 'classic' || tab === 'inventory' || tab === 'account' || tab === 'forge')
      ? (CLASS_COLORS[el.classification] ?? '#fff')
      : (ZONE_COLORS[el.zone] ?? '#fff')

  const legendEntries =
    (tab === 'classic' || tab === 'inventory' || tab === 'account' || tab === 'forge')
      ? Object.entries(CLASS_COLORS).map(([k, v]) => [k.replace(/_/g, ' '), v])
      : Object.entries(ZONE_COLORS)

  const mode: ActiveMode = (['inventory', 'account', 'forge'] as Tab[]).includes(tab) ? 'classic' : tab as ActiveMode
  const isFullPage = (['inventory', 'account', 'forge'] as Tab[]).includes(tab)

  return (
    <div className="app">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {/* Easter egg toast */}
      {easterEgg && (
        <div className="easter-egg-toast" onClick={() => setEasterEgg(null)}>
          <div className="egg-title">{easterEgg.title}</div>
          <div className="egg-msg">{easterEgg.message}</div>
          <div className="egg-close">tap to dismiss</div>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <span className="logo">⚛ Periodic Table 3D</span>
        <input className="search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="modes">
          {(['classic','trivia','game','inventory','forge','account'] as Tab[]).map(t => (
            <button key={t}
              className={`mode-btn${tab === t ? ' active' : ''}`}
              onClick={() => { setTab(t); setSelected(null) }}>
              {t === 'classic'   ? '🔬 Classic'
               : t === 'trivia'  ? '🧠 Trivia'
               : t === 'game'    ? '⚔️ Game'
               : t === 'inventory' ? `🎒 Bag (${inventory.length})`
               : t === 'forge'   ? '⚒️ Forge'
               : account ? `👤 ${account.username}${rebirths > 0 ? ` 🔥×${rebirths}` : ''}` : '👤 Account'}
            </button>
          ))}
        </div>
        <div className="header-stats">
          <span className="xp-badge">⭐ {xp}</span>
          <span className="gold-badge">🪙 {gold}</span>
          <span className="hp-badge">❤️ {playerHp}/{playerHpMax}</span>
          {rebirths > 0 && <span className="tag-badge">🔥 ×{rebirths}</span>}
          {nameTags.length > 0 && <span className="tag-badge">🏷 {nameTags.length}</span>}
          {discoveredEggs.length > 0 && <span className="tag-badge">🥚 {discoveredEggs.length}</span>}
        </div>
      </div>

      {/* Mode bar */}
      <div className="mode-bar">
        {tab === 'classic'   && '🔬 Classic — explore elements. Easter eggs hidden in certain elements!'}
        {tab === 'trivia'    && '🧠 Trivia — answer questions to earn XP and 🪙 gold.'}
        {tab === 'game'      && `⚔️ Game — battle elements. Rebirth ×${rebirths} active (+${rebirths * 20}% dmg, enemies ${rebirths * 35}% stronger).`}
        {tab === 'inventory' && '🎒 Inventory — equip items. Use ⚡ Equip Best to auto-equip your strongest gear.'}
        {tab === 'forge'     && '⚒️ Forge — combine reagents into equipment. Sell unwanted items to the NPC.'}
        {tab === 'account'   && '👤 Account — save progress, share with friends, view leaderboard, rebirth.'}
      </div>

      {/* Full-page tabs */}
      {tab === 'inventory' && (
        <div className="inv-page">
          <InventoryPanel inventory={inventory} gold={gold}
            onEquip={toggleEquip} onEquipBest={equipBest} onClose={() => setTab('classic')} />
        </div>
      )}

      {tab === 'forge' && (
        <div className="inv-page">
          <ForgePanel inventory={inventory} gold={gold}
            onClose={() => setTab('classic')} onForge={handleForge} onSell={handleSell} />
        </div>
      )}

      {tab === 'account' && (
        <div className="inv-page">
          <AccountPanel
            currentXp={xp} currentGold={gold} currentRebirths={rebirths}
            loggedIn={account}
            onLogin={acc => { setAccount(acc); claimGifts(acc.username) }}
            onLogout={() => setAccount(null)}
            onRebirth={handleRebirth}
            onClose={() => setTab('classic')} />
        </div>
      )}

      {/* Periodic table */}
      {!isFullPage && (
        <>
          <div className="table-scroll">
            <div className="table-grid" style={{
              width: maxCol * CELL + CELL + 8,
              height: maxRow * CELL + CELL + 8,
              position: 'relative',
            }}>
              {positions.map(({ el, col, row }) => {
                const color = getColor(el)
                const isSel = selected?.atomicNumber === el.atomicNumber
                const isDim = search.trim() !== '' && !filtered.includes(el)
                return (
                  <button key={el.atomicNumber}
                    className={`cell${isSel ? ' selected' : ''}${isDim ? ' dimmed' : ''}`}
                    style={{
                      left: col * CELL + 4, top: row * CELL + 4,
                      width: CELL - 4, height: CELL - 4,
                      borderColor: color,
                      background: isSel ? color : `${color}22`,
                      color: isSel ? '#000' : color,
                    }}
                    onClick={() => handleElementClick(el)}
                    title={`${el.name} — ${el.classification.replace(/_/g, ' ')}`}>
                    <span className="cell-num">{el.atomicNumber}</span>
                    <span className="cell-sym">{el.symbol}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="legend">
            {legendEntries.map(([label, color]) => (
              <div key={label} className="legend-item">
                <span className="dot" style={{ background: color }} />{label}
              </div>
            ))}
          </div>

          {/* Name tag strip */}
          {nameTags.length > 0 && (
            <div className="nametag-strip">
              🏷 {nameTags.map(t => t.symbol).join(' · ')}
            </div>
          )}

          {/* Panels — key resets state per element */}
          {selected && mode === 'classic' && (
            <ClassicPanel key={selected.atomicNumber} el={selected} onClose={() => setSelected(null)} />
          )}
          {selected && mode === 'trivia' && (
            <TriviaPanel key={selected.atomicNumber} el={selected}
              onClose={() => setSelected(null)} onXP={addXP} onGold={addGold} />
          )}
          {selected && mode === 'game' && selected.zone === 'Passive' && (
            <ShopPanel key={selected.atomicNumber} el={selected} gold={gold}
              onClose={() => setSelected(null)} onSpend={spendGold}
              onHeal={heal} onBuff={applyAtkBuff} onLoot={addLoot} />
          )}
          {selected && mode === 'game' && selected.zone !== 'Passive' && (
            <BattlePanel key={selected.atomicNumber} el={selected}
              onClose={() => setSelected(null)}
              onXP={addXP} onGold={addGold}
              onLoot={addLoot} onNameTag={awardNameTag}
              equipped={equipped} atkBuff={atkBuff} rebirths={rebirths} />
          )}
        </>
      )}
    </div>
  )
}
