import { useState } from 'react'

import Emoji from './Emoji'

import './UnternehmenLoeschen.css'  //Wichtig immer CSS importieren

export default function UnternehmenLoeschen() {
  const [unternehmenName, setUnternehmenName] = useState('')
  const [fehler, setFehler] = useState('')
  const [status, setStatus] = useState(null)  // { typ: 'ok'|'err', text: String }
  const [showConfirm, setShowConfirm] = useState(false)

  function confirmLoeschen() {
    setFehler('')
    setStatus(null)
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmensname eingeben.')
      return
    }
    setShowConfirm(true)
  }

  async function loeschen() {
    setShowConfirm(false)

    // === BACKEND: Unternehmen loeschen ===
    // DELETE http://192.168.1.10:5000/company/<company_name>
    const name = unternehmenName.trim()
    const url = `http://192.168.1.10:5000/company/${encodeURIComponent(name)}`
    console.log('[UnternehmenLoeschen] DELETE URL:', url)
    try {
      const response = await fetch(url, { method: 'DELETE' })
      console.log('[UnternehmenLoeschen] Response Status:', response.status)

      if (response.ok) {
        setStatus({ typ: 'ok', text: `Unternehmen "${name}" erfolgreich gelöscht!` })
        setUnternehmenName('')
      } else if (response.status === 404) {
        setStatus({ typ: 'err', text: 'Unternehmen nicht gefunden.' })
      } else {
        setStatus({ typ: 'err', text: 'Fehler beim Löschen des Unternehmens.' })
      }
    } catch (error) {
      console.error('[UnternehmenLoeschen] Fehler:', error)
      setStatus({ typ: 'err', text: 'Verbindung zum Server fehlgeschlagen.' })
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="ul-seite">
      <div className="ul-icon"><Emoji char="🗑️" /></div>
      <h2 className="ul-titel">Unternehmen löschen</h2>

      <div className="ul-inhalt">
        <div className="ul-feld">
          <label>Unternehmensname:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. Baeckerei Mueller"
            value={unternehmenName}
            onChange={e => { setUnternehmenName(e.target.value); setStatus(null) }}
            onKeyDown={e => { if (e.key === 'Enter') loeschen() }}
          />
          <button className="btn ul-action-btn" onClick={confirmLoeschen}>Löschen</button>
        </div>

        {fehler && <div className="ul-msg ul-msg-err">{fehler}</div>}
        {status && (
          <div className={`ul-msg ul-msg-${status.typ}`}>{status.text}</div>
        )}
      </div>

      {/* Bestaetigungs-Dialog */}
      {showConfirm && (
        <div className="ul-overlay" onClick={() => setShowConfirm(false)}>
          <div className="ul-dialog" onClick={e => e.stopPropagation()}>
            <div className="ul-dialog-titel">
              <Emoji char="⚠️" /> Unternehmen löschen
            </div>
            <div className="ul-dialog-text">
              Wollen Sie sicher <strong>"{unternehmenName.trim()}"</strong> löschen?
            </div>
            <div className="ul-dialog-buttons">
              <button className="ul-dialog-btn ul-dialog-btn-nein" onClick={() => setShowConfirm(false)}>Nein</button>
              <button className="ul-dialog-btn ul-dialog-btn-ja" onClick={loeschen}>Ja</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
