import { useNavigate } from 'react-router-dom'
import { useAppContext } from './AppContext'

import './Menu.css'  //Wichtig immer CSS importieren

export default function Menu() {
  const navigate = useNavigate()
  const { spieleAktiv } = useAppContext()

  const alleKacheln = [
    { route: '/mainsite/kontoerstellen',  emoji: '📝', label: 'Konto erstellen' },
    { route: '/mainsite/einzahlen',       emoji: '📥', label: 'Einzahlen' },
    { route: '/mainsite/auszahlen',       emoji: '📤', label: 'Auszahlen' },
    { route: '/mainsite/ueberweisung',    emoji: '🔄', label: 'Ueberweisung' },
    { route: '/mainsite/aktien',          emoji: '📈', label: 'Aktien' },
    { route: '/mainsite/konto',           emoji: '👤', label: 'Konto' },
    { route: '/mainsite/spiel',           emoji: '🎮', label: 'Spiele',   nurWennSpieleAn: true },
    { route: '/mainsite/ranking',         emoji: '🏆', label: 'Ranking' },
  ]

  const kacheln = alleKacheln.filter(k => !k.nurWennSpieleAn || spieleAktiv)

  return (
    <div className="menu-v2-seite">
      <div className="menu-v2-grid">
        {kacheln.map((k, i) => (
          <button
            key={i}
            type="button"
            className="menu-v2-karte"
            onClick={() => navigate(k.route)}
          >
            <span className="menu-v2-emoji">{k.emoji}</span>
            <span className="menu-v2-label">{k.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
