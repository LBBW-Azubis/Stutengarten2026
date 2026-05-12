import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './AktienVerkaufen.css'  //Wichtig immer CSS importieren

export default function AktienVerkaufen() {
  const navigate = useNavigate()

  // ============================================================
  // EINGABEN:
  //   kontonummer        (String) - Stutengarten-ID des Kunden
  //   ausgewaehlteIdx    (Array)  - Indizes der ausgewaehlten Aktien
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   vorname, nachname (String)
  //   kontostand        (int)
  //   aktien            (Array)  - mit share_name und current_value
  // ============================================================
  const [kontonummer, setKontonummer] = useState('')
  const [fehler, setFehler] = useState('')
  const [kundeGeladen, setKundeGeladen] = useState(false)

  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [aktien, setAktien] = useState([])

  const [ausgewaehlteIdx, setAusgewaehlteIdx] = useState([])

  async function laden() {
    setFehler('')
    setKundeGeladen(false)
    setAktien([])
    setAusgewaehlteIdx([])
    if (!kontonummer.trim()) {
      setFehler('Bitte Kontonummer eingeben.')
      return
    }

    // === BACKEND: Kunde + Aktien laden ===
    // 1) GET http://192.168.1.10:5000/customer/<ausweisnummer>
    // 2) GET http://192.168.1.10:5000/customer/<ausweisnummer>/shares
    try {
      const id = kontonummer.trim()

      // Kundendaten
      const r1 = await fetch(`http://192.168.1.10:5000/customer/${id}`)
      if (!r1.ok) {
        setFehler('Kunde nicht gefunden.')
        return
      }
      const d1 = await r1.json()
      setVorname(d1.first_name)
      setNachname(d1.last_name)

      // Aktien
      const r2 = await fetch(`http://192.168.1.10:5000/customer/${id}/shares`)
      if (!r2.ok) {
        setFehler('Aktien konnten nicht geladen werden.')
        return
      }
      const d2 = await r2.json()
      setAktien(Array.isArray(d2) ? d2 : [])

      setKundeGeladen(true)
    } catch (error) {
      console.error('[AktienVerkaufen] Fehler beim Laden:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  function toggleAuswahl(idx) {
    setAusgewaehlteIdx(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  function verkaufen() {
    setFehler('')
    if (!kundeGeladen) {
      setFehler('Bitte zuerst Kunde laden.')
      return
    }
    if (ausgewaehlteIdx.length === 0) {
      setFehler('Bitte mindestens eine Aktie auswählen.')
      return
    }

    // === BACKEND: Aktien verkaufen ===
    // TODO: API-Call einbauen
    console.log('[AktienVerkaufen] TODO: Verkaufen von', ausgewaehlteIdx.map(i => aktien[i]))
    // === ENDE BACKEND ===

    navigate('/mainsite')
  }

  const gesamtErloes = ausgewaehlteIdx.reduce(
    (sum, idx) => sum + (Number(aktien[idx]?.current_value) || 0),
    0
  )

  return (
    <div className="av-seite">
      <h2 className="av-titel">Aktie verkaufen</h2>

      <div className="av-inhalt">
        {/* Kontonummer */}
        <div className="av-feld">
          <label>Kontonummer:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. K1"
            maxLength="16"
            style={{ textTransform: 'uppercase' }}
            value={kontonummer}
            onChange={e => { setKontonummer(e.target.value); setKundeGeladen(false) }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel av-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="av-trennlinie"></div>

        {/* Kundendaten */}
        <div className="av-feld">
          <label>Vorname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? vorname : ''}</span>
        </div>
        <div className="av-feld">
          <label>Nachname:</label>
          <span className="feld-input anzeige">{kundeGeladen ? nachname : ''}</span>
        </div>

        <div className="av-trennlinie"></div>

        {/* Aktien-Auswahl */}
        <div className="av-label">Aktien zum Verkauf auswählen:</div>
        {kundeGeladen && aktien.length > 0 ? (
          <div className="av-aktien-grid">
            {aktien.map((a, i) => {
              const aktiv = ausgewaehlteIdx.includes(i)
              return (
                <button
                  key={i}
                  type="button"
                  className={`av-aktien-karte${aktiv ? ' av-aktien-karte-aktiv' : ''}`}
                  onClick={() => toggleAuswahl(i)}
                >
                  {aktiv && <span className="av-aktien-check">✓</span>}
                  <span className="av-aktien-name">{a.share_name}</span>
                  <div className="av-aktien-preis-box">
                    <span className="av-aktien-preis-label">Preis</span>
                    <span className="av-aktien-wert">{a.current_value}</span>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="av-aktien-leer">
            {kundeGeladen ? 'Keine Aktien vorhanden' : 'Kontonummer eingeben und Laden drücken'}
          </div>
        )}

        {ausgewaehlteIdx.length > 0 && (
          <div className="av-erloes">
            <strong>{ausgewaehlteIdx.length}</strong> Aktie{ausgewaehlteIdx.length > 1 ? 'n' : ''} ausgewählt —
            Erlös: <strong>{gesamtErloes}</strong>
          </div>
        )}

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="av-trennlinie"></div>

        <div className="av-action">
          <button className="btn btn-dunkel av-verkauf-btn" onClick={verkaufen}>Verkaufen</button>
        </div>
      </div>
    </div>
  )
}
