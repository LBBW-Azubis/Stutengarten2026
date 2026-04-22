import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './Konto.css'  //Wichtig immer CSS importieren

export default function Konto() {
  const navigate = useNavigate()

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   kontonummer  (String) - z.B. "AB1234" - wird an Backend gesendet zum Kunde laden
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   vorname      (String) - z.B. "Max"
  //   nachname     (String) - z.B. "Mustermann"
  //   kontostand   (int)    - z.B. 150
  // ============================================================
  const [kontonummer, setKontonummer] = useState('')   // String - User-Eingabe
  const [fehler, setFehler] = useState('')
  const [kundeGeladen, setKundeGeladen] = useState(false)

  // === BACKEND: Diese Werte kommen spaeter vom Backend ===
  const [vorname, setVorname] = useState('')           // String - vom Backend
  const [nachname, setNachname] = useState('')         // String - vom Backend
  const [kontostand, setKontostand] = useState(0)      // int - vom Backend
  // === ENDE BACKEND-VARIABLEN ===

  async function laden() {
    setFehler('')
    setKundeGeladen(false)
    if (!kontonummer.trim()) {
      setFehler('Bitte Kontonummer eingeben.')
      return
    }

    // === BACKEND: Kunde laden ===
    // API-Call: GET http://192.168.1.10:5000/customer/<stutengarten_id>
    // Response 200: { id: int, stutengarten_id: String, first_name: String, last_name: String }
    // Response 404: { error: String }
    // Response 500: { error: String, details: String }
    try {
      const response = await fetch(`http://192.168.1.10:5000/customer/${kontonummer.trim().toUpperCase()}`)

      const data = await response.json()

      if (response.ok) {
        setVorname(data.first_name)       // String - vom Backend
        setNachname(data.last_name)       // String - vom Backend

        // Sparbuch/Kontostand laden
        // GET http://192.168.1.10:5000/customer/<stutengarten_id>/savingsbook
        try {
          const sbResponse = await fetch(`http://192.168.1.10:5000/customer/${kontonummer.trim()}/savingsbook`)
          const sbData = await sbResponse.json()
          if (sbResponse.ok && Array.isArray(sbData) && sbData.length > 0) {
            setKontostand(sbData[0].balance || 0)
          } else {
            setKontostand(0)
          }
        } catch { setKontostand(0) }

        setKundeGeladen(true)
      } else if (response.status === 404) {
        setFehler('Kein Kunde mit dieser Kontonummer gefunden.')
      } else {
        setFehler('Serverfehler. Bitte spaeter erneut versuchen.')
      }
    } catch (error) {
      console.error('[Konto] Fehler beim Laden:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="ko-seite">
      <div className="ko-icon">👤</div>
      <h2 className="ko-titel">Konto</h2>

      <div className="ko-inhalt">
        {/* Kontonummer */}
        <div className="ko-feld">
          <label>Kontonummer:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. AB1234"
            maxLength="16"
            style={{ textTransform: 'uppercase' }}
            value={kontonummer}
            onChange={e => { setKontonummer(e.target.value); setKundeGeladen(false) }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel ko-action-btn" onClick={laden}>Laden</button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="ko-trennlinie"></div>

        {/* Kundendaten */}
        <div className="ko-feld">
          <label>Vorname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? vorname : ''}</span>
        </div>
        <div className="ko-feld">
          <label>Nachname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? nachname : ''}</span>
        </div>

        <div className="ko-trennlinie"></div>

        <div className="ko-feld">
          <label>Kontostand:</label>
          {/* === BACKEND: Kontostand vom Backend === */}
          <span className="feld-input anzeige ko-kontostand">{kundeGeladen ? `${kontostand}` : ''}</span>
          {/* === ENDE BACKEND === */}
        </div>
      </div>
    </div>
  )
}
