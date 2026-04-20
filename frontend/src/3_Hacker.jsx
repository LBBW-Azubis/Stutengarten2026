import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import './3_Hacker.css'  //Wichtig immer CSS importieren

import hackerIcon from './images/Hacker_Bidl.png'

export default function Hacker() {
  const navigate = useNavigate()
  const [spielGestartet, setSpielGestartet] = useState(false)
  const [gefunden, setGefunden] = useState(0)
  const [cells, setCells] = useState([])
  const [statusText, setStatusText] = useState('')

  const EMOJIS = ['🐛', '💣', '👾', '🦠', '☠️']
  const ANZAHL = 5
  const ZEILEN = 30
  const SPALTEN = 6
  const CODE_TOKENS = [
    'if(x>0)', 'return null;', 'var _k=[];', 'new Error()',
    '0x4F2A', 'delete obj', 'while(1)', 'eval(src)',
    'break;', 'import *', 'throw e;', 'const z={}',
    'process.exit', 'Buffer.from', 'undefined', '__proto__',
    '!==false', '===null', '>>0x10', '<<0xFF',
  ]

  function starteSpiel() {
    const allPositionen = []
    for (let r = 0; r < ZEILEN; r++)
      for (let c = 0; c < SPALTEN; c++) allPositionen.push(r * SPALTEN + c)

    const shuffled = allPositionen.sort(() => Math.random() - 0.5)
    const fehlerPos = new Set(shuffled.slice(0, ANZAHL))

    const newCells = []
    for (let i = 0; i < ZEILEN * SPALTEN; i++) {
      const istFehler = fehlerPos.has(i)
      newCells.push({
        istFehler,
        text: istFehler ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)],
        found: false,
        shaking: false,
      })
    }
    setCells(newCells)
    setGefunden(0)
    setStatusText(`Gefunden: 0 / ${ANZAHL}`)
    setSpielGestartet(true)
  }

  function handleClick(idx) {
    const cell = cells[idx]
    if (cell.istFehler && !cell.found) {
      const newCells = [...cells]
      newCells[idx] = { ...cell, found: true }
      setCells(newCells)
      const neueGefunden = gefunden + 1
      setGefunden(neueGefunden)
      setStatusText(`Gefunden: ${neueGefunden} / ${ANZAHL}`)
      if (neueGefunden >= ANZAHL) {
        setStatusText('Alle Fehler gefunden! Bank gerettet!')
        setTimeout(() => navigate(-1), 1500)
      }
    } else if (!cell.istFehler) {
      // Falscher Klick - kurzes Schuetteln
      const newCells = [...cells]
      newCells[idx] = { ...cell, shaking: true }
      setCells(newCells)
      setTimeout(() => {
        setCells(prev => {
          const c = [...prev]
          c[idx] = { ...c[idx], shaking: false }
          return c
        })
      }, 400)
    }
  }

  // Startseite
  if (!spielGestartet) {
    return (
      <div className="hacker-seite">
        <div className="hacker-icon-wrap">
          <img src={hackerIcon} alt="Hacker" />
        </div>
        <div className="hacker-text">Die Bank wurde gehackt!!!</div>
        <button className="btn btn-dunkel" onClick={starteSpiel}>Bank retten</button>
      </div>
    )
  }

  // Spiel-Ansicht
  return (
    <div className="hacker-spiel-box">
      <div className="hk-header">
        <span>Finde alle <strong>{ANZAHL} Fehler</strong> im Hacker-Code!</span>
        <span>{statusText}</span>
      </div>
      <div className="hk-code-block">
        {cells.map((cell, i) => (
          <span
            key={i}
            className={`hk-cell ${cell.istFehler
              ? (cell.found ? 'hk-fehler hk-gefunden' : 'hk-fehler')
              : ('hk-code' + (cell.shaking ? ' hk-shake' : ''))}`}
            onClick={() => handleClick(i)}
          >
            {cell.text}
          </span>
        ))}
      </div>
    </div>
  )
}
