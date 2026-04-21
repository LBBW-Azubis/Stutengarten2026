import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './Unternehmen.css'  //Wichtig immer CSS importieren

export default function Unternehmen() {
  const navigate = useNavigate()

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   unternehmenName    (String) - z.B. "Baeckerei Mueller"
  //   folderHandedOver   (String) - "0" (Nein) oder "1" (Ja)
  //
  // NACH "Erstellen":
  //   POST http://192.168.1.10:5000/company
  //   Body: { name: String, folder_handed_over: "0" | "1" }
  //   (Company-ID wird vom Backend automatisch vergeben)
  // ============================================================
  const [unternehmenName, setUnternehmenName] = useState('')
  const [folderHandedOver, setFolderHandedOver] = useState(null)  // null = noch nicht gewaehlt
  const [fehler, setFehler] = useState('')
  const [erstellt, setErstellt] = useState(false)

  async function erstellen() {
    setFehler('')
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmenname eingeben.')
      return
    }
    if (folderHandedOver === null) {
      setFehler('Bitte Ordner-Uebergabe auswaehlen (Ja oder Nein).')
      return
    }

    // === BACKEND: Unternehmen erstellen ===
    // POST http://192.168.1.10:5000/company
    // Body: { name: String, folder_handed_over: "0" | "1" }
    // (Savingsbook wird automatisch vom Backend angelegt)
    const url = 'http://192.168.1.10:5000/company'
    const body = { name: unternehmenName.trim(), folder_handed_over: folderHandedOver }
    console.log('[Unternehmen] POST URL:', url)
    console.log('[Unternehmen] POST Body:', JSON.stringify(body))
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      })
      console.log('[Unternehmen] Response Status:', response.status)

      if (response.ok) {
        setErstellt(true)
      } else {
        setFehler('Fehler beim Erstellen des Unternehmens.')
      }
    } catch (error) {
      console.error('[Unternehmen] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="un-seite">
      <div className="un-icon">🏢</div>
      <h2 className="un-titel">Unternehmen erstellen</h2>

      <div className="un-inhalt">
        <div className="un-feld">
          <label>Unternehmenname:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. Baeckerei Mueller"
            value={unternehmenName}
            onChange={e => { setUnternehmenName(e.target.value); setErstellt(false) }}
            onKeyDown={e => { if (e.key === 'Enter') erstellen() }}
          />
        </div>

        <div className="un-trennlinie"></div>

        <div className="un-feld">
          <label>Ordner uebergeben:</label>
          <div className="un-toggle">
            <button
              type="button"
              className={`un-toggle-btn un-toggle-ja${folderHandedOver === '1' ? ' un-toggle-aktiv' : ''}`}
              onClick={() => { setFolderHandedOver('1'); setErstellt(false) }}
            >
              Ja
            </button>
            <button
              type="button"
              className={`un-toggle-btn un-toggle-nein${folderHandedOver === '0' ? ' un-toggle-aktiv' : ''}`}
              onClick={() => { setFolderHandedOver('0'); setErstellt(false) }}
            >
              Nein
            </button>
          </div>
        </div>

        <div className="un-trennlinie"></div>

        <div className="un-feld">
          <label>Kontostand:</label>
          <span className="feld-input anzeige un-kontostand">0</span>
        </div>

        {fehler && <div className="un-msg un-msg-err">{fehler}</div>}
        {erstellt && <div className="un-msg un-msg-ok">Unternehmen "{unternehmenName.trim()}" wurde erstellt!</div>}

        <div className="un-buttons">
          <button className="btn btn-dunkel un-btn" onClick={erstellen}>Erstellen</button>
          <button className="btn btn-gruen un-btn" onClick={() => navigate(-1)}>Zurueck</button>
        </div>
      </div>
    </div>
  )
}
