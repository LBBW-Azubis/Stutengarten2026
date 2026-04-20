import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'

import './1_Login.css'  //Wichtig immer CSS importieren

import loginIcon from './images/Login.png'
import suchenIcon from './images/Suchen.png'

export default function Login() {
  const navigate = useNavigate()
  const {
    setAktuellerNutzer, setMitarbeiter, setBetreuerEingeloggt,
    setEingeloggt, hackerAutoStart, setHackerAktiv,
    spieleAutoStart, setSpieleAktiv,
  } = useAppContext()

  const [ausweis, setAusweis] = useState('')
  const [passwort, setPasswort] = useState('')
  const [fehler, setFehler] = useState('')

  function suchen() {
    setFehler('')
    if (!ausweis.trim() || !passwort) {
      setFehler('Bitte Ausweis-Nummer und Passwort eingeben.')
      return
    }

    // Mitarbeiter setzen (fuer die Demo akzeptieren wir jede ID mit korrektem Passwort)
    setMitarbeiter({ id: ausweis.trim().toUpperCase() })

    // Betreuer-Flag setzen wenn Passwort stimmt
    if (passwort === '1234') setBetreuerEingeloggt(true)

    // Kein Kunde geladen - Mitarbeiter muss Kunden pro Transaktion laden
    setAktuellerNutzer(null)

    // Hacker-Timer: Wenn autoStart aktiv, automatisch einschalten
    if (hackerAutoStart) {
      setHackerAktiv(true)
    }

    // Spiele: Wenn autoStart aktiv, automatisch einschalten
    if (spieleAutoStart) {
      setSpieleAktiv(true)
    }

    // Eingeloggt-Flag setzen (startet den Hacker-Timer im AppLayout)
    setEingeloggt(true)
    navigate('/mainsite')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') suchen()
  }

  return (
    <div className="page login-seite">
      <div className="login-icon">
        <img src={loginIcon} alt="Person" />
      </div>

      <div className="login-felder">
        <div className="feld-zeile">
          <label>Ausweis Nummer:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="…."
            maxLength="6"
            style={{ textTransform: 'uppercase' }}
            value={ausweis}
            onChange={e => setAusweis(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="feld-zeile">
          <label>Passwort:</label>
          <input
            type="password"
            className="feld-input"
            placeholder="…."
            value={passwort}
            onChange={e => setPasswort(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="such-btn" onClick={suchen}>
            <img src={suchenIcon} alt="Suchen" style={{ width: 44, height: 44 }} />
          </button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block' }}>{fehler}</span>}
      </div>
    </div>
  )
}
