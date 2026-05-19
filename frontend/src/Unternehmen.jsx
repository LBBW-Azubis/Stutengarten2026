import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Emoji from './Emoji'
import Popup from './Popup'

import './Unternehmen.css'  //Wichtig immer CSS importieren

export default function Unternehmen() {
  const navigate = useNavigate()
  const [popup, setPopup] = useState('')

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   unternehmenName    (String) - z.B. "Baeckerei Mueller"
  //   folderHandedOver   (String) - "0" (Nein) oder "1" (Ja)
  //
  // NACH "Erstellen": Zwei parallele API-Calls
  //   1) POST http://192.168.1.10:5000/company
  //      Body: { name: String, folder_handed_over: "0" | "1" }
  //   2) POST http://192.168.1.10:5000/share
  //      Body: { name: String }   (Aktie mit gleichem Namen wie das Unternehmen)
  // ============================================================
  const [unternehmenName, setUnternehmenName] = useState('')
  const [folderHandedOver, setFolderHandedOver] = useState(null)  // null = noch nicht gewaehlt
  const [fehler, setFehler] = useState('')
  const [erstellt, setErstellt] = useState(false)

  async function erstellen() {
    setFehler('')
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmensname eingeben.')
      return
    }
    if (folderHandedOver === null) {
      setFehler('Bitte Ordner-Übergabe auswählen (Ja oder Nein).')
      return
    }

    const name = unternehmenName.trim()

    // === BACKEND: Unternehmen + Aktie parallel erstellen ===
    const companyRequest = fetch('http://192.168.1.10:5000/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ name, folder_handed_over: folderHandedOver }),
    })
    const shareRequest = fetch('http://192.168.1.10:5000/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ name }),
    })

    try {
      const [companyResponse, shareResponse] = await Promise.all([companyRequest, shareRequest])
      console.log('[Unternehmen] Company Status:', companyResponse.status, '| Share Status:', shareResponse.status)

      if (companyResponse.ok && shareResponse.ok) {
        setErstellt(true)
        setPopup('Unternehmen wurde erfolgreich erstellt!')
      } else if (!companyResponse.ok && !shareResponse.ok) {
        setFehler('Fehler beim Erstellen von Unternehmen und Aktie.')
      } else if (!companyResponse.ok) {
        setFehler('Fehler beim Erstellen des Unternehmens.')
      } else {
        setFehler('Fehler beim Erstellen der Aktie.')
      }
    } catch (error) {
      console.error('[Unternehmen] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="un-seite">
      <div className="un-icon"><Emoji char="🏢" /></div>
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
          <label>Ordner übergeben:</label>
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
          <button className="btn btn-gruen un-btn" onClick={() => navigate(-1)}>Zurück</button>
        </div>
      </div>

      <Popup message={popup} onClose={() => setPopup('')} />
    </div>
  )
}
