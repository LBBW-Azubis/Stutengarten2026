import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './3_Eva_KontoErstellen.css'  //Wichtig immer CSS importieren

import loginIcon from './images/Login.png'

export default function Eva_KontoErstellen() {
  const navigate = useNavigate()

  // Schritt 1: Frage "Neuen Kunden erstellen?" / Schritt 2: Daten eingeben
  const [schritt, setSchritt] = useState(1)

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

    // === HIER SPAETER: Kundendaten an Backend senden ===
    // Temporaerer String mit den Erstellungsdaten
    const erstellungsDaten = JSON.stringify({
      kontonummer: id,
      vorname: vn,
      nachname: nn,
    })
    console.log('[KontoErstellen] Neue Kundendaten:', erstellungsDaten)
    // === ENDE: Spaeter durch API-Call ersetzen ===

    navigate('/mainsite')
  }

  // Schritt 1: Frage
  if (schritt === 1) {
    return (
      <div className="ke-seite">
        <div className="ke-card">
          <img src={loginIcon} alt="Person" className="ke-icon" />
          <div className="ke-frage-text">Neuen Kunden erstellen?</div>
          <div className="ke-buttons">
            <button className="btn btn-gruen ke-btn" onClick={() => setSchritt(2)}>
              JA
            </button>
            <button className="btn btn-dunkel ke-btn" onClick={() => navigate(-1)}>
              NEIN
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Schritt 2: Daten eingeben
  return (
    <div className="ke-seite">
      <div className="ke-card ke-card-formular">
        <img src={loginIcon} alt="Person" className="ke-icon" />
        <h2 className="ke-titel">Neuen Kunden anlegen</h2>

        <div className="ke-formular">
          <div className="ke-feld">
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
          <div className="ke-feld">
            <label>Vorname:</label>
            <input
              type="text"
              className="feld-input"
              placeholder="Vorname"
              value={vorname}
              onChange={e => setVorname(e.target.value)}
            />
          </div>
          <div className="ke-feld">
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

          <div className="ke-buttons" style={{ marginTop: 20 }}>
            <button className="btn btn-dunkel ke-btn" onClick={fertig}>Fertig</button>
            <button className="btn btn-gruen ke-btn" onClick={() => setSchritt(1)}>Zurueck</button>
          </div>
        </div>
      </div>
    </div>
  )
}
