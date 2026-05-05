import { useState, useEffect } from 'react'
import { dbGetFlexProfiles, dbUpsertFlex, type FlexProfile } from '../supabase'
import { RARITY_COLORS } from '../types/game'
import type { LootItem } from '../gameData'

// Simple PvP simulation using equipped stats
function simulatePvP(
  playerName: string, playerItems: LootItem[],
  opponentName: string, opponentItems: LootItem[],
): { log: string[]; winner: string } {
  const calcStats = (items: LootItem[]) => ({
    hp: 100 + items.filter(i => i.slot === 'armor').reduce((s, i) => s + i.def, 0),
    atk: 12 + items.reduce((s, i) => s + i.atk, 0),
    def: 5 + items.filter(i => i.slot === 'armor').reduce((s, i) => s + i.def, 0),
  })

  let pStats = calcStats(playerItems)
  let oStats = calcStats(opponentItems)
  let pHp = pStats.hp
  let oHp = oStats.hp
  const log: string[] = []
  let turn = 0

  while (pHp > 0 && oHp > 0 && turn < 20) {
    turn++
    const pDmg = Math.max(1, Math.round(pStats.atk * (0.8 + Math.random() * 0.4) - oStats.def * 0.3))
    const oDmg = Math.max(1, Math.round(oStats.atk * (0.8 + Math.random() * 0.4) - pStats.def * 0.3))
    oHp -= pDmg
    pHp -= oDmg
    log.push(`Turn ${turn}: ${playerName} deals ${pDmg} · ${opponentName} deals ${oDmg}`)
    if (oHp <= 0 || pHp <= 0) break
  }

  const winner = oHp <= 0 ? playerName : pHp <= 0 ? opponentName : pStats.atk >= oStats.atk ? playerName : opponentName
  log.push(`🏆 ${winner} wins!`)
  return { log, winner }
}

export function FlexHall({ username, inventory, xp, rebirths, gold, onXP, onGold, onClose }: {
  username: string | null
  inventory: LootItem[]
  xp: number; rebirths: number; gold: number
  onXP: (n: number) => void; onGold: (n: number) => void
  onClose: () => void
}) {
  const [profiles, setProfiles] = useState<FlexProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [pvpTarget, setPvpTarget] = useState<FlexProfile | null>(null)
  const [pvpResult, setPvpResult] = useState<{ log: string[]; winner: string } | null>(null)
  const [msg, setMsg] = useState('')

  const equipped = inventory.filter(i => i.equipped)
  const totalPower = equipped.reduce((s, i) => s + i.atk + i.def + i.spd, 0)

  const load = async () => {
    setLoading(true)
    setProfiles(await dbGetFlexProfiles())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleFlex = async () => {
    if (!username) { setMsg('Log in to flex.'); return }
    await dbUpsertFlex(username, equipped as unknown[], totalPower)
    setMsg('✓ Flex profile updated!')
    load()
  }

  const handlePvP = (opponent: FlexProfile) => {
    if (!username) { setMsg('Log in to challenge players.'); return }
    const opponentItems = (opponent.flex_items as LootItem[]) ?? []
    const result = simulatePvP(username, equipped, opponent.username, opponentItems)
    setPvpTarget(opponent)
    setPvpResult(result)
    if (result.winner === username) {
      onXP(50); onGold(25)
      setMsg(`🏆 You beat @${opponent.username}! +50 XP +25 🪙`)
    } else {
      setMsg(`💀 @${opponent.username} won. No loss — try again!`)
    }
  }

  if (pvpResult && pvpTarget) {
    return (
      <div className="panel">
        <button className="panel-close" onClick={() => { setPvpResult(null); setPvpTarget(null) }}>✕</button>
        <div className="panel-name">⚔️ PvP: {username} vs @{pvpTarget.username}</div>
        <hr className="panel-hr" />
        <div className="battle-log" style={{ maxHeight: 200, overflowY: 'auto' }}>
          {pvpResult.log.map((l, i) => <div key={i} className="log-line">{l}</div>)}
        </div>
        {msg && <div className="shop-msg" style={{ marginTop: 8 }}>{msg}</div>}
        <button className="battle-btn" style={{ marginTop: 10 }} onClick={() => { setPvpResult(null); setPvpTarget(null) }}>
          ← Back to Flex Hall
        </button>
      </div>
    )
  }

  return (
    <div className="panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-name">💪 Flex Hall</div>
      <div className="inv-subtitle">Show off your gear · Challenge players</div>
      <hr className="panel-hr" />

      {/* Your flex */}
      {username && (
        <div className="flex-profile-card my-flex">
          <div className="flex-username">@{username} {rebirths > 0 ? `🔥×${rebirths}` : ''}</div>
          <div className="flex-stats">⭐{xp} XP · 🪙{gold} · 💪{totalPower} power</div>
          <div className="flex-items">
            {equipped.length === 0 && <span style={{ color: '#555', fontSize: '0.75rem' }}>No items equipped</span>}
            {equipped.map(item => (
              <span key={item.id} className="flex-item-badge" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
                {item.symbol} {item.rarity[0]}
              </span>
            ))}
          </div>
          <button className="battle-btn special" style={{ marginTop: 8 }} onClick={handleFlex}>
            💪 Update Flex Profile
          </button>
        </div>
      )}

      {msg && <div className="shop-msg">{msg}</div>}

      <div className="inv-section" style={{ marginTop: 12 }}>All Players ({profiles.length})</div>
      {loading && <div className="inv-empty">Loading…</div>}
      {!loading && profiles.length === 0 && <div className="inv-empty">No flex profiles yet. Be the first!</div>}
      {!loading && profiles.map((p, i) => {
        const items = (p.flex_items as LootItem[]) ?? []
        const isMe = p.username === username
        return (
          <div key={p.username} className={`flex-profile-card${isMe ? ' my-flex' : ''}`}>
            <div className="flex-rank">#{i + 1}</div>
            <div className="flex-username">@{p.username}</div>
            <div className="flex-stats">💪 {p.total_power} power</div>
            <div className="flex-items">
              {items.map((item, j) => (
                <span key={j} className="flex-item-badge" style={{ borderColor: RARITY_COLORS[item.rarity] }}
                  title={`${item.name} — ⚔️${item.atk} 🛡${item.def} ⚡${item.spd}`}>
                  {item.symbol} {item.rarity[0]}
                </span>
              ))}
            </div>
            {!isMe && username && (
              <button className="inv-btn equip" style={{ marginTop: 6 }} onClick={() => handlePvP(p)}>
                ⚔️ Challenge
              </button>
            )}
          </div>
        )
      })}
      <button className="battle-btn flee" style={{ marginTop: 10 }} onClick={load}>🔄 Refresh</button>
    </div>
  )
}
