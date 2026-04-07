import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

// localStorage Keys
const LS_HACKER_AKTIV = 'hackerAktiv'
const LS_HACKER_INTERVALL = 'hackerIntervall'
const LS_HACKER_AUTO_START = 'hackerAutoStart'
const LS_SPIELE_AKTIV = 'spieleAktiv'
const LS_SPIELE_AUTO_START = 'spieleAutoStart'

export function AppProvider({ children }) {
  const [nutzer, setNutzer] = useState([])
  const [aktuellerNutzer, setAktuellerNutzer] = useState(null)
  const [betreuerEingeloggt, setBetreuerEingeloggt] = useState(false)
  const [mitarbeiter, setMitarbeiter] = useState(null)
  const [letzteGekaufteAktien, setLetzteGekaufteAktien] = useState([])
  const [eingeloggt, setEingeloggt] = useState(false)

  // Hacker-Einstellungen (aus localStorage geladen)
  const [hackerAktiv, setHackerAktivState] = useState(
    () => localStorage.getItem(LS_HACKER_AKTIV) === 'true'
  )
  const [hackerIntervall, setHackerIntervallState] = useState(
    () => parseInt(localStorage.getItem(LS_HACKER_INTERVALL)) || 3
  )
  const [hackerAutoStart, setHackerAutoStartState] = useState(
    () => localStorage.getItem(LS_HACKER_AUTO_START) === 'true'
  )

  // Spiele-Einstellungen (aus localStorage geladen)
  const [spieleAktiv, setSpieleAktivState] = useState(
    () => localStorage.getItem(LS_SPIELE_AKTIV) !== 'false'  // Default: AN
  )
  const [spieleAutoStart, setSpieleAutoStartState] = useState(
    () => localStorage.getItem(LS_SPIELE_AUTO_START) !== 'false'  // Default: AN
  )

  // Hilfsfunktionen
  function genId() {
    const z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: 6 }, () => z[Math.floor(Math.random() * z.length)]).join('')
  }

  function findeNutzer(q) {
    if (!q) return null
    const s = q.trim().toUpperCase()
    return nutzer.find(u => u.id.toUpperCase() === s) || null
  }

  function addTranAktion(n) {
    n.transaktionen = (n.transaktionen || 0) + 1
  }

  // Setter mit localStorage-Persistenz
  function setHackerAktiv(val) {
    setHackerAktivState(val)
    localStorage.setItem(LS_HACKER_AKTIV, String(val))
  }

  function setHackerIntervall(min) {
    setHackerIntervallState(min)
    localStorage.setItem(LS_HACKER_INTERVALL, String(min))
  }

  function setHackerAutoStart(val) {
    setHackerAutoStartState(val)
    localStorage.setItem(LS_HACKER_AUTO_START, String(val))
  }

  function setSpieleAktiv(val) {
    setSpieleAktivState(val)
    localStorage.setItem(LS_SPIELE_AKTIV, String(val))
  }

  function setSpieleAutoStart(val) {
    setSpieleAutoStartState(val)
    localStorage.setItem(LS_SPIELE_AUTO_START, String(val))
  }

  const value = {
    nutzer, setNutzer,
    aktuellerNutzer, setAktuellerNutzer,
    betreuerEingeloggt, setBetreuerEingeloggt,
    mitarbeiter, setMitarbeiter,
    letzteGekaufteAktien, setLetzteGekaufteAktien,
    eingeloggt, setEingeloggt,
    genId, findeNutzer, addTranAktion,
    // Hacker-Einstellungen
    hackerAktiv, setHackerAktiv,
    hackerIntervall, setHackerIntervall,
    hackerAutoStart, setHackerAutoStart,
    spieleAktiv, setSpieleAktiv,
    spieleAutoStart, setSpieleAutoStart,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  return useContext(AppContext)
}
