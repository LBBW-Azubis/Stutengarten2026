import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'

import './Berufe.css'  //Wichtig immer CSS importieren

import berufeIcon from './images/Berufe_Kachel.png'
import suchenIcon from './images/Suchen.png'

export default function Berufe() {
  const navigate = useNavigate()
  const { aktuellerNutzer } = useAppContext()
  const [, forceUpdate] = useState(0)

  const [berufInput, setBerufInput] = useState('')
  const [berufAnzeige, setBerufAnzeige] = useState('')
  const [zeigeWeiter, setZeigeWeiter] = useState(false)

  function suchen() {
    const val = berufInput.trim()
    if (!val) return
    setBerufAnzeige(val)
    setZeigeWeiter(true)
  }

  function hinzufuegen() {
    if (aktuellerNutzer) {
      aktuellerNutzer.beruf = { name: berufAnzeige, lohn: 100 }
    }
    navigate('/mainsite/berufeinzahlen')
  }

  return (
    <div className="page">
      <div className="berufe-such-layout">
        <div className="berufe-such-icon">
          <img src={berufeIcon} alt="Berufe" />
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#123250' }}>Berufe</div>
        <div className="feld-zeile">
          <label>Beruf:</label>
          <input
            type="text"
            className="feld-input"
            placeholder="…."
            value={berufInput}
            onChange={e => setBerufInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') suchen() }}
          />
          <button className="such-btn" onClick={suchen}>
            <img src={suchenIcon} alt="Suchen" style={{ width: 32, height: 32 }} />
          </button>
        </div>
        {zeigeWeiter && (
          <div className="feld-zeile">
            <label>Beruf:</label>
            <span className="feld-input anzeige">{berufAnzeige}</span>
            <button className="btn btn-dunkel" onClick={hinzufuegen}>hinzufuegen</button>
          </div>
        )}
      </div>
    </div>
  )
}
