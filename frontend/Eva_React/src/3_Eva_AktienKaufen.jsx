import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './3_Eva_AktienKaufen.css'  //Wichtig immer CSS importieren

export default function Eva_AktienKaufen() {
  const navigate = useNavigate()

  // ============================================================
  // BACKEND-VARIABLEN
  //
  // EINGABEN (User tippt ein):
  //   kontonummer   (String) - z.B. "K1" - Kunde laden
  //   anzahlAktien  (String, nur 1-3) - z.B. "2" - Anzahl Aktien zu kaufen
  //
  // VOM BACKEND GELADEN (nach "Laden" Button):
  //   kontostand    (int) - z.B. 150
  //   besitzAktien  (int) - z.B. 1 (wie viele Aktien der Kunde bereits besitzt)
  //
  // BERECHNUNG:
  //   1 Aktie = 3 Stuggis
  //   Max 3 Aktien pro Kunde
  // ============================================================
  const [kontonummer, setKontonummer] = useState('')     // String - User-Eingabe
  const [anzahlAktien, setAnzahlAktien] = useState('')   // String (1-3) - User-Eingabe
  const [fehler, setFehler] = useState('')
  const [kundeGeladen, setKundeGeladen] = useState(false)

  // === BACKEND: Diese Werte kommen spaeter vom Backend ===
  const [kontostand, setKontostand] = useState(0)        // int - vom Backend
  const [besitzAktien, setBesitzAktien] = useState(0)    // int - vom Backend
  // === ENDE BACKEND-VARIABLEN ===

  const PREIS_PRO_AKTIE = 3  // 1 Aktie = 3 Stuggis
  const MAX_AKTIEN = 3       // Max 3 Aktien pro Kunde

  async function laden() {
    setFehler('')
    setKundeGeladen(false)
    if (!kontonummer.trim()) {
      setFehler('Bitte Kontonummer eingeben.')
      return
    }

    // === BACKEND: Kunde laden ===
    // API-Call: GET http://192.168.1.10:5000/customer/<stutengarten_id>
    // Response 200: { id: int, stutengarten_id: String, first_name: String, last_name: String, kontostand: int, aktien: int }
    // Dummy-Daten zum Testen:
    setKontostand(150)
    setBesitzAktien(1)
    // === ENDE BACKEND ===

    setKundeGeladen(true)
    setAnzahlAktien('')
  }

  function kaufen() {
    setFehler('')
    const anzahl = parseInt(anzahlAktien) || 0

    if (anzahl < 1 || anzahl > 3) {
      setFehler('Bitte eine Anzahl zwischen 1 und 3 eingeben.')
      return
    }
    if (besitzAktien + anzahl > MAX_AKTIEN) {
      setFehler(`Maximal ${MAX_AKTIEN} Aktien erlaubt. Bereits ${besitzAktien} vorhanden.`)
      return
    }
    const kosten = anzahl * PREIS_PRO_AKTIE
    if (kosten > kontostand) {
      setFehler('Nicht genug Guthaben!')
      return
    }

    // === BACKEND: Aktien kaufen ===
    // API-Call: POST http://192.168.1.10:5000/aktien/kaufen
    // Body: { kontonummer: kontonummer.trim().toUpperCase() (String), anzahl: parseInt(anzahlAktien) (int) }
    // Response: { kontostandNeu: int, aktienNeu: int }
    console.log('[Aktien] Kauf:', {
      kontonummer: kontonummer.trim().toUpperCase(),  // String
      anzahl: anzahl,                                  // int
      kosten: kosten,                                  // int
    })
    // === ENDE BACKEND ===

    navigate('/mainsite')
  }

  // Nur 1, 2 oder 3 erlauben
  function handleAnzahlChange(e) {
    const val = e.target.value
    if (val === '' || /^[1-3]$/.test(val)) {
      setAnzahlAktien(val)
    }
  }

  const anzahl = parseInt(anzahlAktien) || 0
  const kosten = anzahl * PREIS_PRO_AKTIE
  const nochKaufbar = MAX_AKTIEN - besitzAktien

  return (
    <div className="ak-seite">
      <h2 className="ak-titel">Aktien kaufen</h2>

      <div className="ak-inhalt">
        {/* Kontonummer */}
        <div className="ak-feld">
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
          <button className="btn btn-dunkel ak-action-btn" onClick={laden}>Laden</button>
        </div>

        <div className="ak-trennlinie"></div>

        {/* Kundendaten */}
        <div className="ak-feld">
          <label>Kontostand:</label>
          <span className="feld-input anzeige">{kundeGeladen ? `${kontostand} Stuggis` : ''}</span>
        </div>
        <div className="ak-feld">
          <label>Besitz von Aktien:</label>
          <span className="feld-input anzeige">{kundeGeladen ? `${besitzAktien} / ${MAX_AKTIEN}` : ''}</span>
        </div>

        <div className="ak-trennlinie"></div>

        {/* Aktien kaufen */}
        <div className="ak-feld">
          <label>Anzahl Aktien:</label>
          <input
            type="text"
            inputMode="numeric"
            className="feld-input"
            placeholder={kundeGeladen ? `1-${nochKaufbar > 0 ? Math.min(3, nochKaufbar) : 0}` : '1-3'}
            value={anzahlAktien}
            onChange={handleAnzahlChange}
            onKeyDown={e => { if (e.key === 'Enter') kaufen() }}
          />
          <button className="btn btn-dunkel ak-action-btn" onClick={kaufen}>Kaufen</button>
        </div>

        {/* Kosten-Vorschau */}
        {kundeGeladen && anzahl > 0 && (
          <div className="ak-vorschau">
            {anzahl} Aktie{anzahl > 1 ? 'n' : ''} x {PREIS_PRO_AKTIE} Stuggis = <strong>{kosten} Stuggis</strong>
          </div>
        )}

        {fehler && <span className="fehler-text" style={{ display: 'block', textAlign: 'center' }}>{fehler}</span>}
      </div>
    </div>
  )
}
