import { useState } from 'react'
import { AdminPanel, isAdminCredentials, loadBanned } from './AdminPanel'

export interface Account {
  username: string
  xp: number
  gold: number
  rebirths: number
  isAdmin?: boolean
}

interface StoredAccount {
  passwordHash: string; xp: number; gold: number; rebirths: number
}

function loadAccounts(): Record<string, StoredAccount> {
  try { return JSON.parse(localStorage.getItem('pt3d_accounts') ?? '{}') } catch { return {} }
}
function saveAccounts(a: Record<string, StoredAccount>) {
  localStorage.setItem('pt3d_accounts', JSON.stringify(a))
}
function simpleHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return String(h)
}
function makeShareCode(username: string, xp: number, gold: number, rebirths: number): string {
  return btoa(JSON.stringify({ username, xp, gold, rebirths }))
}
function parseShareCode(code: string): { username: string; xp: number; gold: number; rebirths: number } | null {
  try { return JSON.parse(atob(code)) } catch { return null }
}
function loadSharedProfiles(): Record<string, { xp: number; gold: number; rebirths: number }> {
  try { return JSON.parse(localStorage.getItem('pt3d_shared') ?? '{}') } catch { return {} }
}
function saveSharedProfiles(p: Record<string, { xp: number; gold: number; rebirths: number }>) {
  localStorage.setItem('pt3d_shared', JSON.stringify(p))
}

const REBIRTH_XP_REQUIRED = 5000

interface Props {
  currentXp: number; currentGold: number; currentRebirths: number
  loggedIn: Account | null
  onLogin: (acc: Account) => void; onLogout: () => void
  onRebirth: () => void; onClose: () => void
}

export function AccountPanel({ currentXp, currentGold, currentRebirths, loggedIn, onLogin, onLogout, onRebirth, onClose }: Props) {
  const [view, setView] = useState<'menu' | 'login' | 'register' | 'leaderboard' | 'share' | 'rebirth' | 'admin'>('menu')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [importCode, setImportCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const accounts = loadAccounts()
  const shared = loadSharedProfiles()
  const banned = loadBanned()

  const ownEntries = Object.entries(accounts)
    .filter(([u]) => !banned.includes(u))
    .map(([u, d]) => ({ username: u, xp: d.xp, gold: d.gold, rebirths: d.rebirths ?? 0, isShared: false }))
  const sharedEntries = Object.entries(shared)
    .filter(([u]) => !accounts[u] && !banned.includes(u))
    .map(([u, d]) => ({ username: u, xp: d.xp, gold: d.gold, rebirths: d.rebirths ?? 0, isShared: true }))
  const leaderboard = [...ownEntries, ...sharedEntries]
    .sort((a, b) => (b.rebirths * 100000 + b.xp) - (a.rebirths * 100000 + a.xp))

  const handleRegister = () => {
    setError(''); setSuccess('')
    if (!username.trim() || !password.trim()) { setError('Fill in all fields.'); return }
    if (username.length < 3) { setError('Username must be 3+ characters.'); return }
    if (password.length < 6) { setError('Password must be 6+ characters.'); return }
    if (username.toLowerCase() === 'mendeleev') { setError('That username is reserved.'); return }
    if (accounts[username.toLowerCase()]) { setError('Username already taken.'); return }
    accounts[username.toLowerCase()] = { passwordHash: simpleHash(password), xp: 0, gold: 50, rebirths: 0 }
    saveAccounts(accounts)
    setSuccess('Account created! You can now log in.')
    setView('login')
  }

  const handleLogin = () => {
    setError(''); setSuccess('')
    // Check admin credentials
    if (isAdminCredentials(username, password)) {
      onLogin({ username: 'mendeleev', xp: 0, gold: 0, rebirths: 0, isAdmin: true })
      setView('admin')
      return
    }
    // Check if banned
    if (banned.includes(username.toLowerCase())) {
      setError('This account has been banned.')
      return
    }
    const acc = accounts[username.toLowerCase()]
    if (!acc || acc.passwordHash !== simpleHash(password)) { setError('Invalid credentials.'); return }
    onLogin({ username: username.toLowerCase(), xp: acc.xp, gold: acc.gold, rebirths: acc.rebirths ?? 0 })
    setSuccess(`Welcome back, ${username}!`)
    setView('menu')
  }

  const handleSave = () => {
    if (!loggedIn || loggedIn.isAdmin) return
    accounts[loggedIn.username] = {
      passwordHash: accounts[loggedIn.username]?.passwordHash ?? '',
      xp: currentXp, gold: currentGold, rebirths: currentRebirths,
    }
    saveAccounts(accounts)
    setSuccess('Progress saved! ✓')
  }

  const handleGenerateCode = () => {
    if (!loggedIn) return
    setShareCode(makeShareCode(loggedIn.username, currentXp, currentGold, currentRebirths))
  }

  const handleImportCode = () => {
    setError(''); setSuccess('')
    const parsed = parseShareCode(importCode.trim())
    if (!parsed || !parsed.username) { setError('Invalid share code.'); return }
    saveSharedProfiles({ ...shared, [parsed.username.toLowerCase()]: { xp: parsed.xp, gold: parsed.gold, rebirths: parsed.rebirths ?? 0 } })
    setSuccess(`Imported @${parsed.username} to leaderboard!`)
    setImportCode('')
  }

  // Check for pending gift items
  const checkGifts = () => {
    if (!loggedIn || loggedIn.isAdmin) return null
    const key = `pt3d_gift_${loggedIn.username}`
    const gifts = JSON.parse(localStorage.getItem(key) ?? '[]')
    return gifts.length > 0 ? gifts.length : null
  }
  const pendingGifts = checkGifts()

  const canRebirth = currentXp >= REBIRTH_XP_REQUIRED

  // Admin view
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
              {pendingGifts && (
                <div className="gift-notice">🎁 You have {pendingGifts} gift(s) from the admin! Check your inventory.</div>
              )}
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={handleSave}>💾 Save Progress</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => setView('leaderboard')}>🏆 Leaderboard</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => setView('share')}>🔗 Share / Import</button>
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
              <div className="acc-guest">Playing as guest. Log in to save progress and appear on the leaderboard.</div>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => { setView('login'); setError(''); setSuccess('') }}>🔑 Log In</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => { setView('register'); setError(''); setSuccess('') }}>✨ Create Account</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => setView('leaderboard')}>🏆 Leaderboard</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => setView('share')}>🔗 Import Friend</button>
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
          <button className="battle-btn" style={{ marginBottom: 6 }} onClick={view === 'login' ? handleLogin : handleRegister}>
            {view === 'login' ? 'Log In' : 'Create Account'}
          </button>
          <button className="battle-btn flee" onClick={() => setView('menu')}>← Back</button>
        </>
      )}

      {view === 'leaderboard' && (
        <>
          <div className="panel-name">🏆 Leaderboard</div>
          <div className="inv-subtitle">Sorted by Rebirths then XP</div>
          <hr className="panel-hr" />
          {leaderboard.length === 0 && <div className="inv-empty">No accounts yet. Be the first!</div>}
          {leaderboard.map((entry, i) => (
            <div key={entry.username} className={`lb-row${entry.username === loggedIn?.username ? ' lb-me' : ''}${entry.isShared ? ' lb-shared' : ''}`}>
              <span className="lb-rank">#{i + 1}</span>
              <span className="lb-name">
                @{entry.username}
                {entry.rebirths > 0 && <span className="rebirth-badge">🔥×{entry.rebirths}</span>}
                {entry.isShared && <span className="shared-tag">imported</span>}
              </span>
              <span className="lb-xp">⭐ {entry.xp}</span>
            </div>
          ))}
          <button className="battle-btn flee" style={{ marginTop: 10 }} onClick={() => setView('menu')}>← Back</button>
        </>
      )}

      {view === 'share' && (
        <>
          <div className="panel-name">🔗 Share & Import</div>
          <hr className="panel-hr" />
          <div className="inv-section">Your Share Code</div>
          {loggedIn ? (
            <>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={handleGenerateCode}>Generate Code</button>
              {shareCode && (
                <div className="share-code-box" onClick={() => { navigator.clipboard.writeText(shareCode); setSuccess('Copied!') }}>
                  {shareCode.slice(0, 40)}…<span className="share-copy">📋 Copy</span>
                </div>
              )}
            </>
          ) : (
            <div className="acc-guest">Log in to generate a share code.</div>
          )}
          <div className="inv-section" style={{ marginTop: 12 }}>Import a Friend</div>
          <input className="auth-input" placeholder="Paste friend's share code" value={importCode} onChange={e => setImportCode(e.target.value)} />
          <button className="battle-btn" style={{ marginBottom: 6 }} onClick={handleImportCode}>Import to Leaderboard</button>
          {error && <div className="auth-error">{error}</div>}
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
            <p>Rebirthing resets your XP to 0 but grants a permanent <strong>+20% damage bonus</strong> per rebirth and a 🔥 badge.</p>
            <p style={{ marginTop: 8 }}>All items, gold, and name tags are <strong>kept</strong>.</p>
            <p style={{ marginTop: 8, color: '#ffd54f' }}>Current rebirths: 🔥×{currentRebirths}</p>
            <p style={{ marginTop: 4, color: canRebirth ? '#66bb6a' : '#ef5350' }}>
              {canRebirth ? `✓ You have ${currentXp} XP — ready!` : `✗ Need ${REBIRTH_XP_REQUIRED} XP (you have ${currentXp})`}
            </p>
          </div>
          {canRebirth && (
            <button className="battle-btn special" style={{ marginTop: 12 }} onClick={() => { onRebirth(); setView('menu'); setSuccess('🔥 Rebirth complete! +20% damage bonus.') }}>
              🔥 Confirm Rebirth
            </button>
          )}
          <button className="battle-btn flee" style={{ marginTop: 6 }} onClick={() => setView('menu')}>← Back</button>
        </>
      )}
    </div>
  )
}
