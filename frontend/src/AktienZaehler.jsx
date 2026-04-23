import { useState } from 'react'

import './AktienZaehler.css'  //Wichtig immer CSS importieren

export default function AktienZaehler() {
  // ============================================================
  // EINGABEN:
  //   kontonummer (String) - Stutengarten-ID des Kunden
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   vorname, nachname (String)
  //   aktien (Array) - alle Aktien des Kunden mit current_value
  //
  // NACH "Eintragen":
  //   PATCH http://192.168.1.10:5000/customer/<id>/shares/<share_name>
  //   Body: { new_value: int } - neuer Kurswert (alt + gewaehlter Kurs)
  // ============================================================
  const [kontonummer, setKontonummer] = useState('')
  const [fehler, setFehler] = useState('')
  const [geladen, setGeladen] = useState(false)

  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [aktien, setAktien] = useState([])

  const [ausgewaehltIdx, setAusgewaehltIdx] = useState(null)
  const [kurs, setKurs] = useState(null)

  const kursOptionen = [
    { wert: -2, label: '−2', farbe: 'dunkelrot',   text: 'Starker Verlust' },
    { wert: -1, label: '−1', farbe: 'hellrot',     text: 'Leichter Verlust' },
    { wert:  0, label:  '0', farbe: 'neutral',     text: 'Keine Änderung' },
    { wert: +1, label: '+1', farbe: 'hellgruen',   text: 'Leichter Gewinn' },
    { wert: +2, label: '+2', farbe: 'dunkelgruen', text: 'Starker Gewinn' },
  ]

  async function laden() {
    setFehler('')
    setGeladen(false)
    setAktien([])
    setAusgewaehltIdx(null)
    setKurs(null)
    if (!kontonummer.trim()) {
      setFehler('Bitte Kontonummer eingeben.')
      return
    }

    // === BACKEND: Kunde + Aktien laden ===
    try {
      const id = kontonummer.trim()

      const r1 = await fetch(`http://192.168.1.10:5000/customer/${id}`)
      const d1 = await r1.json()
      if (!r1.ok) {
        setFehler('Kunde nicht gefunden.')
        return
      }
      setVorname(d1.first_name)
      setNachname(d1.last_name)

      const r2 = await fetch(`http://192.168.1.10:5000/customer/${id}/shares`)
      const d2 = await r2.json()
      if (!r2.ok) {
        setFehler('Aktien konnten nicht geladen werden.')
        return
      }
      setAktien(Array.isArray(d2) ? d2 : [])
      setGeladen(true)
    } catch (error) {
      console.error('[AktienZaehler] Fehler beim Laden:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  async function eintragen() {
    setFehler('')
    if (!geladen) {
      setFehler('Bitte zuerst Kunde laden.')
      return
    }
    if (ausgewaehltIdx === null) {
      setFehler('Bitte eine Aktie auswählen.')
      return
    }
    if (kurs === null) {
      setFehler('Bitte Drehrad-Ergebnis auswählen.')
      return
    }

    const aktie = aktien[ausgewaehltIdx]
    const neuerWert = Math.max(0, (Number(aktie.current_value) || 0) + kurs)

    // Bei 0 keine Aenderung noetig → kein Backend-Call
    if (kurs === 0) {
      setAusgewaehltIdx(null)
      setKurs(null)
      return
    }

    // === BACKEND: Kurs eintragen ===
    // PATCH http://192.168.1.10:5000/customer/<id>/shares/<share_name>
    // Body: { new_value: int }
    const url = `http://192.168.1.10:5000/customer/${kontonummer.trim()}/shares/${encodeURIComponent(aktie.share_name)}`
    const body = { new_value: neuerWert }
    console.log('[AktienZaehler] PATCH URL:', url)
    console.log('[AktienZaehler] PATCH Body:', JSON.stringify(body))
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      console.log('[AktienZaehler] Response Status:', response.status)
      console.log('[AktienZaehler] Response Data:', data)

      if (response.ok) {
        const updated = [...aktien]
        updated[ausgewaehltIdx] = { ...aktie, current_value: neuerWert }
        setAktien(updated)
        setAusgewaehltIdx(null)
        setKurs(null)
      } else {
        setFehler('Fehler beim Eintragen.')
      }
    } catch (error) {
      console.error('[AktienZaehler] Fehler:', error)
      setFehler('Verbindung zum Server fehlgeschlagen.')
    }
    // === ENDE BACKEND ===
  }

  const gewaehlteAktie = ausgewaehltIdx !== null ? aktien[ausgewaehltIdx] : null
  const gewaehlteOption = kursOptionen.find(o => o.wert === kurs)
  const neuerWert = gewaehlteAktie && kurs !== null
    ? Math.max(0, (Number(gewaehlteAktie.current_value) || 0) + kurs)
    : null

  return (
    <div className="az-seite">
      <h2 className="az-titel">Aktien-Drehrad</h2>

      <div className="az-inhalt">
        {/* Kontonummer + Laden */}
        <div className="az-feld">
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
          <button className="btn btn-dunkel az-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="az-trennlinie"></div>

        <div className="az-feld">
          <label>Vorname:</label>
          <span className="feld-input anzeige">{geladen ? vorname : ''}</span>
        </div>
        <div className="az-feld">
          <label>Nachname:</label>
          <span className="feld-input anzeige">{geladen ? nachname : ''}</span>
        </div>

        <div className="az-trennlinie"></div>

        {/* Aktien-Auswahl als grosse Karten */}
        <div className="az-label">Wähle eine Aktie:</div>
        {geladen && aktien.length > 0 ? (
          <div className="az-aktien-grid">
            {aktien.map((a, i) => (
              <button
                key={i}
                type="button"
                className={`az-aktien-karte${ausgewaehltIdx === i ? ' az-aktien-karte-aktiv' : ''}`}
                onClick={() => setAusgewaehltIdx(i)}
              >
                {ausgewaehltIdx === i && <span className="az-aktien-check">✓</span>}
                <span className="az-aktien-name">{a.share_name}</span>
                <div className="az-aktien-preis-box">
                  <span className="az-aktien-preis-label">Preis</span>
                  <span className="az-aktien-wert">{a.current_value}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="az-aktien-leer">
            {geladen ? 'Keine Aktien vorhanden' : 'Kontonummer eingeben und Laden drücken'}
          </div>
        )}

        <div className="az-trennlinie"></div>

        <div className="az-label">Drehrad-Ergebnis wählen:</div>

        <div className="az-kurs-reihe">
          {kursOptionen.map(o => (
            <button
              key={o.wert}
              className={`az-kurs-btn az-kurs-${o.farbe}${kurs === o.wert ? ' az-kurs-aktiv' : ''}`}
              onClick={() => setKurs(o.wert)}
            >
              <span className="az-kurs-zahl">{o.label}</span>
              <span className="az-kurs-text">{o.text}</span>
            </button>
          ))}
        </div>

        {gewaehlteAktie && gewaehlteOption && (
          <div className="az-auswahl">
            <strong>{gewaehlteAktie.share_name}</strong>: {gewaehlteAktie.current_value} → <strong>{neuerWert}</strong> ({gewaehlteOption.label})
          </div>
        )}

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}

        <div className="az-trennlinie"></div>

        <div className="az-action">
          <button className="btn btn-dunkel az-eintragen-btn" onClick={eintragen}>Eintragen</button>
        </div>
      </div>
    </div>
  )
}
