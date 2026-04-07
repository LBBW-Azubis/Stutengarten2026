import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './3_Eva_Einzahlen.css'  //Wichtig immer CSS importieren

import einzahlenIcon from './images/einzahlen.png'

export default function Eva_Einzahlen() {
  const navigate = useNavigate()

  // ============================================================
  // BACKEND-VARIABLEN - Diese Werte werden spaeter ans Backend gesendet / vom Backend geladen
  //
  // EINGABEN (User tippt ein):
  //   kontonummer  (String) - z.B. "AB1234" - wird an Backend gesendet zum Kunde laden
  //   betrag       (String, nur Ziffern) - z.B. "50" - wird als parseInt(betrag) ans Backend gesendet
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   vorname      (String) - z.B. "Max"
  //   nachname     (String) - z.B. "Mustermann"
  //   kontostand   (int)    - z.B. 150
  //
  // VOM BACKEND GELADEN (nach "Einzahlen" Button):
  //   kontostandNeu (int|String) - z.B. 200 - neuer Kontostand nach Einzahlung
  // ============================================================
  const [kontonummer, setKontonummer] = useState('')   // String - User-Eingabe
  const [betrag, setBetrag] = useState('')             // String (nur Ziffern) - User-Eingabe
  const [fehler, setFehler] = useState('')
  const [kundeGeladen, setKundeGeladen] = useState(false)

  // === BACKEND: Diese Werte kommen spaeter vom Backend ===
  const [vorname, setVorname] = useState('')           // String - vom Backend
  const [nachname, setNachname] = useState('')         // String - vom Backend
  const [kontostand, setKontostand] = useState(0)      // int - vom Backend
  const [kontostandNeu, setKontostandNeu] = useState('') // int - vom Backend nach Einzahlung
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
    setKontostandNeu('')
    // === ENDE BACKEND ===

    setKundeGeladen(true)
    setBetrag('')
  }

  function einzahlen() {
    setFehler('')
    const b = parseInt(betrag) || 0
    if (b <= 0) {
      setFehler('Bitte einen gueltigen Betrag eingeben.')
      return
    }

    // === BACKEND: Einzahlung senden ===
    // API-Call: POST /einzahlen
    // Body: { kontonummer: kontonummer.trim().toUpperCase() (String), betrag: parseInt(betrag) (int) }
    // Response: { kontostandNeu: int }
    // Dummy-Daten zum Testen:
    const neuerStand = kontostand + b
    console.log('[Einzahlen] Einzahlung:', {
      kontonummer: kontonummer.trim().toUpperCase(),  // String
      betrag: b,                                       // int (bereits parseInt)
    })
    setKontostandNeu(neuerStand)
    // === ENDE BACKEND ===
  }

  // Nur Ziffern erlauben - kein +, -, . oder sonstiges
  function handleBetragChange(e) {
    const val = e.target.value
    if (val === '' || /^\d+$/.test(val)) {
      setBetrag(val)
      setKontostandNeu('')
    }
  }

  return (
    <div className="ez-seite">
      <h2 className="ez-titel">Einzahlen</h2>

      <div className="ez-inhalt">
        {/* Kontonummer */}
        <div className="ez-feld">
          <label>Kontonummer:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. AB1234"
            maxLength="16"
            style={{ textTransform: 'uppercase' }}
            value={kontonummer}
            onChange={e => { setKontonummer(e.target.value); setKundeGeladen(false); setKontostandNeu('') }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel ez-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="ez-trennlinie"></div>

        {/* Kundendaten */}
        <div className="ez-feld">
          <label>Vorname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? vorname : ''}</span>
        </div>
        <div className="ez-feld">
          <label>Nachname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? nachname : ''}</span>
        </div>
        <div className="ez-feld">
          <label>Kontostand:</label>
          <span className="feld-input anzeige">{kundeGeladen ? `${kontostand} Stuggis` : ''}</span>
        </div>

        <div className="ez-trennlinie"></div>

        {/* Betrag + Einzahlen */}
        <div className="ez-feld">
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
          <button className="btn btn-dunkel ez-action-btn" onClick={einzahlen}>Einzahlen</button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="ez-trennlinie"></div>

        {/* Kontostand Neu */}
        <div className="ez-feld">
          <label>Kontostand Neu:</label>
          {/* === HIER SPAETER: Neuen Kontostand vom Backend laden === */}
          <span className="feld-input anzeige ez-kontostand-neu">{kontostandNeu !== '' ? `${kontostandNeu} Stuggis` : ''}</span>
          {/* === ENDE === */}
        </div>
      </div>
    </div>
  )
}
