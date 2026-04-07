// Hacker-Timer - komplett ausserhalb von React
// Laeuft unabhaengig von allem, nur Login und BetreuerMenu pausieren ihn
// Feuert ein Custom DOM Event das die React-Komponente abfaengt

let timerId = null
let aktuellesIntervall = null
let pausiert = false

// Timer starten - nur wenn er nicht schon mit dem gleichen Intervall laeuft
export function start(intervallMinuten) {
  if (timerId && aktuellesIntervall === intervallMinuten) {
    return
  }
  const warPausiert = pausiert
  stop()
  pausiert = warPausiert
  aktuellesIntervall = intervallMinuten
  const ms = intervallMinuten * 60 * 1000
  console.log(`[HackerTimer] Gestartet: alle ${intervallMinuten} Min (${ms}ms)`)
  timerId = window.setInterval(() => {
    console.log(`[HackerTimer] Tick! pausiert=${pausiert}`)
    if (pausiert) return
    console.log('[HackerTimer] ANGRIFF!')
    // Custom Event feuern - React-Komponente faengt es ab und navigiert
    window.dispatchEvent(new CustomEvent('hacker-angriff'))
  }, ms)
}

// Timer komplett stoppen
export function stop() {
  if (timerId) {
    console.log('[HackerTimer] Gestoppt')
    window.clearInterval(timerId)
    timerId = null
    aktuellesIntervall = null
  }
}

// Timer pausieren
export function pause() {
  pausiert = true
  console.log('[HackerTimer] Pausiert')
}

// Timer fortsetzen
export function resume() {
  pausiert = false
  console.log('[HackerTimer] Fortgesetzt')
}

// Intervall aendern
export function setIntervall(intervallMinuten) {
  if (timerId) {
    stop()
    start(intervallMinuten)
  }
}

export function isRunning() {
  return timerId !== null
}
