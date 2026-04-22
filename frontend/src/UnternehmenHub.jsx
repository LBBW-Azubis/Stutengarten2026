import { useNavigate } from 'react-router-dom'

import './Aktien.css'  //Nutzen die Hub-Styles von Aktien

export default function UnternehmenHub() {
  const navigate = useNavigate()

  const kacheln = [
    { route: '/mainsite/unternehmen-einzahlen', label: 'Unternehmen einzahlen', emoji: '📥' },
    { route: '/mainsite/unternehmen-auszahlen', label: 'Unternehmen auszahlen', emoji: '📤' },
    { route: '/mainsite/unternehmen-umsatz',    label: 'Unternehmen Umsatz',    emoji: '📊' },
  ]

  return (
    <div className="aktien-seite">
      <h2 className="aktien-titel">Unternehmen</h2>
      <div className="aktien-grid">
        {kacheln.map((k, i) => (
          <button
            key={i}
            type="button"
            className="aktien-karte"
            onClick={() => navigate(k.route)}
          >
            <span className="aktien-emoji">{k.emoji}</span>
            <span className="aktien-label">{k.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
