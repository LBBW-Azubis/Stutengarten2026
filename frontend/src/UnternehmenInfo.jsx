import { useState } from 'react'
import Emoji from './Emoji'

import './UnternehmenInfo.css'

export default function UnternehmenInfo() {
  const [unternehmenName, setUnternehmenName] = useState('')
  const [fehler, setFehler] = useState('')
  const [geladen, setGeladen] = useState(false)

  // Daten vom Backend
  const [infoData, setInfoData] = useState(null)

  async function laden() {
    setFehler('')
    setGeladen(false)
    setInfoData(null)
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmensname eingeben.')
      return
    }

    const nameInput = unternehmenName.trim()

    // === BACKEND: Unternehmen-Info laden ===
    // GET /company/<name>/savingsbook → { name, balance, folder_handed_over, ... }
    try {
      const response = await fetch(`http://192.168.1.10:5000/company/${encodeURIComponent(nameInput)}/savingsbook`)
      if (!response.ok) {
        setFehler('Unternehmen nicht gefunden.')
        return
      }
      const data = await response.json()
      // Backend kann Array oder Objekt liefern
      const eintrag = Array.isArray(data) ? data[0] : data
      setInfoData(eintrag || {})
      setGeladen(true)
    } catch (error) {
      console.error('[UnternehmenInfo] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="ui-seite">
      <div className="ui-icon"><Emoji char="🏢" /></div>
      <h2 className="ui-titel">Unternehmen Info</h2>

      <div className="ui-inhalt">
        <div className="ui-feld">
          <label>Unternehmensname:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. Baeckerei Mueller"
            value={unternehmenName}
            onChange={e => { setUnternehmenName(e.target.value); setGeladen(false) }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel ui-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="ui-trennlinie"></div>

        <div className="ui-feld">
          <label>Name:</label>
          <span className="feld-input anzeige">{geladen ? (infoData?.name ?? '') : ''}</span>
        </div>
        <div className="ui-feld">
          <label>Ordner übergeben:</label>
          <span className="feld-input anzeige">
            {geladen ? (Number(infoData?.folder_handed_over) === 1 ? 'Ja' : 'Nein') : ''}
          </span>
        </div>
        <div className="ui-feld">
          <label>Kontostand:</label>
          <span className="feld-input anzeige ui-kontostand">{geladen ? (infoData?.balance ?? '') : ''}</span>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}
      </div>
    </div>
  )
}
