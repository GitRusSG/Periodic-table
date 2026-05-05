import type { ElementRecord } from '../types/game'

const CLASS_COLORS: Record<string, string> = {
  alkali_metal: '#ef5350', alkaline_earth_metal: '#ffa726',
  transition_metal: '#66bb6a', post_transition_metal: '#26c6da',
  metalloid: '#ab47bc', nonmetal: '#ffee58', halogen: '#ec407a',
  noble_gas: '#42a5f5', lanthanide: '#ff7043', actinide: '#8d6e63',
}

export function ClassicPanel({ el, onClose }: { el: ElementRecord; onClose: () => void }) {
  const cc = CLASS_COLORS[el.classification] ?? '#fff'
  return (
    <div className="panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-symbol" style={{ color: cc }}>{el.symbol}</div>
      <div className="panel-name">{el.name}</div>
      <div className="panel-num">#{el.atomicNumber}</div>
      <span className="panel-badge" style={{ background: cc, color: '#000' }}>
        {el.classification.replace(/_/g, ' ')}
      </span>
      <hr className="panel-hr" />
      {([
        ['Atomic Mass', `${el.atomicMass} u`],
        ['Period', String(el.period)],
        ['Group', el.group != null ? String(el.group) : 'f-block'],
        ['Density', el.density != null ? `${el.density} g/cm³` : '—'],
        ['Electronegativity', el.electronegativity != null ? String(el.electronegativity) : '—'],
        ['Electron Shells', el.electronShells.join(', ')],
      ] as [string, string][]).map(([k, v]) => (
        <div key={k} className="panel-row">
          <span className="panel-key">{k}</span>
          <span className="panel-val">{v}</span>
        </div>
      ))}
      {el.isRadioactive && <div className="panel-tag">☢ Radioactive</div>}
      {el.isSynthetic && <div className="panel-tag">⚗ Synthetic</div>}
    </div>
  )
}
