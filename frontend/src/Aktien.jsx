import { useNavigate } from 'react-router-dom'
import Emoji from './Emoji'

import './Aktien.css'  //Wichtig immer CSS importieren

export default function Aktien() {
  const navigate = useNavigate()

  const kacheln = [
    { route: '/mainsite/aktien/kaufen',    label: 'Aktien Kaufen',    emoji: '💰' },
    { route: '/mainsite/aktien/zaehler',   label: 'Aktien Drehrad',   emoji: '🎡' },
    { route: '/mainsite/aktien/verkaufen', label: 'Aktie Verkaufen',  emoji: '💸' },
    { route: '/mainsite/aktien/sammlung',  label: 'Aktien Sammlung',  emoji: '📊' },
  ]

  return (
    <div className="aktien-seite">
      <h2 className="aktien-titel">Aktien</h2>
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
