import { useState, useEffect } from 'react'
import {
  dbGetAllPlayers, dbBanPlayer, dbResetPlayer,
  dbAwardPlayer, dbSendGift, dbGetDifficulty, dbSetDifficulty,
  type DBPlayer,
} from '../supabase'
import { generateLoot, rollRarity } from '../gameData'

const ADMIN_USERNAME = 'mendeleev'
const ADMIN_PASSWORD_HASH = String(
  'Moscow'.split('').reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0)
)

export function isAdminCredentials(username: string, password: string): boolean {
  let h = 0
  for (let i = 0; i < password.length; i++) h = (Math.imul(31, h) + password.charCodeAt(i)) | 0
  return username.toLowerCase() === ADMIN_USERNAME && String(h) === ADMIN_PASSWORD_HASH
}

export function AdminPanel({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const [view, setView] = useState<'dashboard' | 'players' | 'award' | 'difficulty'>('dashboard')
  const [players, setPlayers] = useState<DBPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [targetUser, setTargetUser] = useState('')
  const [awardType, setAwardType] = useState<'gold' | 'xp' | 'rebirths' | 'item'>('gold')
  const [awardAmount, setAwardAmount] = useState(100)
  const [diffMult, setDiffMult] = useState(1)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [p, d] = await Promise.all([dbGetAllPlayers(), dbGetDifficulty()])
    setPlayers(p)
    setDiffMult(d)
    setLoading(false)
  }

  const banned = players.filter(p => p.is_banned)
  const active = players.filter(p => !p.is_banned)

  const doAction = async (action: string, username: string) => {
    setMsg('')
    const u = username.toLowerCase().trim()
    if (!u) { setMsg('Enter a username.'); return }

    if (action === 'ban') {
      await dbBanPlayer(u, true)
      setMsg(`🚫 Banned @${u}`)
      loadData()
    }
    if (action === 'unban') {
      await dbBanPlayer(u, false)
      setMsg(`✓ Unbanned @${u}`)
      loadData()
    }
    if (action === 'reset') {
      await dbResetPlayer(u)
      setMsg(`🔄 Reset @${u} — XP, gold, inventory cleared.`)
      loadData()
    }
    if (action === 'award') {
      if (awardType === 'item') {
        const rarity = rollRarity('Anomalous')
        const item = generateLoot('Au', 'Admin Gift', rarity, 'transition_metal', 200, 3.5, 19.3)
        await dbSendGift(u, item)
        setMsg(`🎁 Sent ${rarity} item to @${u} — they'll receive it on next login.`)
      } else {
        await dbAwardPlayer(u, awardType, awardAmount)
        setMsg(`✓ Awarded ${awardAmount} ${awardType} to @${u}`)
        loadData()
      }
    }
  }

  const applyDifficulty = async () => {
    await dbSetDifficulty(diffMult)
    setMsg(`⚙️ Global difficulty set to ${diffMult}× for all players.`)
  }

  return (
    <div className="panel admin-panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-name" style={{ color: '#ff7043' }}>
        ⚗️ Admin Panel
        <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: 8 }}>mendeleev · Supabase</span>
      </div>
      <hr className="panel-hr" />
      <button className="battle-btn flee" style={{ marginBottom: 10 }} onClick={() => { onLogout(); onClose() }}>
        🚪 Log Out
      </button>

      <div className="forge-tabs" style={{ marginBottom: 10 }}>
        {(['dashboard','players','award','difficulty'] as const).map(v => (
          <button key={v} className={`forge-tab${view === v ? ' active' : ''}`}
            onClick={() => { setView(v); setMsg('') }}>
            {v === 'dashboard' ? '📊' : v === 'players' ? '👥' : v === 'award' ? '🎁' : '⚙️'}
          </button>
        ))}
      </div>

      {loading && <div className="inv-empty">Loading from database…</div>}

      {!loading && view === 'dashboard' && (
        <>
          <div className="admin-stat-row"><span>Total players</span><span>{players.length}</span></div>
          <div className="admin-stat-row"><span>Active</span><span style={{ color: '#66bb6a' }}>{active.length}</span></div>
          <div className="admin-stat-row"><span>Banned</span><span style={{ color: '#ef5350' }}>{banned.length}</span></div>
          <div className="admin-stat-row"><span>Global difficulty</span><span style={{ color: '#ffa726' }}>{diffMult}×</span></div>
          <div className="inv-section" style={{ marginTop: 12 }}>All Players</div>
          {active.map(p => (
            <div key={p.username} className="admin-player-row">
              <span className="admin-player-name">@{p.username} {p.rebirths > 0 ? `🔥×${p.rebirths}` : ''}</span>
              <span className="admin-player-stats">⭐{p.xp} 🪙{p.gold}</span>
            </div>
          ))}
          <button className="battle-btn flee" style={{ marginTop: 10 }} onClick={loadData}>🔄 Refresh</button>
        </>
      )}

      {!loading && view === 'players' && (
        <>
          <div className="inv-section">Ban / Unban / Reset</div>
          <input className="auth-input" placeholder="Username" value={targetUser} onChange={e => setTargetUser(e.target.value)} />
          <div className="battle-actions" style={{ marginBottom: 6 }}>
            <button className="battle-btn flee" onClick={() => doAction('ban', targetUser)}>🚫 Ban</button>
            <button className="battle-btn" onClick={() => doAction('unban', targetUser)}>✓ Unban</button>
          </div>
          <button className="battle-btn" style={{ background: '#b71c1c', marginBottom: 6 }}
            onClick={() => doAction('reset', targetUser)}>🔄 Reset Player</button>
          {msg && <div className="shop-msg">{msg}</div>}
          {banned.length > 0 && (
            <>
              <div className="inv-section" style={{ marginTop: 12 }}>Banned Players</div>
              {banned.map(p => (
                <div key={p.username} className="admin-player-row">
                  <span className="admin-player-name banned">@{p.username} 🚫</span>
                  <button className="inv-btn equip" onClick={() => doAction('unban', p.username)}>Unban</button>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {!loading && view === 'award' && (
        <>
          <div className="inv-section">Award to Player</div>
          <input className="auth-input" placeholder="Username" value={targetUser} onChange={e => setTargetUser(e.target.value)} />
          <div className="forge-tabs" style={{ marginBottom: 8 }}>
            {(['gold','xp','rebirths','item'] as const).map(t => (
              <button key={t} className={`forge-tab${awardType === t ? ' active' : ''}`}
                onClick={() => setAwardType(t)}>
                {t === 'gold' ? '🪙 Gold' : t === 'xp' ? '⭐ XP' : t === 'rebirths' ? '🔥 Rebirth' : '🎁 Item'}
              </button>
            ))}
          </div>
          {awardType !== 'item' && (
            <input className="auth-input" type="number" placeholder="Amount"
              value={awardAmount} onChange={e => setAwardAmount(Number(e.target.value))} />
          )}
          {awardType === 'item' && (
            <div className="acc-guest">Sends a random Anomalous-tier item. Player receives it on next login.</div>
          )}
          <button className="battle-btn special" onClick={() => doAction('award', targetUser)}>
            🎁 Award {awardType !== 'item' ? `${awardAmount} ${awardType}` : 'Item'}
          </button>
          {msg && <div className="shop-msg">{msg}</div>}
        </>
      )}

      {!loading && view === 'difficulty' && (
        <>
          <div className="inv-section">Global Difficulty Multiplier</div>
          <div className="acc-guest">Affects all enemy stats for every player. Current: {diffMult}×</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
            <input type="range" min="0.25" max="5" step="0.25" value={diffMult}
              onChange={e => setDiffMult(parseFloat(e.target.value))}
              style={{ flex: 1 }} />
            <span style={{ color: '#ffa726', fontWeight: 700, minWidth: 40 }}>{diffMult}×</span>
          </div>
          <div className="battle-stats" style={{ marginBottom: 10 }}>
            {[0.5, 1, 1.5, 2, 3, 5].map(v => (
              <button key={v} className={`stat-chip${diffMult === v ? ' player-chip' : ''}`}
                onClick={() => setDiffMult(v)}>{v}×</button>
            ))}
          </div>
          <button className="battle-btn special" onClick={applyDifficulty}>⚙️ Apply to All Players</button>
          {msg && <div className="shop-msg">{msg}</div>}
        </>
      )}
    </div>
  )
}

export { dbGetDifficulty as loadGlobalDifficulty }
