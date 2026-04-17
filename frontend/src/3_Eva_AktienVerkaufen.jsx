import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'

import './3_Eva_AktienVerkaufen.css'  //Wichtig immer CSS importieren

import aktienIcon from './images/Bild1.png'

export default function Eva_AktienVerkaufen() {
  const navigate = useNavigate()
  const { aktuellerNutzer, addTranAktion } = useAppContext()

  const n = aktuellerNutzer || { id: '...', vorname: '', nachname: '', kontostand: 0, aktien: [] }

  const [selected, setSelected] = useState([])
  const [verkauft, setVerkauft] = useState(false)
  const [erloes, setErloes] = useState(0)

  const currentErloes = selected.reduce((s, idx) => s + (n.aktien[idx]?.wert || 0), 0)
  const neuKS = n.kontostand + currentErloes

  function toggleSelect(idx) {
    setSelected(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  function verkaufen() {
    if (!selected.length) {
      alert('Bitte mindestens eine Aktie auswaehlen.')
      return
    }
    const e = selected.reduce((s, i) => s + n.aktien[i].wert, 0)
    n.aktien = n.aktien.filter((_, i) => !selected.includes(i))
    n.kontostand += e
    addTranAktion(n)
    setErloes(e)
    setVerkauft(true)
  }

  // Nach Verkauf: Fertig-Ansicht
  if (verkauft) {
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
              <span className="feld-input anzeige">{n.kontostand - erloes}</span>
            </div>
            <div className="feld-zeile">
              <label>Kontostand neu:</label>
              <span className="feld-input anzeige">{n.kontostand}</span>
            </div>
            <table className="daten-tabelle">
              <thead>
                <tr><th>Aktiennummer</th><th>Wert</th></tr>
              </thead>
              <tbody>
                {n.aktien.length > 0
                  ? n.aktien.map((a, i) => (
                    <tr key={i}><td>{a.nummer}</td><td>{a.wert}</td></tr>
                  ))
                  : <tr><td colSpan="2" style={{ textAlign: 'center', color: '#888' }}>Keine Aktien</td></tr>
                }
              </tbody>
            </table>
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-dunkel" onClick={() => navigate(-1)}>Fertig</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Normale Verkauf-Ansicht
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
          <div className="feld-zeile">
            <label>Kontostand neu:</label>
            <span className="feld-input anzeige">{selected.length > 0 ? neuKS : '...'}</span>
          </div>
          <table className="daten-tabelle">
            <thead>
              <tr><th></th><th>Aktiennummer</th><th>Wert</th></tr>
            </thead>
            <tbody>
              {n.aktien.length > 0
                ? n.aktien.map((a, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(i)}
                        onChange={() => toggleSelect(i)}
                        style={{ accentColor: '#36C291', width: 16, height: 16 }}
                      />
                    </td>
                    <td>{a.nummer}</td>
                    <td>{a.wert}</td>
                  </tr>
                ))
                : <tr><td colSpan="3" style={{ textAlign: 'center', color: '#888', padding: 12 }}>Keine Aktien vorhanden</td></tr>
              }
            </tbody>
          </table>
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-dunkel" onClick={verkaufen}>verkaufen</button>
          </div>
        </div>
      </div>
    </div>
  )
}
