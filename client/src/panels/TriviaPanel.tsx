import { useState } from 'react'
import { getQuestionForElement } from '../gameData'
import { CLASS_COLORS } from '../types/game'
import type { ElementRecord } from '../types/game'

export function TriviaPanel({ el, onClose, onXP, onGold }: {
  el: ElementRecord; onClose: () => void
  onXP: (n: number) => void; onGold: (n: number) => void
}) {
  const [trivia] = useState(() => getQuestionForElement(el.symbol))
  const [answered, setAnswered] = useState<number | null>(null)

  const handleAnswer = (i: number) => {
    if (answered !== null) return
    setAnswered(i)
    if (i === trivia.answer) {
      onXP(10 * trivia.difficulty)
      onGold(5 * trivia.difficulty)
    }
  }

  return (
    <div className="panel">
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-symbol" style={{ color: CLASS_COLORS[el.classification] }}>{el.symbol}</div>
      <div className="panel-name">{el.name}</div>
      <span className="panel-badge" style={{ background: '#1565c0', color: '#fff' }}>
        Difficulty {trivia.difficulty}
      </span>
      <hr className="panel-hr" />
      <div className="trivia-q">{trivia.q}</div>
      <div className="trivia-opts">
        {trivia.options.map((opt, i) => {
          let cls = 'trivia-opt'
          if (answered !== null) {
            if (i === trivia.answer) cls += ' correct'
            else if (i === answered) cls += ' wrong'
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered !== null}>
              {opt}
            </button>
          )
        })}
      </div>
      {answered !== null && (
        <div className={`trivia-result ${answered === trivia.answer ? 'win' : 'lose'}`}>
          {answered === trivia.answer
            ? `✓ Correct! +${10 * trivia.difficulty} XP  +${5 * trivia.difficulty} 🪙`
            : `✗ Wrong. Answer: ${trivia.options[trivia.answer]}`}
        </div>
      )}
      {answered !== null && (
        <button className="battle-btn" style={{ marginTop: 10 }} onClick={onClose}>Next →</button>
      )}
    </div>
  )
}
