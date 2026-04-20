import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'

import './3_BerufEinzahlen.css'  //Wichtig immer CSS importieren

import loginIcon from './images/Login.png'

export default function BerufEinzahlen() {
  const navigate = useNavigate()
  const { aktuellerNutzer, addTranAktion } = useAppContext()
  const [, forceUpdate] = useState(0)

  const n = aktuellerNutzer || { id: '...', vorname: '', nachname: '', kontostand: 0, beruf: null }
  const b = (n && n.beruf) ? n.beruf : { name: '...', lohn: 0 }

  const [lohnInput, setLohnInput] = useState(String(b.lohn))
  const [fehler, setFehler] = useState('')

  const v = parseInt(lohnInput) || 0
  const neuStand = v > 0 ? (n.kontostand + v) : '...'

  function einzahlen() {
    setFehler('')
    if (!v || v <= 0) {
      setFehler('Bitte Betrag eingeben.')
      return
    }
    n.kontostand += v
    addTranAktion(n)
    navigate('/mainsite')
  }

  return (
    <div className="page">
      <div className="seite-layout">
        <div className="seite-icon">
          <img src={loginIcon} alt="Person" />
        </div>
        <div className="seite-felder">
          <div className="feld-zeile">
            <label>Beruf:</label>
            <span className="feld-input anzeige">{b.name}</span>
          </div>
          <div className="feld-zeile">
            <label>Kontostand:</label>
            <span className="feld-input anzeige">{n.kontostand}</span>
          </div>
          <div className="feld-zeile">
            <label>Kontostand neu:</label>
            <span className="feld-input anzeige">{neuStand}</span>
          </div>
          <div className="aktions-zeile">
            <input
              type="number"
              className="feld-input"
              placeholder="..."
              style={{ maxWidth: 140 }}
              value={lohnInput}
              onChange={e => setLohnInput(e.target.value)}
            />
            <button className="btn btn-dunkel" onClick={einzahlen}>einzahlen</button>
          </div>
          {fehler && <span className="fehler-text" style={{ display: 'block' }}>{fehler}</span>}
        </div>
      </div>
    </div>
  )
}
