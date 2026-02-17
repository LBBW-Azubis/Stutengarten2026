import { useNavigate } from 'react-router-dom'
import { useState } from "react";

import './3_Mainsite_Konto.css'  //Wichtig immer CSS importieren
import ls_icon from './images/LoginSeite_Icon.png';






export default function Dashboard() {
  const [Tester, setTester] = useState("Testname"); // 👈 hier dein stutengarten_id-State
    
  const navigate = useNavigate()
  function OnClick_Startseite() {
      navigate('/mainsite')
    }




  return (
    <main className="page-center">

          <img src={ls_icon} className="LS_Icon" />
          <input type="text" className="Mainsite_Konto" placeholder="Ausweisnummer eingeben"/>
          <p className = "Mainsite_Konto_Text">Kontonummer: </p>
          <button className="Mainsite_Konto_Button">Weiter</button>
          <p className = "Mainsite_Konto_Startseite" onClick={OnClick_Startseite}>zur Startseite</p>
        



    </main>
  )
}
