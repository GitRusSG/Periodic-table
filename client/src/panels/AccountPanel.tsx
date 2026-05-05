import { useState } from 'react'
import { AdminPanel, isAdminCredentials } from './AdminPanel'
import {
  dbRegister, dbLogin, dbSave, dbGetLeaderboard, dbClaimGifts,
} from '../supabase'
import type { LootItem } from '../gameData'

export interface Account {
  username: string
  xp: number
  gold: number
  rebirths: number
  isAdmin?: boolean
}

function simpleHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return String(h)
}

function makeShareCode(username: string, xp: number, gold: number, rebirths: number): string {
  return btoa(JSON.stringify({ username, xp, gold, rebirths }))
}

const REBIRTH_XP_REQUIRED = 5000

interface Props {
  currentXp: number; currentGold: number; currentRebirths: number
  currentInventory: LootItem[]; currentNameTags: { symbol: string; name: string }[]
  currentDiscoveredEggs: string[]; currentAtkBuff: number
  loggedIn: Account | null
  onLogin: (acc: Account, gifts: LootItem[]) => void
  onLogout: () => void; onRebirth: () => void; onClose: () => void
}

export function AccountPanel({
  currentXp, currentGold, currentRebirths,
  currentInventory, currentNameTags, currentDiscoveredEggs, currentAtkBuff,
  loggedIn, onLogin, onLogout, onRebirth, onClose,
}: Props) {
  const [view, setView] = useState<'menu' | 'login' | 'register' | 'leaderboard' | 'share' | 'rebirth' | 'admin'>('menu')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [leaderboard, setLeaderboard] = useState<{ username: string; xp: number; rebirths: number }[]>([])

  const handleRegister = async () => {
    setError(''); setSuccess(''); setLoading(true)
    if (!username.trim() || !password.trim()) { setError('Fill in all fields.'); setLoading(false); return }
    if (username.length < 3) { setError('Username must be 3+ characters.'); setLoading(false); return }
    if (password.length < 6) { setError('Password must be 6+ characters.'); setLoading(false); return }
    if (username.toLowerCase() === 'mendeleev') { setError('That username is reserved.'); setLoading(false); return }
    const { error: err } = await dbRegister(username, simpleHash(password))
    setLoading(false)
    if (err) { setError(err); return }
    setSuccess('Account created! You can now log in.')
    setView('login')
  }

  const handleLogin = async () => {
    setError(''); setSuccess(''); setLoading(true)
    if (isAdminCredentials(username, password)) {
      setLoading(false)
      onLogin({ username: 'mendeleev', xp: 0, gold: 0, rebirths: 0, isAdmin: true }, [])
      setView('admin')
      return
    }
    const { player, error: err } = await dbLogin(username, simpleHash(password))
    if (err || !player) { setError(err ?? 'Login failed.'); setLoading(false); return }
    // Claim any pending gifts
    const gifts = await dbClaimGifts(player.username)
    setLoading(false)
    onLogin({
      username: player.username, xp: player.xp,
      gold: player.gold, rebirths: player.rebirths,
    }, gifts as LootItem[])
    setSuccess(`Welcome back, ${player.username}!`)
    setView('menu')
  }

  const handleSave = async () => {
    if (!loggedIn || loggedIn.isAdmin) return
    setLoading(true)
    await dbSave(loggedIn.username, {
      xp: currentXp, gold: currentGold, rebirths: currentRebirths,
      inventory: currentInventory as unknown[],
      name_tags: currentNameTags as unknown[],
      discovered_eggs: currentDiscoveredEggs,
      atk_buff: currentAtkBuff,
    })
    setLoading(false)
    setSuccess('Progress saved! ✓')
  }

  const handleLoadLeaderboard = async () => {
    setLoading(true)
    const lb = await dbGetLeaderboard()
    setLeaderboard(lb)
    setLoading(false)
    setView('leaderboard')
  }

  const canRebirth = currentXp >= REBIRTH_XP_REQUIRED

  if (view === 'admin' || loggedIn?.isAdmin) {
    return <AdminPanel onClose={onClose} />
  }

  return (
    <div className="panel account-panel">
      <button className="panel-close" onClick={onClose}>✕</button>

      {view === 'menu' && (
        <>
          <div className="panel-name">👤 Account</div>
          <hr className="panel-hr" />
          {loggedIn ? (
            <>
              <div className="acc-info">
                <div className="acc-username">
                  @{loggedIn.username}
                  {currentRebirths > 0 && <span className="rebirth-badge">🔥×{currentRebirths}</span>}
                </div>
                <div className="acc-stats">⭐ {currentXp} XP · 🪙 {currentGold} · 🔥 {currentRebirths} rebirths</div>
              </div>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={handleSave} disabled={loading}>
                {loading ? 'Saving…' : '💾 Save Progress'}
              </button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={handleLoadLeaderboard}>🏆 Leaderboard</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => setView('share')}>🔗 Share Code</button>
              <button
                className={`battle-btn${canRebirth ? ' special' : ''}`}
                style={{ marginBottom: 6, opacity: canRebirth ? 1 : 0.5 }}
                onClick={() => setView('rebirth')}
              >
                🔥 Rebirth {canRebirth ? '(Ready!)' : `(Need ${REBIRTH_XP_REQUIRED} XP)`}
              </button>
              <button className="battle-btn flee" onClick={() => { onLogout(); setSuccess('Logged out.') }}>🚪 Log Out</button>
              {success && <div className="shop-msg">{success}</div>}
            </>
          ) : (
            <>
              <div className="acc-guest">Log in to save progress and appear on the global leaderboard.</div>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => { setView('login'); setError(''); setSuccess('') }}>🔑 Log In</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => { setView('register'); setError(''); setSuccess('') }}>✨ Create Account</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={handleLoadLeaderboard}>🏆 Leaderboard</button>
            </>
          )}
        </>
      )}

      {(view === 'login' || view === 'register') && (
        <>
          <div className="panel-name">{view === 'login' ? '🔑 Log In' : '✨ Register'}</div>
          <hr className="panel-hr" />
          <input className="auth-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="shop-msg">{success}</div>}
          <button className="battle-btn" style={{ marginBottom: 6 }} disabled={loading}
            onClick={view === 'login' ? handleLogin : handleRegister}>
            {loading ? 'Please wait…' : view === 'login' ? 'Log In' : 'Create Account'}
          </button>
          <button className="battle-btn flee" onClick={() => setView('menu')}>← Back</button>
        </>
      )}

      {view === 'leaderboard' && (
        <>
          <div className="panel-name">🏆 Global Leaderboard</div>
          <div className="inv-subtitle">All players · sorted by rebirths then XP</div>
          <hr className="panel-hr" />
          {loading && <div className="inv-empty">Loading…</div>}
          {!loading && leaderboard.length === 0 && <div className="inv-empty">No players yet.</div>}
          {!loading && leaderboard.map((entry, i) => (
            <div key={entry.username} className={`lb-row${entry.username === loggedIn?.username ? ' lb-me' : ''}`}>
              <span className="lb-rank">#{i + 1}</span>
              <span className="lb-name">
                @{entry.username}
                {entry.rebirths > 0 && <span className="rebirth-badge">🔥×{entry.rebirths}</span>}
              </span>
              <span className="lb-xp">⭐ {entry.xp}</span>
            </div>
          ))}
          <button className="battle-btn flee" style={{ marginTop: 10 }} onClick={() => setView('menu')}>← Back</button>
        </>
      )}

      {view === 'share' && (
        <>
          <div className="panel-name">🔗 Share Profile</div>
          <hr className="panel-hr" />
          <div className="acc-guest">Share this code so friends can add you to their leaderboard.</div>
          {loggedIn && (
            <>
              <button className="battle-btn" style={{ marginBottom: 6 }}
                onClick={() => setShareCode(makeShareCode(loggedIn.username, currentXp, currentGold, currentRebirths))}>
                Generate Code
              </button>
              {shareCode && (
                <div className="share-code-box"
                  onClick={() => { navigator.clipboard.writeText(shareCode); setSuccess('Copied!') }}>
                  {shareCode.slice(0, 40)}…<span className="share-copy">📋 Copy</span>
                </div>
              )}
            </>
          )}
          {success && <div className="shop-msg">{success}</div>}
          <button className="battle-btn flee" style={{ marginTop: 6 }} onClick={() => setView('menu')}>← Back</button>
        </>
      )}

      {view === 'rebirth' && (
        <>
          <div className="panel-name">🔥 Rebirth</div>
          <hr className="panel-hr" />
          <div className="rebirth-info">
            <div className="rebirth-title">Prestige System</div>
            <p>Rebirthing resets <strong>everything</strong> — XP, gold, inventory, name tags.</p>
            <p style={{ marginTop: 8 }}>You gain a permanent <strong>+20% damage bonus</strong> per rebirth and a 🔥 badge.</p>
            <p style={{ marginTop: 8, color: '#ffd54f' }}>Current rebirths: 🔥×{currentRebirths}</p>
            <p style={{ marginTop: 4, color: canRebirth ? '#66bb6a' : '#ef5350' }}>
              {canRebirth ? `✓ Ready! (${currentXp} XP)` : `✗ Need ${REBIRTH_XP_REQUIRED} XP (have ${currentXp})`}
            </p>
          </div>
          {canRebirth && (
            <button className="battle-btn special" style={{ marginTop: 12 }}
              onClick={() => { onRebirth(); setView('menu'); setSuccess('🔥 Rebirth! +20% damage bonus.') }}>
              🔥 Confirm Rebirth
            </button>
          )}
          <button className="battle-btn flee" style={{ marginTop: 6 }} onClick={() => setView('menu')}>← Back</button>
        </>
      )}
    </div>
  )
}
