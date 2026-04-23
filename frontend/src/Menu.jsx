import { useNavigate } from 'react-router-dom'
import { useAppContext } from './AppContext'
import Emoji from './Emoji'

import './Menu.css'  //Wichtig immer CSS importieren

export default function Menu() {
  const navigate = useNavigate()
  const { spieleAktiv } = useAppContext()

  const alleKacheln = [
    { route: '/mainsite/kunde',       emoji: '👤', label: 'Kunde' },
    { route: '/mainsite/unternehmen', emoji: '🏢', label: 'Unternehmen' },
    { route: '/mainsite/aktien',      emoji: '📈', label: 'Aktien' },
    { route: '/mainsite/spiel',       emoji: '🎮', label: 'Spiele',  nurWennSpieleAn: true },
  ]

  const kacheln = alleKacheln.filter(k => !k.nurWennSpieleAn || spieleAktiv)

  return (
    <div className="menu-v2-seite">
      <div className={`menu-v2-grid menu-v2-grid-${kacheln.length}`}>
        {kacheln.map((k, i) => (
          <button
            key={i}
            type="button"
            className="menu-v2-karte"
            onClick={() => { if (k.route) navigate(k.route) }}
          >
            <Emoji char={k.emoji} className="menu-v2-emoji" />
            <span className="menu-v2-label">{k.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
