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
  const [debugInfo, setDebugInfo] = useState(null)

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
    setDebugInfo(null)
    if (!unternehmenName.trim()) {
      setFehler('Bitte Unternehmenname eingeben.')
      return
    }

    // === BACKEND: Umsatz laden ===
    // 1) GET /company/<name>           → { id, name, folder_handed_over }
    // 2) GET /company/<id>/transactions → Umsatz-Daten
    const name = unternehmenName.trim()
    const debug = {}
    try {
      // 1) Company-ID holen
      const url1 = `http://192.168.1.10:5000/company/${encodeURIComponent(name)}`
      debug.schritt_1_url = url1
      const r1 = await fetch(url1)
      debug.schritt_1_status = r1.status
      const text1 = await r1.text()
      try { debug.schritt_1_data = JSON.parse(text1) }
      catch { debug.schritt_1_data_raw = text1 }

      if (!r1.ok) {
        setDebugInfo(debug)
        setFehler('Unternehmen nicht gefunden.')
        return
      }
      const companyId = debug.schritt_1_data?.id

      // 2) Transactions holen
      const url2 = `http://192.168.1.10:5000/company/${companyId}/transactions`
      debug.schritt_2_url = url2
      const r2 = await fetch(url2)
      debug.schritt_2_status = r2.status
      const text2 = await r2.text()
      try { debug.schritt_2_data = JSON.parse(text2) }
      catch { debug.schritt_2_data_raw = text2 }

      setDebugInfo(debug)
      if (!r2.ok) {
        setFehler('Umsatzdaten konnten nicht geladen werden.')
        return
      }

      setGeladenerName(name)
      // TODO: Transactions-Response → umsatzDaten mappen (sobald Shape bekannt)
      setGeladen(true)
    } catch (error) {
      console.error('[UnternehmenUmsatz] Fehler:', error)
      debug.error = String(error)
      setDebugInfo(debug)
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

        {/* DEBUG: Roh-Response vom Backend */}
        {debugInfo && (
          <div className="uu-debug">
            <div className="uu-debug-titel">Debug — Roh-Response vom Backend</div>
            <pre className="uu-debug-pre">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
