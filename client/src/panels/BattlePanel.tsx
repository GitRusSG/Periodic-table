import { useState, useEffect } from 'react'
import {
  getBossIntro, buildEnemy, buildPlayer, resolveTurn,
  generateLoot, rollRarity,
  MANA_MAX, SPECIAL_COST,
  type LootItem, type Combatant,
} from '../gameData'
import { ZONE_COLORS, RARITY_COLORS } from '../types/game'
import { loadGlobalDifficulty } from './AdminPanel'
import type { ElementRecord } from '../types/game'

// Lightning flash component for boss fights
function LightningFlash({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at center, rgba(100,180,255,0.35) 0%, transparent 70%)',
      animation: 'lightning-flash 0.15s ease-out',
      zIndex: 5,
      borderRadius: 12,
    }} />
  )
}

export function BattlePanel({ el, onClose, onXP, onGold, onLoot, onNameTag, equipped, atkBuff, rebirths }: {
  el: ElementRecord; onClose: () => void
  onXP: (n: number) => void; onGold: (n: number) => void
  onLoot: (item: LootItem) => void
  onNameTag: (symbol: string, name: string) => void
  equipped: LootItem[]; atkBuff: number; rebirths: number
}) {
  const isBoss = el.zone === 'Boss' || el.zone === 'Anomalous'
  const zc = ZONE_COLORS[el.zone] ?? '#fff'
  const bossLines = getBossIntro(el.symbol)

  const [cutsceneLine, setCutsceneLine] = useState(0)
  const [cutsceneDone, setCutsceneDone] = useState(!isBoss)

  const [player, setPlayer] = useState<Combatant>(() => {
    const p = buildPlayer(equipped)
    const rebirthBonus = Math.round(p.atk * rebirths * 0.2)
    return { ...p, atk: p.atk + atkBuff + rebirthBonus }
  })
  // Enemy scales with rebirths AND global admin difficulty multiplier
  const [enemy, setEnemy] = useState<Combatant>(() => {
    const e = buildEnemy(el)
    const rebirthScale = 1 + rebirths * 0.35
    const adminScale = loadGlobalDifficulty()
    const total = rebirthScale * adminScale
    return { ...e, hp: Math.round(e.hp * total), maxHp: Math.round(e.hp * total), atk: Math.round(e.atk * total), def: Math.round(e.def * total) }
  })
  const [phase, setPhase] = useState<'start' | 'battle' | 'won' | 'lost'>('start')
  const [log, setLog] = useState<string[]>([])
  const [droppedLoot, setDroppedLoot] = useState<LootItem | null>(null)
  const [lightning, setLightning] = useState(false)

  const advanceCutscene = () => {
    if (cutsceneLine < bossLines.length - 1) setCutsceneLine(l => l + 1)
    else setCutsceneDone(true)
  }

  const doAction = (action: 'attack' | 'special' | 'defend') => {
    if (phase !== 'battle') return
    if (action === 'special' && player.mana < SPECIAL_COST) return
    const result = resolveTurn(action, player, enemy)
    setLog(prev => [result.log, ...prev].slice(0, 5))
    setPlayer(p => ({
      ...p,
      hp: result.playerHp,
      mana: result.playerMana,
      status: result.playerStatus,
      statusTurns: result.playerStatusTurns,
    }))
    setEnemy(e => ({
      ...e,
      hp: result.enemyHp,
      status: result.enemyStatus,
      statusTurns: result.enemyStatusTurns,
    }))
    // Lightning flash on boss enemy attack
    if (isBoss && result.playerHp < player.hp) {
      setLightning(true)
      setTimeout(() => setLightning(false), 200)
    }
    if (result.enemyHp <= 0) {
      const xpGain = isBoss ? el.atomicNumber * 3 : el.atomicNumber
      const goldGain = isBoss ? el.atomicNumber * 2 : Math.round(el.atomicNumber / 2)
      onXP(xpGain)
      onGold(goldGain)
      onNameTag(el.symbol, el.name)
      const rarity = rollRarity(el.zone)
      const loot = generateLoot(
        el.symbol, el.name, rarity, el.classification,
        el.atomicMass, el.electronegativity, el.density,
      )
      setDroppedLoot(loot)
      onLoot(loot)
      setPhase('won')
    } else if (result.playerHp <= 0) {
      setPhase('lost')
    }
  }

  const statusIcon = (s: string) =>
    ({ radiation: '☢', corrosion: '🧪', burning: '🔥', stagger: '💫' }[s] ?? '')

  // Boss cutscene
  if (!cutsceneDone) {
    return (
      <div className="panel boss-cutscene">
        <div className="cutscene-symbol" style={{ color: zc }}>{el.symbol}</div>
        <div className="cutscene-name">{el.name}</div>
        <span className="panel-badge" style={{ background: zc, color: '#000' }}>{el.zone} Boss</span>
        <div className="cutscene-text">{bossLines[cutsceneLine]}</div>
        <div className="cutscene-dots">
          {bossLines.map((_, i) => (
            <span key={i} className={`cutscene-dot${i === cutsceneLine ? ' active' : ''}`} />
          ))}
        </div>
        <button className="battle-btn" onClick={advanceCutscene}>
          {cutsceneLine < bossLines.length - 1 ? 'Continue ▶' : '⚔️ Begin Battle'}
        </button>
      </div>
    )
  }

  return (
    <div className="panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-symbol" style={{ color: zc }}>{el.symbol}</div>
      <div className="panel-name">{el.name}</div>
      <span className="panel-badge" style={{ background: zc, color: '#000' }}>{el.zone}</span>
      <hr className="panel-hr" />

      {phase === 'start' && (
        <>
          <div className="battle-stats">
            <div className="stat-chip">⚔️ {enemy.atk}</div>
            <div className="stat-chip">🛡 {enemy.def}</div>
            <div className="stat-chip">❤️ {enemy.hp}</div>
          </div>
          <div className="battle-stats" style={{ marginTop: 4 }}>
            <div className="stat-chip player-chip">ATK {player.atk}</div>
            <div className="stat-chip player-chip">DEF {player.def}</div>
            <div className="stat-chip player-chip">HP {player.hp}</div>
          </div>
          <button className="battle-btn" style={{ marginTop: 12 }} onClick={() => setPhase('battle')}>
            ⚔️ Start Encounter
          </button>
        </>
      )}

      {phase !== 'start' && (
        <>
          {/* Player HP + Mana */}
          <div className="hp-row">
            <span>You {statusIcon(player.status)}</span>
            <div className="hp-bar">
              <div className="hp-fill player" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
            </div>
            <span>{player.hp}/{player.maxHp}</span>
          </div>
          <div className="hp-row">
            <span>💧 Mana</span>
            <div className="hp-bar">
              <div className="hp-fill mana" style={{ width: `${(player.mana / MANA_MAX) * 100}%` }} />
            </div>
            <span>{player.mana}/{MANA_MAX}</span>
          </div>
          {/* Enemy HP */}
          <div className="hp-row">
            <span>{el.symbol} {statusIcon(enemy.status)}</span>
            <div className="hp-bar">
              <div className="hp-fill enemy" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
            </div>
            <span>{enemy.hp}/{enemy.maxHp}</span>
          </div>

          {/* Battle log */}
          <div className="battle-log">
            {log.map((l, i) => <div key={i} className="log-line">{l}</div>)}
          </div>

          {/* Actions */}
          {phase === 'battle' && (
            <>
              <div className="battle-actions">
                <button className="battle-btn" onClick={() => doAction('attack')}
                  title="Free attack. Generates 15 mana.">
                  ⚔️ Attack
                </button>
                <button
                  className={`battle-btn special${player.mana < SPECIAL_COST ? ' disabled' : ''}`}
                  onClick={() => doAction('special')}
                  title={`Costs ${SPECIAL_COST} mana. 2.2× damage + stagger chance.`}
                  disabled={player.mana < SPECIAL_COST}
                >
                  💥 Special ({SPECIAL_COST}💧)
                </button>
              </div>
              <div className="battle-actions" style={{ marginTop: 4 }}>
                <button className="battle-btn defend" onClick={() => doAction('defend')}
                  title="Take 60% less damage. Generates 30 mana.">
                  🛡 Defend (+30💧)
                </button>
                <button className="battle-btn flee" onClick={onClose}>🏃 Flee</button>
              </div>
              <div className="mana-hint">
                ⚔️ Attack = free, builds mana · 💥 Special = {SPECIAL_COST}💧, 2× dmg · 🛡 Defend = blocks 60%, builds mana
              </div>
            </>
          )}

          {phase === 'won' && droppedLoot && (
            <div className="battle-result win">
              <div>🏆 Victory! +{isBoss ? el.atomicNumber * 3 : el.atomicNumber} XP  +{isBoss ? el.atomicNumber * 2 : Math.round(el.atomicNumber / 2)} 🪙</div>
              <div>🏷 Name Tag earned: <strong>{el.name}</strong></div>
              <div className="loot-drop">
                <span className="loot-badge" style={{ background: RARITY_COLORS[droppedLoot.rarity] }}>{droppedLoot.rarity}</span>
                <span className="loot-name">{droppedLoot.name}</span>
                <span className="loot-stats">⚔️{droppedLoot.atk} 🛡{droppedLoot.def} ⚡{droppedLoot.spd}</span>
              </div>
              <button className="battle-btn" style={{ marginTop: 8 }} onClick={onClose}>Continue</button>
            </div>
          )}

          {phase === 'lost' && (
            <div className="battle-result lose">
              <div>💀 Defeated. Progress preserved.</div>
              <button className="battle-btn" style={{ marginTop: 8 }} onClick={onClose}>Retreat</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
