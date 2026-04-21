import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AppProvider, useAppContext } from './AppContext'
import * as hackerTimer from './hackerTimer'

import './App.css'  //Wichtig immer CSS importieren

// Alle Seiten importieren
import Login from './Login'
import Menu from './Menu'
import BetreuerMenu from './BetreuerMenu'
import Info from './Info'
import Konto from './Konto'
import KontoErstellen from './KontoErstellen'
import Einzahlen from './Einzahlen'
import Auszahlen from './Auszahlen'
import Ueberweisung from './Ueberweisung'
import AktienKaufen from './AktienKaufen'
import AktienZaehler from './AktienZaehler'
import AktienVerkaufen from './AktienVerkaufen'
import Hacker from './Hacker'
import Ranking from './Ranking'
import Spiel from './Spiel'
import Tschuess from './Tschuess'
import Unternehmen from './Unternehmen'
import UnternehmenEinzahlen from './UnternehmenEinzahlen'
import UnternehmenAuszahlen from './UnternehmenAuszahlen'

// Bilder importieren
import bwBankLogo from './images/BwBank_Logo.png'
import suchenIcon from './images/Suchen.png'


function NoMatch() {
  const loc = useLocation()
  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2>Kein Route-Match</h2>
      <p>Aktueller Pfad: <code>{loc.pathname}</code></p>
    </div>
  )
}

function DevNavigator() {
  const navigate = useNavigate()
  const loc = useLocation()

  function handleChange(e) {
    const path = e.target.value
    if (path !== '') navigate(path)
  }

  return (
    <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 9999 }}>
      <select onChange={handleChange} value={loc.pathname}>
        <option value="" disabled>TESTMENU</option>
        <option value="/">Login</option>
        <option value="/mainsite">Menu</option>
        <option value="/mainsite/betreuer">Betreuer Menu</option>
        <option value="/mainsite/info">Info</option>
        <option value="/mainsite/konto">Konto</option>
        <option value="/mainsite/kontoerstellen">Konto Erstellen</option>
        <option value="/mainsite/einzahlen">Einzahlen</option>
        <option value="/mainsite/auszahlen">Auszahlen</option>
        <option value="/mainsite/ueberweisung">Ueberweisung</option>
        <option value="/mainsite/aktien">Aktien Kaufen</option>
        <option value="/mainsite/aktien/zaehler">Aktien Zaehler</option>
        <option value="/mainsite/aktien/verkaufen">Aktien Verkaufen</option>
        <option value="/mainsite/hacker">Hacker</option>
        <option value="/mainsite/ranking">Ranking</option>
        <option value="/mainsite/spiel">Spiel</option>
        <option value="/mainsite/tschuess">Tschuess</option>
      </select>
    </div>
  )
}


// Header-Komponente mit buntem Titel
function Header() {
  const buchstaben = 'Stutengarten Bankfiliale'
  const farben = ['#c3aad2', '#F0825A', '#19AAD2', '#FFD719']

  return (
    <header className="header">
      <div className="header-title">
        {buchstaben.split('').map((char, i) => (
          <span key={i} style={{ color: char === ' ' ? 'transparent' : farben[i % farben.length] }}>
            {char === ' ' ? '\u00A0\u00A0' : char}
          </span>
        ))}
      </div>
    </header>
  )
}


// Footer-Komponente mit Betreuer-Login, X-Button und BW-Bank-Logo
function Footer() {
  const navigate = useNavigate()
  const { betreuerEingeloggt, setBetreuerEingeloggt } = useAppContext()
  const [betreuerPw, setBetreuerPw] = useState('')
  const [placeholder, setPlaceholder] = useState('')

  function handleBetreuerLogin() {
    if (betreuerPw === '1234') {
      setBetreuerEingeloggt(true)
      setBetreuerPw('')
      setPlaceholder('Eingeloggt')
      navigate('/mainsite/betreuer')
    } else {
      setBetreuerPw('')
      setPlaceholder('Falsch!')
      setTimeout(() => setPlaceholder(''), 1500)
    }
  }

  return (
    <footer className="fusszeile">
      <button className="x-btn" onClick={() => navigate('/mainsite/tschuess')}>X</button>
      <div className="betreuer-bereich">
        <span className="betreuer-label">Betreuer-Login:</span>
        <input
          type="password"
          value={betreuerPw}
          placeholder={placeholder}
          maxLength="10"
          onChange={e => setBetreuerPw(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleBetreuerLogin() }}
        />
        <button className="betreuer-such-btn" onClick={handleBetreuerLogin} aria-label="Betreuer suchen">
          <img src={suchenIcon} alt="Suchen" />
        </button>
      </div>
      <img src={bwBankLogo} alt="BW Bank" className="bwbank-logo" />
    </footer>
  )
}


// Zurueck-Bar Komponente
function ZurueckBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const istLogin = location.pathname === '/'
  const istStartseite = location.pathname === '/mainsite'

  if (istLogin) return null

  return (
    <div className="zurueck-bar">
      {!istStartseite ? (
        <button className="zurueck-btn" onClick={() => navigate('/mainsite')}>zur Startseite</button>
      ) : <div />}
      <button className="logout-btn" onClick={() => navigate('/')}>Abmelden</button>
    </div>
  )
}


// Hacker-Timer Komponente
// Timer laeuft UNABHAENGIG von Seitenwechseln durch.
// Nur auf Login und BetreuerMenu wird er pausiert (nicht gestoppt!).
function HackerTimerManager() {
  const navigate = useNavigate()
  const { hackerAktiv, hackerIntervall } = useAppContext()

  // Timer starten/stoppen - nur von hackerAktiv und hackerIntervall abhaengig
  useEffect(() => {
    if (hackerAktiv) {
      hackerTimer.start(hackerIntervall)
    } else {
      hackerTimer.stop()
    }
  }, [hackerAktiv, hackerIntervall])

  // Event-Listener: wenn Timer feuert, navigiere zur Hacker-Seite
  useEffect(() => {
    function onAngriff() {
      navigate('/mainsite/hacker')
    }
    window.addEventListener('hacker-angriff', onAngriff)
    return () => window.removeEventListener('hacker-angriff', onAngriff)
  }, [navigate])

  return null
}


// Haupt-Layout das Header, Footer und Zurueck-Bar einbindet
function AppLayout() {
  const location = useLocation()
  const istLogin = location.pathname === '/'

  return (
    <>
      <HackerTimerManager />
      <DevNavigator />
      <Header />
      <ZurueckBar />

      <main id="app">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/mainsite" element={<Menu />} />
          <Route path="/mainsite/betreuer" element={<BetreuerMenu />} />
          <Route path="/mainsite/info" element={<Info />} />
          <Route path="/mainsite/konto" element={<Konto />} />
          <Route path="/mainsite/kontoerstellen" element={<KontoErstellen />} />
          <Route path="/mainsite/einzahlen" element={<Einzahlen />} />
          <Route path="/mainsite/auszahlen" element={<Auszahlen />} />
          <Route path="/mainsite/ueberweisung" element={<Ueberweisung />} />
          <Route path="/mainsite/aktien" element={<AktienKaufen />} />
          <Route path="/mainsite/aktien/zaehler" element={<AktienZaehler />} />
          <Route path="/mainsite/aktien/verkaufen" element={<AktienVerkaufen />} />
          <Route path="/mainsite/hacker" element={<Hacker />} />
          <Route path="/mainsite/ranking" element={<Ranking />} />
          <Route path="/mainsite/spiel" element={<Spiel />} />
          <Route path="/mainsite/unternehmen" element={<Unternehmen />} />
          <Route path="/mainsite/unternehmen-einzahlen" element={<UnternehmenEinzahlen />} />
          <Route path="/mainsite/unternehmen-auszahlen" element={<UnternehmenAuszahlen />} />
          <Route path="/mainsite/tschuess" element={<Tschuess />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}


export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  )
}
