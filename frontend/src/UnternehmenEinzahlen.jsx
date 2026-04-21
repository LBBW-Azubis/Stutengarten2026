import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './UnternehmenEinzahlen.css'  //Wichtig immer CSS importieren

export default function UnternehmenEinzahlen() {
  const navigate = useNavigate()

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   unternehmenName  (String) - z.B. "Baeckerei Mueller" - wird an Backend gesendet zum Laden
  //   betrag           (String, nur Ziffern) - z.B. "50" - wird als parseInt(betrag) ans Backend gesendet
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   kontostand       (int) - z.B. 500
  //
  // VOM BACKEND GELADEN (nach "Einzahlen" Button):
  //   kontostandNeu    (int) - neuer Kontostand nach Einzahlung
  // ============================================================
  const [unternehmenName, setUnternehmenName] = useState('')   // String - User-Eingabe
  const [betrag, setBetrag] = useState('')                     // String (nur Ziffern) - User-Eingabe
  const [fehler, setFehler] = useState('')
  const [geladen, setGeladen] = useState(false)

  // === BACKEND: Diese Werte kommen spaeter vom Backend ===
  const [kontostand, setKontostand] = useState(0)              // int - vom Backend
  const [kontostandNeu, setKontostandNeu] = useState('')       // int - vom Backend nach Einzahlung
  // === ENDE BACKEND-VARIABLEN ===

  function laden() {
    setFehler('')
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmenname eingeben.')
      return
    }

    // === BACKEND: Unternehmen laden ===
    // API-Call: GET /unternehmen?name=unternehmenName.trim()
    // Response: { kontostand: int }
    setKontostand(500)
    setKontostandNeu('')
    // === ENDE BACKEND ===

    setGeladen(true)
    setBetrag('')
  }

  function einzahlen() {
    setFehler('')
    const b = parseInt(betrag) || 0
    if (b <= 0) {
      setFehler('Bitte einen gueltigen Betrag eingeben.')
      return
    }

    // === BACKEND: Einzahlung an Unternehmen senden ===
    // API-Call: POST /unternehmen/einzahlen
    // Body: { name: unternehmenName.trim() (String), betrag: parseInt(betrag) (int) }
    // Response: { kontostandNeu: int }
    const neuerStand = kontostand + b
    console.log('[Unternehmen Einzahlen]:', {
      name: unternehmenName.trim(),   // String
      betrag: b,                       // int
    })
    setKontostandNeu(neuerStand)
    // === ENDE BACKEND ===
  }

  function handleBetragChange(e) {
    const val = e.target.value
    if (val === '' || /^\d+$/.test(val)) {
      setBetrag(val)
      setKontostandNeu('')
    }
  }

  return (
    <div className="ue-seite">
      <div className="ue-icon">📥</div>
      <h2 className="ue-titel">Unternehmen einzahlen</h2>

      <div className="ue-inhalt">
        <div className="ue-feld">
          <label>Unternehmen:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="Unternehmenname"
            value={unternehmenName}
            onChange={e => { setUnternehmenName(e.target.value); setGeladen(false); setKontostandNeu('') }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel ue-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="ue-trennlinie"></div>

        <div className="ue-feld">
          <label>Kontostand:</label>
          <span className="feld-input anzeige">{geladen ? `${kontostand}` : ''}</span>
        </div>

        <div className="ue-trennlinie"></div>

        <div className="ue-feld">
          <label>Betrag:</label>
          <input
            type="text"
            inputMode="numeric"
            className="feld-input"
            placeholder="Betrag eingeben"
            value={betrag}
            onChange={handleBetragChange}
            onKeyDown={e => { if (e.key === 'Enter') einzahlen() }}
          />
          <button className="btn btn-dunkel ue-action-btn" onClick={einzahlen}>Einzahlen</button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="ue-trennlinie"></div>

        <div className="ue-feld">
          <label>Kontostand Neu:</label>
          {/* === BACKEND: Neuen Kontostand vom Backend laden === */}
          <span className="feld-input anzeige ue-kontostand-neu">{kontostandNeu !== '' ? `${kontostandNeu}` : ''}</span>
          {/* === ENDE BACKEND === */}
        </div>
      </div>
    </div>
  )
}
