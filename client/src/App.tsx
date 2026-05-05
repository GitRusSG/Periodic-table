import { useState } from 'react'
import elementsData from './data/elements.json'
import { computeElementWorldPosition } from './components/PeriodicTableGroup/elementPositions'
import { CLASS_COLORS, ZONE_COLORS, type ElementRecord } from './types/game'
import { ClassicPanel } from './panels/ClassicPanel'
import { TriviaPanel } from './panels/TriviaPanel'
import { ShopPanel } from './panels/ShopPanel'
import { BattlePanel } from './panels/BattlePanel'
import { InventoryPanel } from './panels/InventoryPanel'
import { AccountPanel, type Account } from './panels/AccountPanel'
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

type Tab = ActiveMode | 'inventory' | 'account'

export default function App() {
  const [tab, setTab] = useState<Tab>('classic')
  const [selected, setSelected] = useState<ElementRecord | null>(null)
  const [search, setSearch] = useState('')
  const [xp, setXp] = useState(0)
  const [gold, setGold] = useState(50)
  const [inventory, setInventory] = useState<LootItem[]>([])
  const [atkBuff, setAtkBuff] = useState(0)
  const [playerHp, setPlayerHp] = useState(100)
  const [playerHpMax] = useState(100)
  const [nameTags, setNameTags] = useState<{ symbol: string; name: string }[]>([])
  const [account, setAccount] = useState<Account | null>(null)

  const addXP   = (n: number) => setXp(x => x + n)
  const addGold = (n: number) => setGold(g => g + n)
  const spendGold = (n: number) => setGold(g => Math.max(0, g - n))
  const addLoot = (item: LootItem) => setInventory(inv => [...inv, item])

  const awardNameTag = (symbol: string, name: string) => {
    setNameTags(prev => {
      if (prev.some(t => t.symbol === symbol)) return prev
      return [...prev, { symbol, name }]
    })
  }

  const toggleEquip = (id: string) => {
    setInventory(inv => {
      const target = inv.find(i => i.id === id)
      if (!target) return inv
      if (target.equipped) {
        return inv.map(i => i.id === id ? { ...i, equipped: false } : i)
      }
      return inv.map(i => {
        if (i.id === id) return { ...i, equipped: true }
        if (i.slot === target.slot && i.equipped) return { ...i, equipped: false }
        return i
      })
    })
  }

  const heal = (full: boolean) =>
    setPlayerHp(full ? playerHpMax : Math.round(playerHpMax * 0.5))

  const applyAtkBuff = () => setAtkBuff(b => b + 5)

  const equipped = inventory.filter(i => i.equipped)

  const filtered = search.trim()
    ? elements.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.symbol.toLowerCase().includes(search.toLowerCase()) ||
        String(e.atomicNumber).includes(search))
    : elements

  const getColor = (el: ElementRecord) =>
    (tab === 'classic' || tab === 'inventory' || tab === 'account')
      ? (CLASS_COLORS[el.classification] ?? '#fff')
      : (ZONE_COLORS[el.zone] ?? '#fff')

  const legendEntries =
    (tab === 'classic' || tab === 'inventory' || tab === 'account')
      ? Object.entries(CLASS_COLORS).map(([k, v]) => [k.replace(/_/g, ' '), v])
      : Object.entries(ZONE_COLORS)

  const mode: ActiveMode = (tab === 'inventory' || tab === 'account') ? 'classic' : tab

  const isFullPage = tab === 'inventory' || tab === 'account'

  return (
    <div className="app">
      {/* ── Header ── */}
      <div className="header">
        <span className="logo">⚛ Periodic Table 3D</span>
        <input className="search" placeholder="Search…" value={search}
          onChange={e => setSearch(e.target.value)} />
        <div className="modes">
          {(['classic','trivia','game','inventory','account'] as Tab[]).map(t => (
            <button key={t}
              className={`mode-btn${tab === t ? ' active' : ''}`}
              onClick={() => { setTab(t); setSelected(null) }}>
              {t === 'classic'   ? '🔬 Classic'
               : t === 'trivia'  ? '🧠 Trivia'
               : t === 'game'    ? '⚔️ Game'
               : t === 'inventory' ? `🎒 Bag (${inventory.length})`
               : account ? `👤 ${account.username}` : '👤 Account'}
            </button>
          ))}
        </div>
        <div className="header-stats">
          <span className="xp-badge">⭐ {xp}</span>
          <span className="gold-badge">🪙 {gold}</span>
          <span className="hp-badge">❤️ {playerHp}/{playerHpMax}</span>
          {nameTags.length > 0 && <span className="tag-badge">🏷 {nameTags.length}</span>}
        </div>
      </div>

      {/* ── Mode description ── */}
      <div className="mode-bar">
        {tab === 'classic'   && '🔬 Classic — explore elements and their properties.'}
        {tab === 'trivia'    && '🧠 Trivia — answer questions to earn XP and 🪙 gold.'}
        {tab === 'game'      && '⚔️ Game — battle elements. Noble gases are shops. ⚔️ Attack builds mana · 💥 Special costs 30💧 · 🛡 Defend blocks + builds mana.'}
        {tab === 'inventory' && '🎒 Inventory — equip items to boost your battle stats.'}
        {tab === 'account'   && '👤 Account — save progress, log in, view leaderboard.'}
      </div>

      {/* ── Full-page tabs ── */}
      {tab === 'inventory' && (
        <div className="inv-page">
          <InventoryPanel inventory={inventory} gold={gold}
            onEquip={toggleEquip} onClose={() => setTab('classic')} />
        </div>
      )}

      {tab === 'account' && (
        <div className="inv-page">
          <AccountPanel
            currentXp={xp} currentGold={gold}
            loggedIn={account}
            onLogin={acc => setAccount(acc)}
            onLogout={() => setAccount(null)}
            onClose={() => setTab('classic')} />
        </div>
      )}

      {/* ── Periodic table ── */}
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
                    onClick={() => setSelected(isSel ? null : el)}
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

          {/* Name tag toast */}
          {nameTags.length > 0 && (
            <div className="nametag-strip">
              🏷 Tags: {nameTags.map(t => t.symbol).join(' · ')}
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
              onClose={() => setSelected(null)} onXP={addXP} onGold={addGold}
              onLoot={addLoot} onNameTag={awardNameTag}
              equipped={equipped} atkBuff={atkBuff} />
          )}
        </>
      )}
    </div>
  )
}
