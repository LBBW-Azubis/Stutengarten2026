import { useNavigate } from 'react-router-dom'
import Emoji from './Emoji'

import './Aktien.css'  //Nutzen die Hub-Styles von Aktien

export default function AktienSammlung() {
  const navigate = useNavigate()

  const kacheln = [
    { route: '/mainsite/aktien/sammlung/kunde', label: 'Kunde Aktien', emoji: '👤' },
    { route: '/mainsite/aktien/sammlung/alle',  label: 'Alle Aktien',  emoji: '📊' },
  ]

  return (
    <div className="aktien-seite">
      <h2 className="aktien-titel">Aktien Sammlung</h2>
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
