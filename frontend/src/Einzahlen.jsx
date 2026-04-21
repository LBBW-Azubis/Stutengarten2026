import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './Einzahlen.css'  //Wichtig immer CSS importieren

import einzahlenIcon from './images/einzahlen.png'

export default function Einzahlen() {
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
        setFehler(data.error || 'Kunde nicht gefunden.')
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
      console.error('[Einzahlen] Fehler beim Laden:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  async function einzahlen() {
    setFehler('')
    const b = parseInt(betrag) || 0
    if (b <= 0) {
      setFehler('Bitte einen gueltigen Betrag eingeben.')
      return
    }

    // === BACKEND: Einzahlung senden ===
    // API-Call: PATCH http://192.168.1.10:5000/customer/<stutengarten_id>/savingsbook/balance
    // Body: { balance: String(aktuellerKontostand + betrag) }
    // Response 200: { customer_id, first_name, last_name, balance, ... }
    // Response 400: { error: "No new balance provided" }
    // Response 500: { error: "..." }
    const neuerStand = kontostand + b
    const url = `http://192.168.1.10:5000/customer/${kontonummer.trim()}/savingsbook/balance`
    const body = { balance: String(neuerStand) }  // Backend erwartet den neuen Gesamtkontostand
    console.log('[Einzahlen] PATCH URL:', url)
    console.log('[Einzahlen] PATCH Body:', JSON.stringify(body))
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      console.log('[Einzahlen] Response Status:', response.status)
      console.log('[Einzahlen] Response Data:', data)

      if (response.ok) {
        setKontostandNeu(data.balance || neuerStand)
        setKontostand(data.balance || neuerStand)
      } else {
        setFehler(data.error || 'Fehler beim Einzahlen.')
      }
    } catch (error) {
      console.error('[Einzahlen] Fehler:', error)
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
          <span className="feld-input anzeige">{kundeGeladen ? `${kontostand}` : ''}</span>
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
          <span className="feld-input anzeige ez-kontostand-neu">{kontostandNeu !== '' ? `${kontostandNeu}` : ''}</span>
          {/* === ENDE === */}
        </div>
      </div>
    </div>
  )
}
