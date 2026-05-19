import { useState } from 'react'

import Emoji from './Emoji'
import Popup from './Popup'

import './UnternehmenMappe.css'  //Wichtig immer CSS importieren

import bwBankLogo from './images/BwBank_Logo.png'

export default function UnternehmenMappe() {
  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   unternehmenName  (String) - z.B. "Baeckerei Mueller"
  //   mappeBei         (String) - "kunde" oder "bank" (UI-State)
  //
  // NACH "Laden":
  //   GET http://192.168.1.10:5000/company/<name>
  //   Response: { id, name, folder_handed_over: 0|1, ... }
  //
  // NACH "Aktualisieren":
  //   PATCH http://192.168.1.10:5000/company/<name>
  //   Body: { folder_handed_over: true|false }
  // ============================================================
  const [unternehmenName, setUnternehmenName] = useState('')
  const [geladen, setGeladen] = useState(false)
  const [aktuellMappeBei, setAktuellMappeBei] = useState(null)  // 'kunde' | 'bank' - was aktuell in DB steht
  const [mappeBei, setMappeBei] = useState(null)                 // 'kunde' | 'bank' - User-Auswahl fuer Update
  const [fehler, setFehler] = useState('')
  const [popup, setPopup] = useState('')

  async function laden() {
    setFehler('')
    setGeladen(false)
    setAktuellMappeBei(null)
    setMappeBei(null)
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmensname eingeben.')
      return
    }

    // === BACKEND: Unternehmen-Daten laden ===
    try {
      const name = unternehmenName.trim()
      const response = await fetch(`http://192.168.1.10:5000/company/${encodeURIComponent(name)}`)

      if (!response.ok) {
        setFehler('Unternehmen nicht gefunden.')
        return
      }

      const data = await response.json()
      const wert = Number(data?.folder_handed_over) === 1 ? 'kunde' : 'bank'
      setAktuellMappeBei(wert)
      setMappeBei(wert)  // Vorauswahl auf aktuellen Wert
      setGeladen(true)
    } catch (error) {
      console.error('[UnternehmenMappe] Fehler beim Laden:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  async function aktualisieren() {
    setFehler('')
    if (!geladen) {
      setFehler('Bitte zuerst Unternehmen laden.')
      return
    }
    if (mappeBei === null) {
      setFehler('Bitte auswählen, wo die Mappe sein soll.')
      return
    }
    if (mappeBei === aktuellMappeBei) {
      setFehler('Es wurde keine Änderung gewählt.')
      return
    }

    // === BACKEND: folder_handed_over aktualisieren ===
    // PATCH http://192.168.1.10:5000/company/<name>
    // Body: { folder_handed_over: true | false }   (Kunde = true, Bank = false)
    const neuerWert = mappeBei === 'kunde'
    try {
      const response = await fetch(`http://192.168.1.10:5000/company/${encodeURIComponent(unternehmenName.trim())}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ folder_handed_over: neuerWert }),
      })

      if (response.ok) {
        setAktuellMappeBei(mappeBei)
        setPopup('Mappe wurde erfolgreich übergeben!')
      } else {
        setFehler('Fehler beim Aktualisieren.')
      }
    } catch (error) {
      console.error('[UnternehmenMappe] Fehler beim Aktualisieren:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="um-seite">
      <div className="um-icon"><Emoji char="📁" /></div>
      <h2 className="um-titel">Mappe übergeben</h2>

      <div className="um-inhalt">
        {/* Unternehmen laden */}
        <div className="um-feld">
          <label>Unternehmen:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="Unternehmenname"
            value={unternehmenName}
            onChange={e => { setUnternehmenName(e.target.value); setGeladen(false); setAktuellMappeBei(null); setMappeBei(null) }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel um-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="um-trennlinie"></div>

        {/* Aktueller Stand */}
        <div className="um-feld">
          <label>Aktuell:</label>
          <span className="feld-input anzeige">
            {geladen ? (aktuellMappeBei === 'kunde' ? 'Kunde' : 'Bank') : ''}
          </span>
        </div>

        <div className="um-trennlinie"></div>

        {/* Auswahl: Wo soll die Mappe hin? */}
        <div className="um-feld">
          <label>Wo ist die Mappe?</label>
          <div className="um-mappe-auswahl">
            <button
              type="button"
              className={`um-mappe-btn${mappeBei === 'kunde' ? ' um-mappe-aktiv' : ''}`}
              onClick={() => setMappeBei('kunde')}
              disabled={!geladen}
            >
              {mappeBei === 'kunde' && <span className="um-mappe-check">✓</span>}
              <Emoji char="👤" className="um-mappe-icon" />
              <span className="um-mappe-label">Kunde</span>
            </button>
            <button
              type="button"
              className={`um-mappe-btn${mappeBei === 'bank' ? ' um-mappe-aktiv' : ''}`}
              onClick={() => setMappeBei('bank')}
              disabled={!geladen}
            >
              {mappeBei === 'bank' && <span className="um-mappe-check">✓</span>}
              <img src={bwBankLogo} alt="BW Bank" className="um-mappe-icon-img" />
              <span className="um-mappe-label">Bank</span>
            </button>
          </div>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="um-action">
          <button className="btn btn-dunkel um-uebergeben-btn" onClick={aktualisieren}>Aktualisieren</button>
        </div>
      </div>

      <Popup message={popup} onClose={() => setPopup('')} />
    </div>
  )
}
