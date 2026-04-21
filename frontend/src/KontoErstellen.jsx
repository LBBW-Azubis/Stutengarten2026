import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './KontoErstellen.css'  //Wichtig immer CSS importieren

import loginIcon from './images/Login.png'

export default function KontoErstellen() {
  const navigate = useNavigate()

  // Schritt 1: Frage "Neuen Kunden erstellen?" / Schritt 2: Daten eingeben
  const [schritt, setSchritt] = useState(1)

  const [kontonummer, setKontonummer] = useState('')
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [fehler, setFehler] = useState('')

  async function fertig() {
    const id = kontonummer.trim().toUpperCase()
    const vn = vorname.trim()
    const nn = nachname.trim()
    setFehler('')

    if (!id || !vn || !nn) {
      setFehler('Bitte Kontonummer, Vor- und Nachname ausfuellen.')
      return
    }

    // === BACKEND: Kunde anlegen ===
    // API-Call: POST http://192.168.1.10:5000/customer
    // Body: { stutengarten_id: String, first_name: String, last_name: String }
    // Response 200: JSON mit Kundendaten bei Erfolg
    // Response 400: { error: "..." } wenn Pflichtfelder fehlen oder ungueltig
    // Response 500: { error: "..." } bei anderen Fehlern
    try {
      const response = await fetch('http://192.168.1.10:5000/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          stutengarten_id: id,    // String - Kontonummer
          first_name: vn,         // String - Vorname
          last_name: nn,          // String - Nachname
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('[KontoErstellen] Kunde angelegt:', data)

        // === BACKEND: Sparbuch/Konto fuer den Kunden anlegen ===
        // API-Call: POST http://192.168.1.10:5000/customer/<stutengarten_id>/savingsbook
        // Kein Body noetig
        // Response 201: { customer_id: ..., balance: 0 }
        // Response 500: { error: "..." }
        try {
          const sbResponse = await fetch(`http://192.168.1.10:5000/customer/${id}/savingsbook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
          })
          const sbData = await sbResponse.json()
          if (sbResponse.ok) {
            console.log('[KontoErstellen] Sparbuch angelegt:', sbData)
          } else {
            console.error('[KontoErstellen] Sparbuch Fehler:', sbData)
          }
        } catch (sbError) {
          console.error('[KontoErstellen] Sparbuch Verbindungsfehler:', sbError)
        }
        // === ENDE BACKEND: Sparbuch ===

        navigate('/mainsite')
      } else {
        setFehler(data.error || 'Fehler beim Anlegen des Kunden.')
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
