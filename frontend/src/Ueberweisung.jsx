import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './Ueberweisung.css'  //Wichtig immer CSS importieren

export default function Ueberweisung() {
  const navigate = useNavigate()

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   kontoVon     (String) - z.B. "AB1234" - Absender-Kontonummer
  //   kontoAn      (String) - z.B. "CD5678" - Empfaenger-Kontonummer
  //   betrag       (String, nur Ziffern) - z.B. "50" - wird als parseInt(betrag) ans Backend gesendet
  //
  // VOM BACKEND GELADEN (nach "Laden" Button Absender):
  //   vonVorname   (String), vonNachname (String), vonKontostand (int)
  //
  // VOM BACKEND GELADEN (nach "Laden" Button Empfaenger):
  //   anVorname    (String), anNachname (String), anKontostand (int)
  //
  // VOM BACKEND GELADEN (nach "Ueberweisen" Button):
  //   vonKontostandNeu (int) - neuer Kontostand Absender
  //   anKontostandNeu  (int) - neuer Kontostand Empfaenger
  // ============================================================

  // Absender
  const [kontoVon, setKontoVon] = useState('')           // String - User-Eingabe
  const [vonGeladen, setVonGeladen] = useState(false)
  // === BACKEND: Absender-Daten vom Backend ===
  const [vonVorname, setVonVorname] = useState('')       // String - vom Backend
  const [vonNachname, setVonNachname] = useState('')     // String - vom Backend
  const [vonKontostand, setVonKontostand] = useState(0)  // int - vom Backend
  const [vonKontostandNeu, setVonKontostandNeu] = useState('') // int - vom Backend nach Ueberweisung
  // === ENDE BACKEND ===

  // Empfaenger
  const [kontoAn, setKontoAn] = useState('')             // String - User-Eingabe
  const [anGeladen, setAnGeladen] = useState(false)
  // === BACKEND: Empfaenger-Daten vom Backend ===
  const [anVorname, setAnVorname] = useState('')         // String - vom Backend
  const [anNachname, setAnNachname] = useState('')       // String - vom Backend
  const [anKontostand, setAnKontostand] = useState(0)    // int - vom Backend
  const [anKontostandNeu, setAnKontostandNeu] = useState('') // int - vom Backend nach Ueberweisung
  // === ENDE BACKEND ===

  const [betrag, setBetrag] = useState('')               // String (nur Ziffern) - User-Eingabe
  const [fehler, setFehler] = useState('')

  async function ladenVon() {
    setFehler('')
    setVonGeladen(false)
    if (!kontoVon.trim()) { setFehler('Bitte Absender-Kontonummer eingeben.'); return }

    // === BACKEND: Absender laden ===
    try {
      const id = kontoVon.trim()
      const response = await fetch(`http://192.168.1.10:5000/customer/${id}`)
      const data = await response.json()
      if (!response.ok) { setFehler('Absender nicht gefunden.'); return }
      setVonVorname(data.first_name)
      setVonNachname(data.last_name)

      const sbResponse = await fetch(`http://192.168.1.10:5000/customer/${id}/savingsbook`)
      const sbData = await sbResponse.json()
      if (sbResponse.ok && Array.isArray(sbData) && sbData.length > 0) {
        setVonKontostand(sbData[0].balance || 0)
      } else { setVonKontostand(0) }

      setVonKontostandNeu('')
      setVonGeladen(true)
    } catch (error) {
      console.error('[Ueberweisung] Fehler Absender:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  async function ladenAn() {
    setFehler('')
    setAnGeladen(false)
    if (!kontoAn.trim()) { setFehler('Bitte Empfaenger-Kontonummer eingeben.'); return }
    if (kontoAn.trim() === kontoVon.trim()) {
      setFehler('Absender und Empfaenger duerfen nicht gleich sein.')
      return
    }

    // === BACKEND: Empfaenger laden ===
    try {
      const id = kontoAn.trim()
      const response = await fetch(`http://192.168.1.10:5000/customer/${id}`)
      const data = await response.json()
      if (!response.ok) { setFehler('Empfaenger nicht gefunden.'); return }
      setAnVorname(data.first_name)
      setAnNachname(data.last_name)

      const sbResponse = await fetch(`http://192.168.1.10:5000/customer/${id}/savingsbook`)
      const sbData = await sbResponse.json()
      if (sbResponse.ok && Array.isArray(sbData) && sbData.length > 0) {
        setAnKontostand(sbData[0].balance || 0)
      } else { setAnKontostand(0) }

      setAnKontostandNeu('')
      setAnGeladen(true)
    } catch (error) {
      console.error('[Ueberweisung] Fehler Empfaenger:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  async function ueberweisen() {
    setFehler('')
    const b = parseInt(betrag) || 0
    if (b <= 0) { setFehler('Bitte einen gueltigen Betrag eingeben.'); return }
    if (!vonGeladen) { setFehler('Bitte zuerst Absender laden.'); return }
    if (!anGeladen) { setFehler('Bitte zuerst Empfaenger laden.'); return }
    if (b > vonKontostand) { setFehler('Nicht genug Guthaben!'); return }

    // === BACKEND: Ueberweisung senden ===
    // API-Call: POST http://192.168.1.10:5000/customer/transfer
    // Body: { from: String, to: String, ammount: int, purpose: String }
    // Response 201: OK
    // Response 400: Bad Request
    // Response 500: Internal Error
    const requestBody = {
      from: kontoVon.trim(),
      to: kontoAn.trim(),
      amount: b,
      purpose: 'Ueberweisung',
    }
    try {
      const response = await fetch('http://192.168.1.10:5000/customer/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        setVonKontostandNeu(vonKontostand - b)
        setAnKontostandNeu(anKontostand + b)
      } else {
        setFehler('Fehler bei der Ueberweisung.')
      }
    } catch (error) {
      console.error('[Ueberweisung] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  // Nur Ziffern erlauben
  function handleBetragChange(e) {
    const val = e.target.value
    if (val === '' || /^\d+$/.test(val)) {
      setBetrag(val)
      setVonKontostandNeu('')
      setAnKontostandNeu('')
    }
  }

  return (
    <div className="uw-seite">
      <h2 className="uw-titel">Ueberweisung</h2>

      <div className="uw-container">
        {/* Absender (links) */}
        <div className="uw-konto">
          <h3 className="uw-konto-titel">Absender</h3>

          <div className="uw-feld">
            <label>Kontonummer:</label>
            <input
              type="text"
              className="feld-input"
              placeholder="z.B. AB1234"
              maxLength="16"
              style={{ textTransform: 'uppercase' }}
              value={kontoVon}
              onChange={e => { setKontoVon(e.target.value); setVonGeladen(false); setVonKontostandNeu('') }}
              onKeyDown={e => { if (e.key === 'Enter') ladenVon() }}
            />
            <button className="btn btn-dunkel uw-action-btn" onClick={ladenVon}>Laden</button>
          </div>

          <div className="uw-trennlinie"></div>

          <div className="uw-feld">
            <label>Vorname:</label>
            <span className="feld-input anzeige">{vonGeladen ? vonVorname : ''}</span>
          </div>
          <div className="uw-feld">
            <label>Nachname:</label>
            <span className="feld-input anzeige">{vonGeladen ? vonNachname : ''}</span>
          </div>
          <div className="uw-feld">
            <label>Kontostand:</label>
            <span className="feld-input anzeige">{vonGeladen ? `${vonKontostand}` : ''}</span>
          </div>

          {vonKontostandNeu !== '' && (
            <>
              <div className="uw-trennlinie"></div>
              <div className="uw-feld">
                <label>Kontostand Neu:</label>
                <span className="feld-input anzeige uw-kontostand-neu">{vonKontostandNeu}</span>
              </div>
            </>
          )}
        </div>

        {/* Empfaenger (rechts) */}
        <div className="uw-konto">
          <h3 className="uw-konto-titel">Empfaenger</h3>

          <div className="uw-feld">
            <label>Kontonummer:</label>
            <input
              type="text"
              className="feld-input"
              placeholder="z.B. CD5678"
              maxLength="16"
              style={{ textTransform: 'uppercase' }}
              value={kontoAn}
              onChange={e => { setKontoAn(e.target.value); setAnGeladen(false); setAnKontostandNeu('') }}
              onKeyDown={e => { if (e.key === 'Enter') ladenAn() }}
            />
            <button className="btn btn-dunkel uw-action-btn" onClick={ladenAn}>Laden</button>
          </div>

          <div className="uw-trennlinie"></div>

          <div className="uw-feld">
            <label>Vorname:</label>
            <span className="feld-input anzeige">{anGeladen ? anVorname : ''}</span>
          </div>
          <div className="uw-feld">
            <label>Nachname:</label>
            <span className="feld-input anzeige">{anGeladen ? anNachname : ''}</span>
          </div>
          <div className="uw-feld">
            <label>Kontostand:</label>
            <span className="feld-input anzeige">{anGeladen ? `${anKontostand}` : ''}</span>
          </div>

          {anKontostandNeu !== '' && (
            <>
              <div className="uw-trennlinie"></div>
              <div className="uw-feld">
                <label>Kontostand Neu:</label>
                <span className="feld-input anzeige uw-kontostand-neu">{anKontostandNeu}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Betrag + Ueberweisen (zentriert unter beiden Konten) */}
      <div className="uw-betrag-bereich">
        <div className="uw-trennlinie"></div>

        <div className="uw-feld uw-betrag-feld">
          <label>Betrag:</label>
          <input
            type="text"
            inputMode="numeric"
            className="feld-input"
            placeholder="Betrag eingeben"
            value={betrag}
            onChange={handleBetragChange}
            onKeyDown={e => { if (e.key === 'Enter') ueberweisen() }}
          />
          <button className="btn btn-dunkel uw-action-btn" onClick={ueberweisen}>Ueberweisen</button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

      </div>
    </div>
  )
}
