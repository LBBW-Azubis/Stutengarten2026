import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Emoji from './Emoji'
import Popup from './Popup'

import './KontoErstellen.css'  //Wichtig immer CSS importieren

export default function KontoErstellen() {
  const navigate = useNavigate()

  // Schritt 1: Frage "Neuen Kunden erstellen?" / Schritt 2: Daten eingeben
  const [schritt, setSchritt] = useState(1)

  const [kontonummer, setKontonummer] = useState('')
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [fehler, setFehler] = useState('')
  const [popup, setPopup] = useState('')

  async function fertig() {
    const id = kontonummer.trim().toUpperCase()
    const vn = vorname.trim()
    const nn = nachname.trim()
    setFehler('')

    if (!id || !vn || !nn) {
      setFehler('Bitte Kontonummer, Vor- und Nachname ausfüllen.')
      return
    }

    // === BACKEND: Kunde anlegen ===
    // POST http://192.168.1.10:5000/customer
    // Body: { stutengarten_id, first_name, last_name }
    // Das Sparbuch wird vom Backend automatisch mit angelegt.
    try {
      const response = await fetch('http://192.168.1.10:5000/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ stutengarten_id: id, first_name: vn, last_name: nn }),
      })

      if (response.ok) {
        setPopup('Konto wurde erfolgreich erstellt!')
      } else {
        setFehler('Fehler beim Anlegen des Kunden.')
      }
    } catch (error) {
      console.error('[KontoErstellen] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  // Schritt 1: Frage
  if (schritt === 1) {
    return (
      <div className="ke-seite">
        <div className="ke-card">
          <div className="ke-icon"><Emoji char="📝" /></div>
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
        <div className="ke-icon"><Emoji char="📝" /></div>
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
            <button className="btn btn-gruen ke-btn" onClick={() => setSchritt(1)}>Zurück</button>
          </div>
        </div>
      </div>

      <Popup message={popup} onClose={() => { setPopup(''); navigate('/mainsite') }} />
    </div>
  )
}
