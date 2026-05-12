import { useState } from 'react'

import './UnternehmenUmsatz.css'  //Wichtig immer CSS importieren

export default function UnternehmenUmsatz() {
  // ============================================================
  // EINGABEN:
  //   unternehmenName (String) - z.B. "Baeckerei Mueller"
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   umsatzDaten: Array von { label: String, wert: int }
  //   (Logik kommt spaeter)
  // ============================================================
  const [unternehmenName, setUnternehmenName] = useState('')
  const [fehler, setFehler] = useState('')
  const [geladen, setGeladen] = useState(false)
  const [geladenerName, setGeladenerName] = useState('')

  // Platzhalter-Daten - werden spaeter vom Backend ueberschrieben
  const [umsatzDaten, setUmsatzDaten] = useState([
    { label: 'Mo', wert: 0 },
    { label: 'Di', wert: 0 },
    { label: 'Mi', wert: 0 },
    { label: 'Do', wert: 0 },
    { label: 'Fr', wert: 0 },
  ])

  async function laden() {
    setFehler('')
    setGeladen(false)
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmenname eingeben.')
      return
    }

    // === BACKEND: Umsatz laden ===
    // GET /company/<name>/transactions → Umsatz-Daten
    try {
      const name = unternehmenName.trim()
      const response = await fetch(`http://192.168.1.10:5000/company/${encodeURIComponent(name)}/transactions`)

      if (!response.ok) {
        setFehler('Umsatzdaten konnten nicht geladen werden.')
        return
      }

      setGeladenerName(name)
      // TODO: Transactions-Response → umsatzDaten mappen (sobald Shape bekannt)
      setGeladen(true)
    } catch (error) {
      console.error('[UnternehmenUmsatz] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  // Hoechster Wert fuer Skalierung der Balken
  const maxWert = Math.max(...umsatzDaten.map(d => Number(d.wert) || 0), 10)

  return (
    <div className="uu-seite">
      <h2 className="uu-titel">Unternehmen Umsatz</h2>

      <div className="uu-inhalt">
        <div className="uu-feld">
          <label>Unternehmensname:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. Baeckerei Mueller"
            value={unternehmenName}
            onChange={e => { setUnternehmenName(e.target.value); setGeladen(false) }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel uu-action-btn" onClick={laden}>Laden</button>
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="uu-trennlinie"></div>

        {/* Chart-Bereich - immer sichtbar */}
        <div className="uu-chart-box">
          <div className="uu-chart-titel">
            {geladen ? `Umsatz: ${geladenerName}` : 'Umsatz'}
          </div>
          <div className="uu-chart">
            {umsatzDaten.map((d, i) => {
              const wert = Number(d.wert) || 0
              const hoehe = maxWert > 0 ? (wert / maxWert) * 100 : 0
              return (
                <div key={i} className="uu-balken-wrap">
                  <div className="uu-balken-wert">{wert}</div>
                  <div className="uu-balken-track">
                    <div className="uu-balken" style={{ height: `${hoehe}%` }}></div>
                  </div>
                  <div className="uu-balken-label">{d.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
