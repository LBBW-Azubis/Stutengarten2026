import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Emoji from './Emoji'

import './UnternehmenEinzahlen.css'  //Wichtig immer CSS importieren

export default function UnternehmenEinzahlen() {
  const navigate = useNavigate()

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   unternehmenName  (String) - z.B. "Baeckerei Mueller"
  //   betrag           (String, nur Ziffern) - Einzahlungsbetrag
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   GET /company/<name>/savingsbook   → { balance }
  //
  // NACH "Einzahlen":
  //   PATCH /company/<name>/savingsbook mit { balance: (kontostand + betrag) }
  // ============================================================
  const [unternehmenName, setUnternehmenName] = useState('')
  const [betrag, setBetrag] = useState('')
  const [fehler, setFehler] = useState('')
  const [geladen, setGeladen] = useState(false)

  const [kontostand, setKontostand] = useState(0)
  const [kontostandNeu, setKontostandNeu] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)  // Roh-Response zum Testen

  async function laden() {
    setFehler('')
    setGeladen(false)
    setKontostandNeu('')
    setDebugInfo(null)
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmensname eingeben.')
      return
    }

    // === BACKEND: Kontostand laden ===
    const name = unternehmenName.trim()
    const url = `http://192.168.1.10:5000/company/${encodeURIComponent(name)}/savingsbook`
    const debug = { url }
    try {
      const response = await fetch(url)
      debug.status = response.status
      const text = await response.text()
      try { debug.data = JSON.parse(text) }
      catch { debug.data_raw = text }

      setDebugInfo(debug)
      if (!response.ok) {
        setFehler('Unternehmen nicht gefunden oder kein Konto.')
        return
      }
      // Backend liefert Array: [{ balance, name }]
      const d = debug.data
      const eintrag = Array.isArray(d) ? d[0] : d
      setKontostand(Number(eintrag?.balance) || 0)

      setGeladen(true)
      setBetrag('')
    } catch (error) {
      console.error('[Unternehmen Einzahlen] Fehler beim Laden:', error)
      debug.error = String(error)
      setDebugInfo(debug)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  async function einzahlen() {
    setFehler('')
    if (!geladen) {
      setFehler('Bitte zuerst Unternehmen laden.')
      return
    }
    const b = parseInt(betrag) || 0
    if (b <= 0) {
      setFehler('Bitte einen gültigen Betrag eingeben.')
      return
    }

    const neuerStand = kontostand + b

    // === BACKEND: Einzahlung an Unternehmen senden ===
    // PATCH http://192.168.1.10:5000/company/<name>/savingsbook
    // Body: { balance: (kontostand + betrag) }
    const url = `http://192.168.1.10:5000/company/${encodeURIComponent(unternehmenName.trim())}/savingsbook/balance`
    const body = { balance: neuerStand }
    const debug = { aktion: 'einzahlen', url, body }
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      })
      debug.status = response.status
      const text = await response.text()
      try { debug.data = JSON.parse(text) }
      catch { debug.data_raw = text }

      setDebugInfo(debug)
      if (response.ok) {
        setKontostandNeu(neuerStand)
        setKontostand(neuerStand)
      } else {
        setFehler('Fehler beim Einzahlen.')
      }
    } catch (error) {
      console.error('[Unternehmen Einzahlen] Fehler:', error)
      debug.error = String(error)
      setDebugInfo(debug)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
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
      <div className="ue-icon"><Emoji char="📥" /></div>
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

        {/* DEBUG: Roh-Response vom Backend */}
        {debugInfo && (
          <div className="ue-debug">
            <div className="ue-debug-titel">Debug — Roh-Response vom Backend</div>
            <pre className="ue-debug-pre">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
