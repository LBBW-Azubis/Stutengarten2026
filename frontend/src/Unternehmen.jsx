import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './Unternehmen.css'  //Wichtig immer CSS importieren

export default function Unternehmen() {
  const navigate = useNavigate()

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   unternehmenName  (String) - z.B. "Baeckerei Mueller"
  //
  // AUTOMATISCH GESETZT:
  //   kontostand       (int) - immer 0 beim Erstellen
  //
  // VOM BACKEND (nach "Erstellen" Button):
  //   Unternehmen wird angelegt
  // ============================================================
  const [unternehmenName, setUnternehmenName] = useState('')   // String - User-Eingabe
  const [fehler, setFehler] = useState('')
  const [erstellt, setErstellt] = useState(false)

  function erstellen() {
    setFehler('')
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmenname eingeben.')
      return
    }

    // === BACKEND: Unternehmen erstellen ===
    // API-Call: POST /unternehmen
    // Body: { name: unternehmenName.trim() (String), kontostand: 0 (int) }
    // Response: { success: boolean }
    console.log('[Unternehmen] Erstellt:', {
      name: unternehmenName.trim(),   // String
      kontostand: 0,                   // int - immer 0
    })
    // === ENDE BACKEND ===

    setErstellt(true)
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
