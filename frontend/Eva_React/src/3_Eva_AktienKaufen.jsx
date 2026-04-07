import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'

import './3_Eva_AktienKaufen.css'  //Wichtig immer CSS importieren

import aktienIcon from './images/Bild1.png'

export default function Eva_AktienKaufen() {
  const navigate = useNavigate()
  const { aktuellerNutzer, addTranAktion, setLetzteGekaufteAktien } = useAppContext()
  const [, forceUpdate] = useState(0)

  const n = aktuellerNutzer || { id: '...', vorname: '', nachname: '', kontostand: 0, aktien: [] }

  const [kaufAnzahl, setKaufAnzahl] = useState('')
  const [fehler, setFehler] = useState('')

  function kaufen() {
    const preis = 3
    const anzahl = parseInt(kaufAnzahl, 10)
    setFehler('')

    if (!anzahl || anzahl < 1) {
      setFehler('Bitte eine Anzahl eingeben (mind. 1).')
      return
    }
    if (n.aktien.length + anzahl > 3) {
      setFehler(`Maximal 3 Aktien pro Person erlaubt. Bereits vorhanden: ${n.aktien.length}.`)
      return
    }
    if (anzahl * preis > n.kontostand) {
      setFehler('Nicht genug Guthaben!')
      return
    }

    const startIdx = n.aktien.length
    n.kontostand -= anzahl * preis
    for (let i = 0; i < anzahl; i++) {
      n.aktien.push({ nummer: Math.floor(10000000 + Math.random() * 90000000).toString(), wert: preis })
    }
    setLetzteGekaufteAktien(n.aktien.slice(startIdx))
    addTranAktion(n)
    navigate('/mainsite/aktien/zaehler')
  }

  return (
    <div className="page">
      <div className="seite-layout">
        <div className="seite-icon">
          <img src={aktienIcon} alt="Aktien" />
        </div>
        <div className="seite-felder">
          <div className="feld-zeile">
            <label>Name:</label>
            <span className="feld-input anzeige">{n.vorname} {n.nachname}</span>
          </div>
          <div className="feld-zeile">
            <label>Kontostand:</label>
            <span className="feld-input anzeige">{n.kontostand}</span>
          </div>
          <div className="feld-zeile">
            <label>Anzahl Aktien:</label>
            <input
              type="number"
              className="feld-input"
              min="1"
              max="3"
              placeholder="1-3"
              style={{ width: 80 }}
              value={kaufAnzahl}
              onChange={e => setKaufAnzahl(e.target.value)}
            />
            <button className="btn btn-dunkel" onClick={kaufen}>kaufen</button>
          </div>
          {fehler && <span className="fehler-text" style={{ display: 'block' }}>{fehler}</span>}
        </div>
      </div>
    </div>
  )
}
