import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Popup from './Popup'

import './AktienKaufen.css'  //Wichtig immer CSS importieren

export default function AktienKaufen() {
  const navigate = useNavigate()
  const [popup, setPopup] = useState('')

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   kontonummer   (String) - z.B. "K1" - Kunde laden
  //   aktienname    (String) - z.B. "BWBank" - Name der zu kaufenden Aktie
  //
  // FESTER PREIS: 3 Stuggis pro Aktie
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   kontostand    (int) - z.B. 150
  // ============================================================
  const AKTIEN_PREIS = 3
  const [kontonummer, setKontonummer] = useState('')     // String - User-Eingabe
  const [aktienname, setAktienname] = useState('')       // String - User-Eingabe
  const [fehler, setFehler] = useState('')
  const [kundeGeladen, setKundeGeladen] = useState(false)

  // === BACKEND: Diese Werte kommen spaeter vom Backend ===
  const [vorname, setVorname] = useState('')              // String - vom Backend
  const [nachname, setNachname] = useState('')            // String - vom Backend
  const [kontostand, setKontostand] = useState(0)        // int - vom Backend
  // === ENDE BACKEND-VARIABLEN ===

  async function laden() {
    setFehler('')
    setKundeGeladen(false)
    if (!kontonummer.trim()) {
      setFehler('Bitte Kontonummer eingeben.')
      return
    }

    // === BACKEND: Kunde + Sparbuch laden ===
    try {
      const id = kontonummer.trim()
      const response = await fetch(`http://192.168.1.10:5000/customer/${id}`)
      const data = await response.json()
      if (!response.ok) { setFehler('Kunde nicht gefunden.'); return }
      setVorname(data.first_name)
      setNachname(data.last_name)

      const sbResponse = await fetch(`http://192.168.1.10:5000/customer/${id}/savingsbook`)
      const sbData = await sbResponse.json()
      if (sbResponse.ok && Array.isArray(sbData) && sbData.length > 0) {
        setKontostand(sbData[0].balance || 0)
      } else { setKontostand(0) }
    } catch (error) {
      console.error('[Aktien] Fehler beim Laden:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
      return
    }
    // === ENDE BACKEND ===

    setKundeGeladen(true)
    setAktienname('')
  }

  async function kaufen() {
    setFehler('')
    if (!aktienname.trim()) {
      setFehler('Bitte Aktienname eingeben.')
      return
    }
    if (AKTIEN_PREIS > kontostand) {
      setFehler('Nicht genug Guthaben!')
      return
    }

    // === BACKEND: Aktien kaufen ===
    // API-Call: POST http://192.168.1.10:5000/customer/<stutengarten_id>/shares/buy
    // Body: { share_name: String, amount: int } - amount ist fest 3 Stuggis pro Aktie
    const url = `http://192.168.1.10:5000/customer/${kontonummer.trim()}/shares/buy`
    const body = { share_name: aktienname.trim(), amount: AKTIEN_PREIS }
    console.log('[Aktien] POST URL:', url)
    console.log('[Aktien] POST Body:', JSON.stringify(body))
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      console.log('[Aktien] Response Status:', response.status)
      console.log('[Aktien] Response Data:', data)

      if (response.ok) {
        setPopup('Aktie wurde erfolgreich gekauft!')
      } else {
        setFehler('Fehler beim Aktienkauf.')
      }
    } catch (error) {
      console.error('[Aktien] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="ak-seite">
      <h2 className="ak-titel">Aktien kaufen</h2>

      <div className="ak-inhalt">
        {/* Kontonummer */}
        <div className="ak-feld">
          <label>Kontonummer:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. K1"
            maxLength="16"
            style={{ textTransform: 'uppercase' }}
            value={kontonummer}
            onChange={e => { setKontonummer(e.target.value); setKundeGeladen(false) }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel ak-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="ak-trennlinie"></div>

        {/* Kundendaten */}
        <div className="ak-feld">
          <label>Vorname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? vorname : ''}</span>
        </div>
        <div className="ak-feld">
          <label>Nachname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? nachname : ''}</span>
        </div>
        <div className="ak-feld">
          <label>Kontostand:</label>
          <span className="feld-input anzeige">{kundeGeladen ? `${kontostand}` : ''}</span>
        </div>

        <div className="ak-trennlinie"></div>

        {/* Aktien kaufen */}
        <div className="ak-feld">
          <label>Aktienname:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. BWBank"
            value={aktienname}
            onChange={e => setAktienname(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') kaufen() }}
          />
        </div>
        <div className="ak-feld">
          <label>Preis:</label>
          <span className="feld-input anzeige">{AKTIEN_PREIS} Stuggis</span>
          <button className="btn btn-dunkel ak-action-btn" onClick={kaufen}>Kaufen</button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}
      </div>

      <Popup message={popup} onClose={() => { setPopup(''); navigate('/mainsite') }} />
    </div>
  )
}
