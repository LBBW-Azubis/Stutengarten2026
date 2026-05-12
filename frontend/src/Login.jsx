import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'
import Emoji from './Emoji'

import './Login.css'  //Wichtig immer CSS importieren

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

  function anmelden() {
    setFehler('')
    if (!ausweis.trim() || !passwort) {
      setFehler('Bitte Ausweis-Nummer und Passwort eingeben.')
      return
    }

    setMitarbeiter({ id: ausweis.trim().toUpperCase() })
    if (passwort === '1234') setBetreuerEingeloggt(true)
    setAktuellerNutzer(null)
    if (hackerAutoStart) setHackerAktiv(true)
    if (spieleAutoStart) setSpieleAktiv(true)
    setEingeloggt(true)
    navigate('/mainsite')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') anmelden()
  }

  return (
    <div className="login-seite">
      <form className="login-karte" autoComplete="off" onSubmit={e => { e.preventDefault(); anmelden() }}>
        <Emoji char="👤" className="login-emoji" />
        <h1 className="login-titel">Anmelden</h1>

        <div className="login-feld">
          <label htmlFor="login-ausweis">Ausweis-Nummer</label>
          <input
            id="login-ausweis"
            type="text"
            className="login-input"
            placeholder="z.B. AB12"
            maxLength="6"
            style={{ textTransform: 'uppercase' }}
            value={ausweis}
            onChange={e => setAusweis(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            name="stg-ausweis"
            data-lpignore="true"
            data-1p-ignore="true"
          />
        </div>

        <div className="login-feld">
          <label htmlFor="login-passwort">Passwort</label>
          <input
            id="login-passwort"
            type="password"
            className="login-input"
            placeholder="Passwort"
            value={passwort}
            onChange={e => setPasswort(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="new-password"
            name="stg-passwort"
            data-lpignore="true"
            data-1p-ignore="true"
          />
        </div>

        {fehler && <div className="login-fehler">{fehler}</div>}

        <button type="submit" className="login-btn" onClick={anmelden}>Anmelden</button>
      </form>
    </div>
  )
}
