import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './3_Eva_UnternehmenAuszahlen.css'  //Wichtig immer CSS importieren

export default function Eva_UnternehmenAuszahlen() {
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
  // VOM BACKEND GELADEN (nach "Auszahlen" Button):
  //   kontostandNeu    (int) - neuer Kontostand nach Auszahlung
  // ============================================================
  const [unternehmenName, setUnternehmenName] = useState('')   // String - User-Eingabe
  const [betrag, setBetrag] = useState('')                     // String (nur Ziffern) - User-Eingabe
  const [fehler, setFehler] = useState('')
  const [geladen, setGeladen] = useState(false)

  // === BACKEND: Diese Werte kommen spaeter vom Backend ===
  const [kontostand, setKontostand] = useState(0)              // int - vom Backend
  const [kontostandNeu, setKontostandNeu] = useState('')       // int - vom Backend nach Auszahlung
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

  function auszahlen() {
    setFehler('')
    const b = parseInt(betrag) || 0
    if (b <= 0) {
      setFehler('Bitte einen gueltigen Betrag eingeben.')
      return
    }
    if (b > kontostand) {
      setFehler('Nicht genug Guthaben!')
      return
    }

    // === BACKEND: Auszahlung vom Unternehmen senden ===
    // API-Call: POST /unternehmen/auszahlen
    // Body: { name: unternehmenName.trim() (String), betrag: parseInt(betrag) (int) }
    // Response: { kontostandNeu: int }
    const neuerStand = kontostand - b
    console.log('[Unternehmen Auszahlen]:', {
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
    <div className="ua-seite">
      <div className="ua-icon">📤</div>
      <h2 className="ua-titel">Unternehmen auszahlen</h2>

      <div className="ua-inhalt">
        <div className="ua-feld">
          <label>Unternehmen:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="Unternehmenname"
            value={unternehmenName}
            onChange={e => { setUnternehmenName(e.target.value); setGeladen(false); setKontostandNeu('') }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel ua-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="ua-trennlinie"></div>

        <div className="ua-feld">
          <label>Kontostand:</label>
          <span className="feld-input anzeige">{geladen ? `${kontostand} Stuggis` : ''}</span>
        </div>

        <div className="ua-trennlinie"></div>

        <div className="ua-feld">
          <label>Betrag:</label>
          <input
            type="text"
            inputMode="numeric"
            className="feld-input"
            placeholder="Betrag eingeben"
            value={betrag}
            onChange={handleBetragChange}
            onKeyDown={e => { if (e.key === 'Enter') auszahlen() }}
          />
          <button className="btn btn-dunkel ua-action-btn" onClick={auszahlen}>Auszahlen</button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="ua-trennlinie"></div>

        <div className="ua-feld">
          <label>Kontostand Neu:</label>
          {/* === BACKEND: Neuen Kontostand vom Backend laden === */}
          <span className="feld-input anzeige ua-kontostand-neu">{kontostandNeu !== '' ? `${kontostandNeu} Stuggis` : ''}</span>
          {/* === ENDE BACKEND === */}
        </div>
      </div>
    </div>
  )
}
