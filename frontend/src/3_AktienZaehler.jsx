import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'

import './3_AktienZaehler.css'  //Wichtig immer CSS importieren

import aktienIcon from './images/Bild1.png'

export default function AktienZaehler() {
  const navigate = useNavigate()
  const { aktuellerNutzer, letzteGekaufteAktien } = useAppContext()
  const [, forceUpdate] = useState(0)

  const n = aktuellerNutzer || { id: '...', vorname: '', nachname: '', kontostand: 0, aktien: [] }
  const zuletzt = letzteGekaufteAktien || []
  const basisWert = 3

  const [kurs, setKurs] = useState(null)
  const [fehler, setFehler] = useState('')

  const kursBtns = [
    { id: 'kurs-mm', val: -2, label: '- -', klasse: 'minus-gross' },
    { id: 'kurs-mi', val: -1, label: '-',   klasse: 'minus-klein' },
    { id: 'kurs-pl', val: +1, label: '+',   klasse: 'plus-klein' },
    { id: 'kurs-pp', val: +2, label: '+ +', klasse: 'plus-gross' },
  ]

  const neuerWert = kurs !== null ? Math.max(0, basisWert + kurs) : null

  function eintragen() {
    if (kurs === null) {
      setFehler('Bitte zuerst das Rad-Ergebnis auswaehlen.')
      return
    }
    setFehler('')
    const wert = Math.max(0, basisWert + kurs)
    zuletzt.forEach(a => { a.wert = wert })
    navigate('/mainsite/aktien/verkaufen')
  }

  return (
    <div className="page">
      <div className="seite-layout">
        <div className="seite-icon">
          <img src={aktienIcon} alt="Aktien" />
        </div>
        <div className="seite-felder">
          <div className="feld-zeile">
            <label>Name:</label>
            <span className="feld-input anzeige">{n.vorname} {n.nachname}</span>
          </div>
          <div className="feld-zeile">
            <label>Kontostand:</label>
            <span className="feld-input anzeige">{n.kontostand}</span>
          </div>
          <div className="counter-zeile">
            {kursBtns.map(b => (
              <button
                key={b.id}
                className={`cnt-btn ${b.klasse}${kurs === b.val ? ' cnt-btn-aktiv' : ''}`}
                onClick={() => setKurs(b.val)}
              >
                {b.label}
              </button>
            ))}
            <div
              className={`cnt-val${kurs === 0 ? ' cnt-val-aktiv' : ''}`}
              style={{ cursor: 'pointer' }}
              title="0 auswaehlen"
              onClick={() => setKurs(0)}
            >
              {kurs === null ? '0' : (kurs > 0 ? '+' + kurs : String(kurs))}
            </div>
            <button className="btn btn-dunkel" style={{ marginLeft: 12 }} onClick={eintragen}>eintragen</button>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.9rem', color: '#123250' }}>
            {kurs !== null
              ? `Kurs: ${kurs > 0 ? '+' + kurs : kurs} → Aktie jetzt ${neuerWert} wert`
              : 'Rad-Ergebnis auswaehlen:'}
          </div>
          {fehler && <span className="fehler-text" style={{ display: 'block' }}>{fehler}</span>}
        </div>
      </div>
    </div>
  )
}
