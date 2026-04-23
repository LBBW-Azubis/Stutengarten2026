import { useState } from 'react'

import './AktienSammlung.css'  //Nutzt bestehende Sammlung-Styles
import './AlleAktien.css'

export default function AlleAktien() {
  const [eintraege, setEintraege] = useState([])
  const [geladen, setGeladen] = useState(false)
  const [fehler, setFehler] = useState('')

  async function laden() {
    setFehler('')
    setGeladen(false)
    setEintraege([])

    // === BACKEND: Alle Unternehmen mit Savingsbook laden ===
    // GET http://192.168.1.10:5000/companysavingsbook
    // Response: [{ name, folder_handed_over, balance, ... }]
    try {
      const response = await fetch('http://192.168.1.10:5000/companysavingsbook')
      if (!response.ok) {
        setFehler('Daten konnten nicht geladen werden.')
        return
      }
      const data = await response.json()
      setEintraege(Array.isArray(data) ? data : [])
      setGeladen(true)
    } catch (error) {
      console.error('[AlleAktien] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  const gesamtBalance = eintraege.reduce((s, e) => s + (Number(e.balance) || 0), 0)

  return (
    <div className="as-seite">
      <h2 className="as-titel">Alle Aktien</h2>

      <div className="as-inhalt">
        <div className="as-feld" style={{ justifyContent: 'center' }}>
          <button className="btn btn-dunkel as-action-btn" onClick={laden}>
            Alle Aktien / Unternehmen laden
          </button>
        </div>

        <div className="as-trennlinie"></div>

        <div className="as-liste">
          <div className="as-liste-titel">Alle Unternehmen</div>
          <div className="as-liste-header aa-liste-header">
            <span>Name</span>
            <span>Ordner</span>
            <span>Kontostand</span>
          </div>
          {geladen && eintraege.length > 0 ? (
            <>
              {eintraege.map((e, i) => (
                <div key={i} className="as-liste-zeile aa-liste-zeile">
                  <span className="as-aktienname">{e.name}</span>
                  <span className={`aa-ordner ${Number(e.folder_handed_over) === 1 ? 'aa-ordner-ja' : 'aa-ordner-nein'}`}>
                    {Number(e.folder_handed_over) === 1 ? 'Ja' : 'Nein'}
                  </span>
                  <span className="as-preis">{e.balance}</span>
                </div>
              ))}
              <div className="as-liste-gesamt aa-liste-gesamt">
                <span>Gesamt:</span>
                <span></span>
                <span>{eintraege.length} Unternehmen — {gesamtBalance}</span>
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
