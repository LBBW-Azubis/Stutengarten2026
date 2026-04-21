import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'

import './KontoErstellen1.css'  //Wichtig immer CSS importieren

import loginIcon from './images/Login.png'

export default function KontoErstellen1() {
  const navigate = useNavigate()
  const { setAktuellerNutzer } = useAppContext()

  const [kontonummer, setKontonummer] = useState('')
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [fehler, setFehler] = useState('')

  function fertig() {
    const id = kontonummer.trim().toUpperCase()
    const vn = vorname.trim()
    const nn = nachname.trim()
    setFehler('')

    if (!id || !vn || !nn) {
      setFehler('Bitte Kontonummer, Vor- und Nachname ausfuellen.')
      return
    }

    setAktuellerNutzer({ id, vorname: vn, nachname: nn, kontostand: 0, aktien: [], transaktionen: 0, beruf: null })
    navigate('/mainsite/konto')
  }

  return (
    <div className="page konto-erstellen-seite">
      <div className="seite-layout">
        <div className="seite-icon">
          <img src={loginIcon} alt="Person" />
        </div>
        <div className="seite-felder">
          <div className="feld-zeile">
            <label>Kontonummer:</label>
            <input
              type="text"
              className="feld-input"
              placeholder="z.B. AB1234"
              maxLength="16"
              style={{ textTransform: 'uppercase' }}
              value={kontonummer}
              onChange={e => setKontonummer(e.target.value)}
            />
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
