// Hacker-Timer - komplett ausserhalb von React
// Prueft bei jedem Tick die URL um zu entscheiden ob navigiert wird
// Kein pause/resume noetig - alles automatisch

let timerId = null

export function start(intervallMinuten) {
  stop()
  const ms = intervallMinuten * 60 * 1000
  console.log(`[HackerTimer] Gestartet: alle ${intervallMinuten} Min (${ms}ms)`)

  timerId = window.setInterval(() => {
    const path = window.location.pathname

    // Nicht feuern auf: Login, BetreuerMenu, Hacker-Seite (bereits aktiv)
    if (path === '/' || path === '/mainsite/betreuer' || path === '/mainsite/hacker') {
      return
    }

    console.log('[HackerTimer] ANGRIFF!')
    window.dispatchEvent(new CustomEvent('hacker-angriff'))
  }, ms)
}

export function stop() {
  if (timerId) {
    console.log('[HackerTimer] Gestoppt')
    window.clearInterval(timerId)
    timerId = null
  }
}
