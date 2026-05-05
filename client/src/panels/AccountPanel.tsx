import { useState } from 'react'

export interface Account {
  username: string
  xp: number
  gold: number
}

// Simple in-memory "accounts" store (persisted to localStorage)
function loadAccounts(): Record<string, { passwordHash: string; xp: number; gold: number }> {
  try { return JSON.parse(localStorage.getItem('pt3d_accounts') ?? '{}') } catch { return {} }
}
function saveAccounts(a: Record<string, { passwordHash: string; xp: number; gold: number }>) {
  localStorage.setItem('pt3d_accounts', JSON.stringify(a))
}
function simpleHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return String(h)
}

interface Props {
  currentXp: number
  currentGold: number
  loggedIn: Account | null
  onLogin: (acc: Account) => void
  onLogout: () => void
  onClose: () => void
}

export function AccountPanel({ currentXp, currentGold, loggedIn, onLogin, onLogout, onClose }: Props) {
  const [view, setView] = useState<'menu' | 'login' | 'register' | 'leaderboard'>('menu')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const accounts = loadAccounts()

  // Leaderboard: all accounts sorted by XP
  const leaderboard = Object.entries(accounts)
    .map(([u, d]) => ({ username: u, xp: d.xp, gold: d.gold }))
    .sort((a, b) => b.xp - a.xp)

  const handleRegister = () => {
    setError(''); setSuccess('')
    if (!username.trim() || !password.trim()) { setError('Fill in all fields.'); return }
    if (username.length < 3) { setError('Username must be 3+ characters.'); return }
    if (password.length < 6) { setError('Password must be 6+ characters.'); return }
    if (accounts[username.toLowerCase()]) { setError('Username already taken.'); return }
    accounts[username.toLowerCase()] = { passwordHash: simpleHash(password), xp: 0, gold: 50 }
    saveAccounts(accounts)
    setSuccess('Account created! You can now log in.')
    setView('login')
  }

  const handleLogin = () => {
    setError(''); setSuccess('')
    const acc = accounts[username.toLowerCase()]
    if (!acc || acc.passwordHash !== simpleHash(password)) {
      setError('Invalid credentials.')
      return
    }
    onLogin({ username: username.toLowerCase(), xp: acc.xp, gold: acc.gold })
    setSuccess(`Welcome back, ${username}!`)
  }

  const handleSave = () => {
    if (!loggedIn) return
    accounts[loggedIn.username] = {
      passwordHash: accounts[loggedIn.username]?.passwordHash ?? '',
      xp: currentXp,
      gold: currentGold,
    }
    saveAccounts(accounts)
    setSuccess('Progress saved!')
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
                <div className="acc-username">@{loggedIn.username}</div>
                <div className="acc-stats">⭐ {currentXp} XP · 🪙 {currentGold} gold</div>
              </div>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={handleSave}>💾 Save Progress</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => setView('leaderboard')}>🏆 Leaderboard</button>
              <button className="battle-btn flee" onClick={() => { onLogout(); setSuccess('Logged out.') }}>🚪 Log Out</button>
              {success && <div className="shop-msg">{success}</div>}
            </>
          ) : (
            <>
              <div className="acc-guest">Playing as guest. Log in to save progress and appear on the leaderboard.</div>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => { setView('login'); setError(''); setSuccess('') }}>🔑 Log In</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => { setView('register'); setError(''); setSuccess('') }}>✨ Create Account</button>
              <button className="battle-btn" style={{ marginBottom: 6 }} onClick={() => setView('leaderboard')}>🏆 Leaderboard</button>
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
          <hr className="panel-hr" />
          {leaderboard.length === 0 && <div className="inv-empty">No accounts yet. Be the first!</div>}
          {leaderboard.map((entry, i) => (
            <div key={entry.username} className={`lb-row${entry.username === loggedIn?.username ? ' lb-me' : ''}`}>
              <span className="lb-rank">#{i + 1}</span>
              <span className="lb-name">@{entry.username}</span>
              <span className="lb-xp">⭐ {entry.xp}</span>
            </div>
          ))}
          <button className="battle-btn flee" style={{ marginTop: 10 }} onClick={() => setView('menu')}>← Back</button>
        </>
      )}
    </div>
  )
}
