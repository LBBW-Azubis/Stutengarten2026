import { useState } from 'react'

import './AktienSammlung.css'  //Wichtig immer CSS importieren

export default function AktienSammlung() {
  // ============================================================
  // EINGABEN:
  //   kontonummer (String) - Stutengarten-ID / Ausweisnummer, z.B. "K1"
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   vorname, nachname (String)
  //   aktien (Array) - alle Aktien des Kunden
  // ============================================================
  const [kontonummer, setKontonummer] = useState('')
  const [fehler, setFehler] = useState('')
  const [geladen, setGeladen] = useState(false)

  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [aktien, setAktien] = useState([])

  async function laden() {
    setFehler('')
    setGeladen(false)
    setAktien([])
    if (!kontonummer.trim()) {
      setFehler('Bitte Kontonummer eingeben.')
      return
    }

    // === BACKEND: Kunde + Aktien laden ===
    // 1) GET http://192.168.1.10:5000/customer/<stutengarten_id>
    // 2) GET http://192.168.1.10:5000/customer/<stutengarten_id>/shares
    try {
      const id = kontonummer.trim()

      // Kundendaten
      const r1 = await fetch(`http://192.168.1.10:5000/customer/${id}`)
      const d1 = await r1.json()
      if (!r1.ok) {
        setFehler('Kunde nicht gefunden.')
        return
      }
      setVorname(d1.first_name)
      setNachname(d1.last_name)

      // Aktien
      const r2 = await fetch(`http://192.168.1.10:5000/customer/${id}/shares`)
      const d2 = await r2.json()
      if (!r2.ok) {
        setFehler('Aktien konnten nicht geladen werden.')
        return
      }
      setAktien(Array.isArray(d2) ? d2 : [])

      setGeladen(true)
    } catch (error) {
      console.error('[Aktien Sammlung] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  return (
    <div className="as-seite">
      <h2 className="as-titel">Aktien Sammlung</h2>

      <div className="as-inhalt">
        <div className="as-feld">
          <label>Kontonummer:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="z.B. K1"
            maxLength="16"
            style={{ textTransform: 'uppercase' }}
            value={kontonummer}
            onChange={e => { setKontonummer(e.target.value); setGeladen(false) }}
            onKeyDown={e => { if (e.key === 'Enter') laden() }}
          />
          <button className="btn btn-dunkel as-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="as-trennlinie"></div>

        <div className="as-feld">
          <label>Vorname:</label>
          <span className="feld-input anzeige">{geladen ? vorname : ''}</span>
        </div>
        <div className="as-feld">
          <label>Nachname:</label>
          <span className="feld-input anzeige">{geladen ? nachname : ''}</span>
        </div>

        <div className="as-trennlinie"></div>

        <div className="as-liste">
          <div className="as-liste-titel">Aktien-Uebersicht</div>
          <div className="as-liste-header">
            <span>Aktienname</span>
            <span>Preis</span>
          </div>
          {geladen && aktien.length > 0 ? (
            <>
              {aktien.map((a, i) => (
                <div key={i} className="as-liste-zeile">
                  <span className="as-aktienname">{a.share_name}</span>
                  <span className="as-preis">{a.current_value}</span>
                </div>
              ))}
              <div className="as-liste-gesamt">
                <span>Gesamt:</span>
                <span>{aktien.length} Aktien — Gesamter Wert: {aktien.reduce((s, a) => s + (Number(a.current_value) || 0), 0)}</span>
              </div>
            </>
          ) : (
            <div className="as-liste-leer">
              {geladen ? 'Keine Aktien vorhanden' : 'Kontonummer eingeben und Laden druecken'}
            </div>
          )}
        </div>

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}
      </div>
    </div>
  )
}
