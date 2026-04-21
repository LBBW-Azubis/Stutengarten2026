import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useAppContext } from './AppContext'

import './KontoErstellen3.css'  //Wichtig immer CSS importieren

import loginIcon from './images/Login.png'

export default function KontoErstellen3() {
  const navigate = useNavigate()
  const { genId, nutzer, setNutzer, setAktuellerNutzer } = useAppContext()

  const neueId = useMemo(() => genId(), [])
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [fehler, setFehler] = useState('')

  function fertig() {
    const vn = vorname.trim()
    const nn = nachname.trim()
    if (!vn || !nn) {
      setFehler('Bitte Vor- und Nachname eingeben.')
      return
    }
    const neu = {
      id: neueId, vorname: vn, nachname: nn, kontostand: 0,
      aktien: [], transaktionen: 0, sparbuch: 0, beruf: null
    }
    setNutzer([...nutzer, neu])
    setAktuellerNutzer(neu)
    navigate('/mainsite/konto')
  }

  return (
    <div className="page">
      <div className="seite-layout">
        <div className="seite-icon">
          <img src={loginIcon} alt="Person" />
        </div>
        <div className="seite-felder">
          <div className="feld-zeile">
            <label>Id:</label>
            <span className="feld-input anzeige">{neueId}</span>
          </div>
          <div className="feld-zeile">
            <label>Vorname:</label>
            <input
              type="text"
              className="feld-input"
              placeholder="Vorname"
              value={vorname}
              onChange={e => setVorname(e.target.value)}
            />
          </div>
          <div className="feld-zeile">
            <label>Nachname:</label>
            <input
              type="text"
              className="feld-input"
              placeholder="Nachname"
              value={nachname}
              onChange={e => setNachname(e.target.value)}
            />
          </div>
          {fehler && <span className="fehler-text" style={{ display: 'block' }}>{fehler}</span>}
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-dunkel" onClick={fertig}>Fertig</button>
          </div>
        </div>
      </div>
    </div>
  )
}
