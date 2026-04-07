import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './3_Eva_Konto.css'  //Wichtig immer CSS importieren

import kontoIcon from './images/Login.png'

export default function Eva_Konto() {
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

  function laden() {
    setFehler('')
    if (!kontonummer.trim()) {
      setFehler('Bitte Kontonummer eingeben.')
      return
    }

    // === BACKEND: Kunde laden ===
    // API-Call: GET /kunde?kontonummer=kontonummer.trim().toUpperCase()
    // Response: { vorname: String, nachname: String, kontostand: int }
    // Dummy-Daten zum Testen:
    setVorname('Max')
    setNachname('Mustermann')
    setKontostand(150)
    // === ENDE BACKEND ===

    setKundeGeladen(true)
  }

  return (
    <div className="ko-seite">
      <img src={kontoIcon} alt="Konto" className="ko-icon" />
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
          <span className="feld-input anzeige ko-kontostand">{kundeGeladen ? `${kontostand} Stuggis` : ''}</span>
          {/* === ENDE BACKEND === */}
        </div>
      </div>
    </div>
  )
}
