import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Login from './1_Loginsite'
import Mainsite from './2_Mainsite'
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

export default function App() {
  return (

    //Router agiert nur für die URL
    //z.B. "http://localhost:3000/dashboard" zeigt Dashboard an

    //Alles innerhalb Router (außerhalb routes) wird auf jeder Seite angezeigt!
    <Router>
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

      <p className ="betreuerlogin_text">Betreuer Login:</p>
      <input type="text" className="betreuerlogin_textfeld" placeholder="[EINGABE ...]"/>

      <button class="close-button">X</button>


      {/* Die eigentlichen Seiten */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mainsite" element={<Mainsite/>} /> {/* /mainsite muss bei z.B. LoginSite in "navigate" eingebaut werden */}
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Router>
  )
}
