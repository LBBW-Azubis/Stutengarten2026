import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Popup from './Popup'

import './Auszahlen.css'  //Wichtig immer CSS importieren

export default function Auszahlen() {
  const navigate = useNavigate()
  const [popup, setPopup] = useState('')

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
  // VOM BACKEND GELADEN (nach "Auszahlen" Button):
  //   kontostandNeu (int|String) - z.B. 100 - neuer Kontostand nach Auszahlung
  // ============================================================
  const [kontonummer, setKontonummer] = useState('')   // String - User-Eingabe
  const [betrag, setBetrag] = useState('')             // String (nur Ziffern) - User-Eingabe
  const [fehler, setFehler] = useState('')
  const [kundeGeladen, setKundeGeladen] = useState(false)

  // === BACKEND: Diese Werte kommen spaeter vom Backend ===
  const [vorname, setVorname] = useState('')           // String - vom Backend
  const [nachname, setNachname] = useState('')         // String - vom Backend
  const [kontostand, setKontostand] = useState(0)      // int - vom Backend
  const [kontostandNeu, setKontostandNeu] = useState('') // int - vom Backend nach Auszahlung
  // === ENDE BACKEND-VARIABLEN ===

  async function laden() {
    setFehler('')
    setKundeGeladen(false)
    if (!kontonummer.trim()) {
      setFehler('Bitte Kontonummer eingeben.')
      return
    }

    // === BACKEND: Kunde + Sparbuch laden ===
    // 1) GET http://192.168.1.10:5000/customer/<stutengarten_id> - Kundendaten
    // 2) GET http://192.168.1.10:5000/customer/<stutengarten_id>/savingsbook/balance - Kontostand
    try {
      const id = kontonummer.trim()

      // Kunde laden
      const response = await fetch(`http://192.168.1.10:5000/customer/${id}`)
      const data = await response.json()
      if (!response.ok) {
        setFehler('Kunde nicht gefunden.')
        return
      }
      setVorname(data.first_name)
      setNachname(data.last_name)

      // Sparbuch/Kontostand laden
      // GET http://192.168.1.10:5000/customer/<stutengarten_id>/savingsbook
      // Response 200: [{ stutengarten_id: "...", balance: ... }]
      const sbResponse = await fetch(`http://192.168.1.10:5000/customer/${id}/savingsbook`)
      const sbData = await sbResponse.json()
      if (sbResponse.ok && Array.isArray(sbData) && sbData.length > 0) {
        setKontostand(sbData[0].balance || 0)
      } else {
        setKontostand(0)
      }

      setKontostandNeu('')
      setKundeGeladen(true)
      setBetrag('')
    } catch (error) {
      console.error('[Auszahlen] Fehler beim Laden:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  async function auszahlen() {
    setFehler('')
    const b = parseInt(betrag) || 0
    if (b <= 0) {
      setFehler('Bitte einen gültigen Betrag eingeben.')
      return
    }
    if (b > kontostand) {
      setFehler('Nicht genug Guthaben!')
      return
    }

    // === BACKEND: Auszahlung senden ===
    const neuerStand = kontostand - b
    try {
      const response = await fetch(`http://192.168.1.10:5000/customer/${kontonummer.trim()}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ amount: -b, purpose: 'Auszahlung' }),
      })

      const data = await response.json()

      if (response.ok) {
        setKontostandNeu(neuerStand)
        setKontostand(data.balance || neuerStand)
        setPopup('Geld wurde erfolgreich ausgezahlt!')
      } else {
        setFehler('Fehler beim Auszahlen.')
      }
    } catch (error) {
      console.error('[Auszahlen] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
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
    <div className="aus-seite">
      <h2 className="aus-titel">Auszahlen</h2>

      <div className="aus-inhalt">
        {/* Kontonummer */}
        <div className="aus-feld">
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
          <button className="btn btn-dunkel aus-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="aus-trennlinie"></div>

        {/* Kundendaten */}
        <div className="aus-feld">
          <label>Vorname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? vorname : ''}</span>
        </div>
        <div className="aus-feld">
          <label>Nachname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? nachname : ''}</span>
        </div>
        <div className="aus-feld">
          <label>Kontostand:</label>
          <span className="feld-input anzeige">{kundeGeladen ? `${kontostand}` : ''}</span>
        </div>

        <div className="aus-trennlinie"></div>

        {/* Betrag + Auszahlen */}
        <div className="aus-feld">
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
          <button className="btn btn-dunkel aus-action-btn" onClick={auszahlen}>Auszahlen</button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="aus-trennlinie"></div>

        {/* Kontostand Neu */}
        <div className="aus-feld">
          <label>Kontostand Neu:</label>
          {/* === BACKEND: Neuen Kontostand vom Backend laden nach Auszahlung === */}
          <span className="feld-input anzeige aus-kontostand-neu">{kontostandNeu !== '' ? `${kontostandNeu}` : ''}</span>
          {/* === ENDE BACKEND === */}
        </div>
      </div>

      <Popup message={popup} onClose={() => setPopup('')} />
    </div>
  )
}
