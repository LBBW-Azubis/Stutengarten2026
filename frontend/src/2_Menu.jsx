import { useNavigate } from 'react-router-dom'
import { useAppContext } from './AppContext'

import './2_Menu.css'  //Wichtig immer CSS importieren

// Bilder importieren
import kontoErstellenIcon from './images/Konto_erstellen.png'
import einzahlenIcon from './images/einzahlen.png'
import auszahlenIcon from './images/auszahlen.png'
import ueberweisungIcon from './images/Überweisung_menü.png'
import aktienIcon from './images/aktien_menü.png'
import kontoIcon from './images/Konto_menü.png'
import spieleIcon from './images/Spiel_menü.png'
import rankingIcon from './images/Info_menü.png'

export default function Menu() {
  const navigate = useNavigate()
  const { spieleAktiv } = useAppContext()

  const alleKacheln = [
    { route: '/mainsite/kontoerstellen',  bild: kontoErstellenIcon, label: 'Konto erstellen' },
    { route: '/mainsite/einzahlen',       bild: einzahlenIcon,      label: 'Einzahlen' },
    { route: '/mainsite/auszahlen',       bild: auszahlenIcon,      label: 'Auszahlen' },
    { route: '/mainsite/ueberweisung',    bild: ueberweisungIcon,   label: 'Ueberweisung' },
    { route: '/mainsite/aktien',          bild: aktienIcon,         label: 'Aktien' },
    { route: '/mainsite/konto',           bild: kontoIcon,          label: 'Konto' },
    { route: '/mainsite/spiel',           bild: spieleIcon,         label: 'Spiele',   nurWennSpieleAn: true },
    { route: '/mainsite/ranking',         bild: rankingIcon,        label: 'Ranking' },
  ]

  // Spiele-Kachel ausblenden wenn Spiele deaktiviert
  const kacheln = alleKacheln.filter(k => !k.nurWennSpieleAn || spieleAktiv)

  return (
    <div className="page konto-erstellen-seite seite-menu">
      <div className="menu-grid">
        {kacheln.map((k, i) => (
          <div key={i} className="kachel" onClick={() => navigate(k.route)}>
            <div className="kachel-bild">
              <img src={k.bild} alt={k.label} />
            </div>
            <div className="kachel-label">{k.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
