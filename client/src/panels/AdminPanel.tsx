import { useState } from 'react'
import { generateLoot, rollRarity } from '../gameData'
import type { LootItem } from '../gameData'

// ─── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_USERNAME = 'mendeleev'
const ADMIN_PASSWORD_HASH = String(
  'Moscow'.split('').reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0)
)

function simpleHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return String(h)
}

export function isAdminCredentials(username: string, password: string): boolean {
  return username.toLowerCase() === ADMIN_USERNAME && simpleHash(password) === ADMIN_PASSWORD_HASH
}

// ─── Admin data helpers ───────────────────────────────────────────────────────

interface StoredAccount {
  passwordHash: string; xp: number; gold: number; rebirths: number
}

function loadAccounts(): Record<string, StoredAccount> {
  try { return JSON.parse(localStorage.getItem('pt3d_accounts') ?? '{}') } catch { return {} }
}
function saveAccounts(a: Record<string, StoredAccount>) {
  localStorage.setItem('pt3d_accounts', JSON.stringify(a))
}

function loadBanned(): string[] {
  try { return JSON.parse(localStorage.getItem('pt3d_banned') ?? '[]') } catch { return [] }
}
function saveBanned(b: string[]) {
  localStorage.setItem('pt3d_banned', JSON.stringify(b))
}

function loadGlobalDifficulty(): number {
  return parseFloat(localStorage.getItem('pt3d_difficulty_mult') ?? '1')
}
function saveGlobalDifficulty(n: number) {
  localStorage.setItem('pt3d_difficulty_mult', String(n))
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<'dashboard' | 'players' | 'award' | 'difficulty'>('dashboard')
  const [targetUser, setTargetUser] = useState('')
  const [awardType, setAwardType] = useState<'gold' | 'xp' | 'item' | 'rebirths'>('gold')
  const [awardAmount, setAwardAmount] = useState(100)
  const [msg, setMsg] = useState('')
  const [diffMult, setDiffMult] = useState(loadGlobalDifficulty())

  const accounts = loadAccounts()
  const banned = loadBanned()
  const playerList = Object.keys(accounts).filter(u => u !== ADMIN_USERNAME)

  const doAction = (action: string, username: string) => {
    const u = username.toLowerCase()
    setMsg('')

    if (action === 'ban') {
      if (banned.includes(u)) { setMsg(`${u} is already banned.`); return }
      saveBanned([...banned, u])
      setMsg(`🚫 Banned @${u}`)
    }

    if (action === 'unban') {
      saveBanned(banned.filter(b => b !== u))
      setMsg(`✓ Unbanned @${u}`)
    }

    if (action === 'reset') {
      if (!accounts[u]) { setMsg('User not found.'); return }
      accounts[u] = { ...accounts[u], xp: 0, gold: 50, rebirths: 0 }
      saveAccounts(accounts)
      setMsg(`🔄 Reset @${u} — XP, gold, rebirths cleared.`)
    }

    if (action === 'award') {
      if (!accounts[u]) { setMsg('User not found.'); return }
      if (awardType === 'gold') {
        accounts[u].gold = (accounts[u].gold ?? 0) + awardAmount
        saveAccounts(accounts)
        setMsg(`🪙 Awarded ${awardAmount} gold to @${u}`)
      }
      if (awardType === 'xp') {
        accounts[u].xp = (accounts[u].xp ?? 0) + awardAmount
        saveAccounts(accounts)
        setMsg(`⭐ Awarded ${awardAmount} XP to @${u}`)
      }
      if (awardType === 'rebirths') {
        accounts[u].rebirths = (accounts[u].rebirths ?? 0) + awardAmount
        saveAccounts(accounts)
        setMsg(`🔥 Awarded ${awardAmount} rebirth(s) to @${u}`)
      }
      if (awardType === 'item') {
        // Store a pending item gift in localStorage for the player to claim
        const rarity = rollRarity('Anomalous')
        const item = generateLoot('Au', 'Admin Gift', rarity, 'transition_metal', 200, 3.5, 19.3)
        const key = `pt3d_gift_${u}`
        const existing: LootItem[] = JSON.parse(localStorage.getItem(key) ?? '[]')
        localStorage.setItem(key, JSON.stringify([...existing, item]))
        setMsg(`🎁 Sent ${rarity} item gift to @${u} — they'll receive it on next login.`)
      }
    }
  }

  const applyDifficulty = () => {
    saveGlobalDifficulty(diffMult)
    setMsg(`⚙️ Global difficulty multiplier set to ${diffMult}× for all players.`)
  }

  return (
    <div className="panel admin-panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-name" style={{ color: '#ff7043' }}>
        ⚗️ Admin Panel
        <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: 8 }}>mendeleev</span>
      </div>
      <hr className="panel-hr" />

      {/* Nav */}
      <div className="forge-tabs" style={{ marginBottom: 10 }}>
        {(['dashboard','players','award','difficulty'] as const).map(v => (
          <button key={v} className={`forge-tab${view === v ? ' active' : ''}`} onClick={() => { setView(v); setMsg('') }}>
            {v === 'dashboard' ? '📊' : v === 'players' ? '👥' : v === 'award' ? '🎁' : '⚙️'}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {view === 'dashboard' && (
        <>
          <div className="admin-stat-row"><span>Total players</span><span>{playerList.length}</span></div>
          <div className="admin-stat-row"><span>Banned players</span><span style={{ color: '#ef5350' }}>{banned.length}</span></div>
          <div className="admin-stat-row"><span>Global difficulty</span><span style={{ color: '#ffa726' }}>{diffMult}×</span></div>
          <div className="admin-stat-row"><span>Top XP player</span>
            <span style={{ color: '#ffd54f' }}>
              {playerList.length > 0
                ? '@' + playerList.sort((a, b) => (accounts[b]?.xp ?? 0) - (accounts[a]?.xp ?? 0))[0]
                : '—'}
            </span>
          </div>
          <div className="inv-section" style={{ marginTop: 12 }}>All Players</div>
          {playerList.length === 0 && <div className="inv-empty">No players yet.</div>}
          {playerList.map(u => (
            <div key={u} className="admin-player-row">
              <span className={`admin-player-name${banned.includes(u) ? ' banned' : ''}`}>
                @{u} {banned.includes(u) ? '🚫' : ''}
              </span>
              <span className="admin-player-stats">⭐{accounts[u]?.xp ?? 0} 🪙{accounts[u]?.gold ?? 0} 🔥{accounts[u]?.rebirths ?? 0}</span>
            </div>
          ))}
        </>
      )}

      {/* Players — ban/unban/reset */}
      {view === 'players' && (
        <>
          <div className="inv-section">Ban / Unban / Reset</div>
          <input className="auth-input" placeholder="Username" value={targetUser} onChange={e => setTargetUser(e.target.value)} />
          <div className="battle-actions" style={{ marginBottom: 6 }}>
            <button className="battle-btn flee" onClick={() => doAction('ban', targetUser)}>🚫 Ban</button>
            <button className="battle-btn" onClick={() => doAction('unban', targetUser)}>✓ Unban</button>
          </div>
          <button className="battle-btn" style={{ background: '#b71c1c', marginBottom: 6 }} onClick={() => doAction('reset', targetUser)}>
            🔄 Reset Player
          </button>
          {msg && <div className="shop-msg">{msg}</div>}
          <div className="inv-section" style={{ marginTop: 12 }}>Banned Players</div>
          {banned.length === 0 && <div className="inv-empty">No banned players.</div>}
          {banned.map(u => (
            <div key={u} className="admin-player-row">
              <span className="admin-player-name banned">@{u} 🚫</span>
              <button className="inv-btn equip" onClick={() => { doAction('unban', u) }}>Unban</button>
            </div>
          ))}
        </>
      )}

      {/* Award */}
      {view === 'award' && (
        <>
          <div className="inv-section">Award to Player</div>
          <input className="auth-input" placeholder="Username" value={targetUser} onChange={e => setTargetUser(e.target.value)} />
          <div className="forge-tabs" style={{ marginBottom: 8 }}>
            {(['gold','xp','rebirths','item'] as const).map(t => (
              <button key={t} className={`forge-tab${awardType === t ? ' active' : ''}`} onClick={() => setAwardType(t)}>
                {t === 'gold' ? '🪙' : t === 'xp' ? '⭐' : t === 'rebirths' ? '🔥' : '🎁'}
              </button>
            ))}
          </div>
          {awardType !== 'item' && (
            <input
              className="auth-input"
              type="number"
              placeholder="Amount"
              value={awardAmount}
              onChange={e => setAwardAmount(Number(e.target.value))}
            />
          )}
          {awardType === 'item' && (
            <div className="acc-guest">Will send a random Anomalous-tier item gift to the player.</div>
          )}
          <button className="battle-btn special" onClick={() => doAction('award', targetUser)}>
            🎁 Award {awardType === 'gold' ? `${awardAmount} 🪙` : awardType === 'xp' ? `${awardAmount} ⭐` : awardType === 'rebirths' ? `${awardAmount} 🔥` : 'Item'}
          </button>
          {msg && <div className="shop-msg">{msg}</div>}
        </>
      )}

      {/* Difficulty */}
      {view === 'difficulty' && (
        <>
          <div className="inv-section">Global Difficulty Multiplier</div>
          <div className="acc-guest">
            Affects enemy HP, ATK, and DEF for all players. 1.0 = normal. 2.0 = double difficulty. 0.5 = half difficulty.
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
            <input
              className="auth-input"
              type="range" min="0.25" max="5" step="0.25"
              value={diffMult}
              onChange={e => setDiffMult(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
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

// ─── Export helpers for use in AccountPanel and BattlePanel ──────────────────

export { loadBanned, loadGlobalDifficulty }
