import { useNavigate } from 'react-router-dom'
import Emoji from './Emoji'

import './Aktien.css'  //Nutzen die Hub-Styles von Aktien (aktien-seite, aktien-grid, aktien-karte, etc.)

export default function Kunde() {
  const navigate = useNavigate()

  const kacheln = [
    { route: '/mainsite/konto',          label: 'Konto Info',      emoji: '👤' },
    { route: '/mainsite/kontoerstellen', label: 'Konto erstellen', emoji: '📝' },
    { route: '/mainsite/einzahlen',      label: 'Einzahlen',       emoji: '📥' },
    { route: '/mainsite/auszahlen',      label: 'Auszahlen',       emoji: '📤' },
    { route: '/mainsite/ueberweisung',   label: 'Überweisung',    emoji: '🔄' },
  ]

  return (
    <div className="aktien-seite">
      <h2 className="aktien-titel">Kunde</h2>
      <div className="aktien-grid">
        {kacheln.map((k, i) => (
          <button
            key={i}
            type="button"
            className="aktien-karte"
            onClick={() => navigate(k.route)}
          >
            <Emoji char={k.emoji} className="aktien-emoji" />
            <span className="aktien-label">{k.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
