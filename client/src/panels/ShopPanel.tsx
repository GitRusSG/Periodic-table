import { useState } from 'react'
import { generateLoot, rollRarity } from '../gameData'
import { ZONE_COLORS } from '../types/game'
import type { ElementRecord } from '../types/game'
import type { LootItem } from '../gameData'

const SERVICES = [
  { label: '❤️ Full Heal',  desc: 'Restore all HP',         cost: 30, id: 'heal_full' },
  { label: '💊 Half Heal',  desc: 'Restore 50% HP',         cost: 15, id: 'heal_half' },
  { label: '⚔️ Sharpen',    desc: '+5 ATK next battle',     cost: 20, id: 'atk_buff'  },
  { label: '🎲 Buy Loot',   desc: 'Random item drop',       cost: 40, id: 'buy_loot'  },
] as const

export function ShopPanel({ el, gold, onClose, onSpend, onHeal, onBuff, onLoot }: {
  el: ElementRecord; gold: number; onClose: () => void
  onSpend: (n: number) => void; onHeal: (full: boolean) => void
  onBuff: () => void; onLoot: (item: LootItem) => void
}) {
  const zc = ZONE_COLORS[el.zone] ?? '#fff'
  const [msg, setMsg] = useState('')

  const buy = (id: string, cost: number) => {
    if (gold < cost) { setMsg('Not enough gold! 🪙'); return }
    onSpend(cost)
    if (id === 'heal_full') { onHeal(true);  setMsg('Fully healed! ❤️') }
    if (id === 'heal_half') { onHeal(false); setMsg('Healed 50% HP! 💊') }
    if (id === 'atk_buff')  { onBuff();      setMsg('+5 ATK for next battle! ⚔️') }
    if (id === 'buy_loot') {
      const rarity = rollRarity('Neutral')
      const item = generateLoot(el.symbol, el.name, rarity, el.classification, el.atomicMass, el.electronegativity, el.density)
      onLoot(item)
      setMsg(`Got: ${item.name} (${item.rarity})! 🎁`)
    }
  }

  return (
    <div className="panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-symbol" style={{ color: zc }}>{el.symbol}</div>
      <div className="panel-name">{el.name}</div>
      <span className="panel-badge" style={{ background: zc, color: '#000' }}>Noble Gas Shop</span>
      <hr className="panel-hr" />
      <div className="shop-gold">🪙 {gold} gold</div>
      {SERVICES.map(s => (
        <button
          key={s.id}
          className={`service-btn${gold < s.cost ? ' disabled' : ''}`}
          onClick={() => buy(s.id, s.cost)}
        >
          <span>{s.label}</span>
          <span className="service-right">
            <span className="service-desc">{s.desc}</span>
            <span className="service-cost">🪙 {s.cost}</span>
          </span>
        </button>
      ))}
      {msg && <div className="shop-msg">{msg}</div>}
      <button className="battle-btn flee" style={{ marginTop: 10 }} onClick={onClose}>Leave</button>
    </div>
  )
}
