import { useState, useEffect, useRef } from 'react'

import './Spiel.css'

const LEVELS = [
  { rows: 4, cols: 4, start: [0, 0], ziel: [3, 3], walls: [], max: 6 },
  { rows: 4, cols: 4, start: [0, 0], ziel: [3, 3], walls: [[1,1],[2,2]], max: 8 },
  { rows: 5, cols: 5, start: [0, 0], ziel: [4, 4], walls: [[1,0],[1,1],[3,3],[3,4]], max: 12 },
  { rows: 5, cols: 5, start: [0, 4], ziel: [4, 0], walls: [[1,3],[2,2],[3,1]], max: 12 },
  { rows: 6, cols: 6, start: [0, 0], ziel: [5, 5], walls: [[1,0],[1,1],[1,2],[3,3],[3,4],[3,5],[5,0],[5,1]], max: 16 },
]

const DIR = {
  up:    { dr: -1, dc: 0, symbol: '\u2191' },
  down:  { dr: 1,  dc: 0, symbol: '\u2193' },
  left:  { dr: 0,  dc: -1, symbol: '\u2190' },
  right: { dr: 0,  dc: 1, symbol: '\u2192' },
}

export default function Spiel() {
  const [lvl, setLvl] = useState(0)
  const [cmds, setCmds] = useState([])
  const [pos, setPos] = useState(null)
  const [running, setRunning] = useState(false)
  const [won, setWon] = useState(false)
  const [err, setErr] = useState('')
  const [step, setStep] = useState(-1)
  const t = useRef(null)
  const L = LEVELS[lvl]

  useEffect(() => { doReset() }, [lvl])
  useEffect(() => () => { if (t.current) clearTimeout(t.current) }, [])

  function doReset() {
    if (t.current) clearTimeout(t.current)
    setCmds([])
    setPos([L.start[0], L.start[1]])
    setRunning(false)
    setWon(false)
    setErr('')
    setStep(-1)
  }

  function add(d) {
    if (running || won || cmds.length >= L.max) return
    setCmds([...cmds, d])
  }

  function run() {
    if (running || cmds.length === 0) return
    setErr('')
    setWon(false)
    setPos([L.start[0], L.start[1]])
    setRunning(true)
    setStep(-1)
    let p = [L.start[0], L.start[1]]
    let i = 0
    function tick() {
      if (i >= cmds.length) {
        if (p[0] === L.ziel[0] && p[1] === L.ziel[1]) setWon(true)
        else setErr('Ziel nicht erreicht!')
        setRunning(false)
        setStep(-1)
        return
      }
      const d = DIR[cmds[i]]
      const nr = p[0] + d.dr, nc = p[1] + d.dc
      if (nr < 0 || nr >= L.rows || nc < 0 || nc >= L.cols) {
        setErr('Autsch! Gegen die Wand!')
        setRunning(false)
        setStep(-1)
        return
      }
      if (L.walls.some(w => w[0] === nr && w[1] === nc)) {
        setErr('Autsch! Da steht was im Weg!')
        setRunning(false)
        setStep(-1)
        return
      }
      p = [nr, nc]
      setPos([...p])
      setStep(i)
      i++
      t.current = setTimeout(tick, 450)
    }
    t.current = setTimeout(tick, 200)
  }

  return (
    <div className="game-wrapper">

      {/* Erklaerung links */}
      <div className="game-hilfe">
        <div className="game-hilfe-titel">So geht's!</div>
        <div className="game-hilfe-schritt">
          <span className="game-hilfe-nr">1</span>
          <span>Bringe den <strong>Roboter</strong> 🤖 zum <strong>Stern</strong> ⭐</span>
        </div>
        <div className="game-hilfe-schritt">
          <span className="game-hilfe-nr">2</span>
          <span>Druecke die <strong>bunten Pfeile</strong> um dem Roboter zu sagen wohin er laufen soll</span>
        </div>
        <div className="game-hilfe-schritt">
          <span className="game-hilfe-nr">3</span>
          <span>Druecke <strong>Start</strong> und schau ob der Roboter es schafft!</span>
        </div>
        <div className="game-hilfe-schritt">
          <span className="game-hilfe-nr">!</span>
          <span>Pass auf die <strong>Mauern</strong> 🧱 auf - da kann der Roboter nicht durch!</span>
        </div>
      </div>

      {/* Spiel rechts */}
      <div className="game">

      {/* Spielfeld */}
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${L.cols}, 1fr)` }}>
        {Array.from({ length: L.rows * L.cols }, (_, idx) => {
          const r = Math.floor(idx / L.cols), c = idx % L.cols
          const isRobo = pos && pos[0] === r && pos[1] === c
          const isGoal = r === L.ziel[0] && c === L.ziel[1]
          const isWall = L.walls.some(w => w[0] === r && w[1] === c)

          let cls = 'game-tile'
          let content = ''
          if (isRobo && isGoal) { cls += ' tile-win'; content = '🎉' }
          else if (isRobo) { cls += ' tile-robo'; content = '🤖' }
          else if (isGoal) { cls += ' tile-goal'; content = '⭐' }
          else if (isWall) { cls += ' tile-wall'; content = '🧱' }

          return <div key={idx} className={cls}>{content}</div>
        })}
      </div>

      {/* Befehls-Anzeige */}
      <div className="game-program">
        {cmds.length === 0
          ? <span className="game-program-hint">Druecke die Pfeile!</span>
          : cmds.map((c, i) => (
            <div key={i} className={`game-cmd ${i === step ? 'cmd-active' : ''}`}>
              {DIR[c].symbol}
            </div>
          ))
        }
      </div>

      {/* Meldungen */}
      {err && <div className="game-msg game-msg-err">{err}</div>}
      {won && (
        <div className="game-msg game-msg-win">
          Super gemacht!
          {lvl < LEVELS.length - 1
            ? <button className="game-big-btn game-btn-green" onClick={() => setLvl(lvl + 1)}>Weiter</button>
            : <span> Alle geschafft!</span>
          }
        </div>
      )}

      {/* Grosse Buttons */}
      <div className="game-buttons">
        <button className="game-big-btn game-btn-blue" onClick={() => add('up')} disabled={running}>
          <span className="game-arrow">{'\u2191'}</span>
        </button>
      </div>
      <div className="game-buttons">
        <button className="game-big-btn game-btn-purple" onClick={() => add('left')} disabled={running}>
          <span className="game-arrow">{'\u2190'}</span>
        </button>
        <button className="game-big-btn game-btn-orange" onClick={() => add('down')} disabled={running}>
          <span className="game-arrow">{'\u2193'}</span>
        </button>
        <button className="game-big-btn game-btn-green" onClick={() => add('right')} disabled={running}>
          <span className="game-arrow">{'\u2192'}</span>
        </button>
      </div>

      {/* Aktions-Reihe */}
      <div className="game-actions">
        <button className="game-action-btn action-run" onClick={run} disabled={running || cmds.length === 0}>
          Start
        </button>
        <button className="game-action-btn action-undo" onClick={() => { if (!running) setCmds(cmds.slice(0, -1)) }} disabled={running}>
          Zurueck
        </button>
        <button className="game-action-btn action-reset" onClick={doReset}>
          Nochmal
        </button>
      </div>

      {/* Level-Anzeige */}
      <div className="game-level">
        {LEVELS.map((_, i) => (
          <div
            key={i}
            className={`game-level-dot ${i === lvl ? 'dot-now' : ''} ${i < lvl ? 'dot-done' : ''}`}
            onClick={() => { if (!running) setLvl(i) }}
          />
        ))}
      </div>
    </div>
    </div>
  )
}
