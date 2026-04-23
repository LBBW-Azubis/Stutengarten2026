import { useState } from 'react'

import './AktienSammlung.css'  //Nutzt bestehende Sammlung-Styles

export default function AlleUnternehmen() {
  const [unternehmen, setUnternehmen] = useState([])
  const [geladen, setGeladen] = useState(false)
  const [fehler, setFehler] = useState('')

  async function laden() {
    setFehler('')
    setGeladen(false)
    setUnternehmen([])

    // === BACKEND: Alle Unternehmen laden ===
    // GET http://192.168.1.10:5000/companysavingsbook
    // Response: [{ name, balance, folder_handed_over, ... }]
    try {
      const response = await fetch('http://192.168.1.10:5000/companysavingsbook')
      if (!response.ok) {
        setFehler('Unternehmen konnten nicht geladen werden.')
        return
      }
      const data = await response.json()
      setUnternehmen(Array.isArray(data) ? data : [])
      setGeladen(true)
    } catch (error) {
      console.error('[AlleUnternehmen] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="as-seite">
      <h2 className="as-titel">Alle Unternehmen</h2>

      <div className="as-inhalt">
        <div className="as-feld" style={{ justifyContent: 'center' }}>
          <button className="btn btn-dunkel as-action-btn" onClick={laden}>
            Alle Unternehmen laden
          </button>
        </div>

        <div className="as-trennlinie"></div>

        <div className="as-liste">
          <div className="as-liste-titel">Unternehmen</div>
          <div className="as-liste-header">
            <span>Name</span>
            <span></span>
          </div>
          {geladen && unternehmen.length > 0 ? (
            <>
              {unternehmen.map((u, i) => (
                <div key={i} className="as-liste-zeile">
                  <span className="as-aktienname">{u.name}</span>
                  <span></span>
                </div>
              ))}
              <div className="as-liste-gesamt">
                <span>Gesamt:</span>
                <span>{unternehmen.length} Unternehmen</span>
              </div>
            </>
          ) : (
            <div className="as-liste-leer">
              {geladen ? 'Keine Unternehmen vorhanden' : 'Button oben drücken zum Laden'}
            </div>
          )}
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}
      </div>
    </div>
  )
}
