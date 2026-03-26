import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'

import Login from './1_Loginsite'
import Mainsite from './2_Mainsite'
import Mainsite_Konto from './3_Mainsite_Konto'
import Mainsite_Einzahlen from './3_Mainsite_Einzahlen'
import Mainsite_Auszahlen from './3_Mainsite_Auszahlen'
import Mainsite_Ueberweisen from './3_Mainsite_Ueberweisen'
import Mainsite_Aktien from './3_Mainsite_Aktien'
import Mainsite_Spiele from './3_Mainsite_Spiele'
import Mainsite_KontoErstellen from './3_Mainsite_KontoErstellen'
import Mainsite_Info from './3_Mainsite_Info'
import Mainsite_Konto_Daten from './3_Mainsite_Konto_Daten'


import './App.css'  //Wichtig immer CSS importieren


//Alle images werden hier importiert
import logo from './images/bwbank_logo.png';


  
  
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
    const navigate = useNavigate();
    const loc = useLocation()

    function handleChange(e) {
      const path = e.target.value;
      if (path !== "") {
        navigate(path); // 👈 springt zur Route
      }
    }

    //value={loc.pathname} sorgt dafür, dass im Dropdown immer die aktuelle Seite angezeigt wird
  return (
    <div style={{ position: "fixed", top: 10, left: 10, zIndex: 9999 }}>
      <select onChange={handleChange} value={loc.pathname}>  
        <option value="" disabled>TESTMENÜ</option>
        <option value="/">Loginseite</option>
        <option value="/mainsite">Mainsite</option>
        <option value="/mainsite/konto">Konto</option>
        <option value="/mainsite/konto/daten">Konto Daten</option>
        <option value="/mainsite/einzahlen">Einzahlen</option>
        <option value="/mainsite/auszahlen">Auszahlen</option>
        <option value="/mainsite/ueberweisen">Überweisen</option>
        <option value="/mainsite/aktien">Aktien</option>
        <option value="/mainsite/spiele">Spiele</option>
        <option value="/mainsite/kontoerstellen">Konto Erstellen</option>
        <option value="/mainsite/info">Info</option>
      </select>
    </div>
  );
}




export default function App() {
  return (

    //Router agiert nur für die URL
    //z.B. "http://localhost:3000/dashboard" zeigt Dashboard an

    //Alles innerhalb Router (außerhalb routes) wird auf jeder Seite angezeigt!
    <Router>

      {/* 🔧 Test-Dropdown */}
      <DevNavigator />

      <header className="StutengartenLogo">
        {"Stutengarten Bankfiliale".split("").map((char, index) => {
          const colors = [
            "#f85954", "#ffa64d", "#ffff4d", "#4dff4d",
            "#4dd2ff", "#81fff4", "#b84dff", "#ff4da6"
          ];

          return (
            <span key={index} style={{ color: colors[index % colors.length] }}>
              {char}
            </span>
          );
        })}
      </header>

      <img src={logo} alt="Logo" className="BwBankLogo" />

      <p className="betreuerlogin_text">Betreuer Login:</p>
      <input type="text" className="betreuerlogin_textfeld" placeholder="[EINGABE ...]" />

      <button className="close-button">X</button>

      {/* Die eigentlichen Seiten */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mainsite" element={<Mainsite />} />
        <Route path="/mainsite/konto" element={<Mainsite_Konto />} />
        <Route path="/mainsite/konto/daten" element={<Mainsite_Konto_Daten />} />
        <Route path="/mainsite/einzahlen" element={<Mainsite_Einzahlen />} />
        <Route path="/mainsite/auszahlen" element={<Mainsite_Auszahlen />} />
        <Route path="/mainsite/ueberweisen" element={<Mainsite_Ueberweisen />} />
        <Route path="/mainsite/aktien" element={<Mainsite_Aktien />} />
        <Route path="/mainsite/spiele" element={<Mainsite_Spiele />} />
        <Route path="/mainsite/kontoerstellen" element={<Mainsite_KontoErstellen />} />
        <Route path="/mainsite/info" element={<Mainsite_Info />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>

    </Router>

  )
}
