import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AppProvider, useAppContext } from './AppContext'
import * as hackerTimer from './hackerTimer'

import './App.css'  //Wichtig immer CSS importieren

// Alle Seiten importieren
import Eva_Login from './1_Eva_Login'
import Eva_Menu from './2_Eva_Menu'
import Eva_BetreuerMenu from './3_Eva_BetreuerMenu'
import Eva_Info from './3_Eva_Info'
import Eva_Konto from './3_Eva_Konto'
import Eva_KontoErstellen from './3_Eva_KontoErstellen'
import Eva_Einzahlen from './3_Eva_Einzahlen'
import Eva_Auszahlen from './3_Eva_Auszahlen'
import Eva_Ueberweisung from './3_Eva_Ueberweisung'
import Eva_AktienKaufen from './3_Eva_AktienKaufen'
import Eva_AktienZaehler from './3_Eva_AktienZaehler'
import Eva_AktienVerkaufen from './3_Eva_AktienVerkaufen'
import Eva_Hacker from './3_Eva_Hacker'
import Eva_Ranking from './3_Eva_Ranking'
import Eva_Spiel from './3_Eva_Spiel'
import Eva_Tschuess from './3_Eva_Tschuess'
import Eva_Unternehmen from './3_Eva_Unternehmen'
import Eva_UnternehmenEinzahlen from './3_Eva_UnternehmenEinzahlen'
import Eva_UnternehmenAuszahlen from './3_Eva_UnternehmenAuszahlen'

// Bilder importieren
import bwBankLogo from './images/BwBank_Logo.png'
import suchenIcon from './images/Suchen.png'
import zurueckPfeil from './images/Zurueck_Pfeil.png'


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

  if (istLogin) return null

  return (
    <div className="zurueck-bar">
      <button className="zurueck-btn" onClick={() => navigate('/mainsite')}>zur Startseite</button>
      <img
        src={zurueckPfeil}
        alt="Zurueck"
        className="zurueck-pfeil"
        onClick={() => navigate(-1)}
      />
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

      <main id="app" className={!istLogin ? 'hat-zurueck' : ''}>
        <Routes>
          <Route path="/" element={<Eva_Login />} />
          <Route path="/mainsite" element={<Eva_Menu />} />
          <Route path="/mainsite/betreuer" element={<Eva_BetreuerMenu />} />
          <Route path="/mainsite/info" element={<Eva_Info />} />
          <Route path="/mainsite/konto" element={<Eva_Konto />} />
          <Route path="/mainsite/kontoerstellen" element={<Eva_KontoErstellen />} />
          <Route path="/mainsite/einzahlen" element={<Eva_Einzahlen />} />
          <Route path="/mainsite/auszahlen" element={<Eva_Auszahlen />} />
          <Route path="/mainsite/ueberweisung" element={<Eva_Ueberweisung />} />
          <Route path="/mainsite/aktien" element={<Eva_AktienKaufen />} />
          <Route path="/mainsite/aktien/zaehler" element={<Eva_AktienZaehler />} />
          <Route path="/mainsite/aktien/verkaufen" element={<Eva_AktienVerkaufen />} />
          <Route path="/mainsite/hacker" element={<Eva_Hacker />} />
          <Route path="/mainsite/ranking" element={<Eva_Ranking />} />
          <Route path="/mainsite/spiel" element={<Eva_Spiel />} />
          <Route path="/mainsite/unternehmen" element={<Eva_Unternehmen />} />
          <Route path="/mainsite/unternehmen-einzahlen" element={<Eva_UnternehmenEinzahlen />} />
          <Route path="/mainsite/unternehmen-auszahlen" element={<Eva_UnternehmenAuszahlen />} />
          <Route path="/mainsite/tschuess" element={<Eva_Tschuess />} />
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
