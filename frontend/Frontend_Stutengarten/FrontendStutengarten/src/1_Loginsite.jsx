import { useNavigate } from 'react-router-dom'
import './1_Loginsite.css'  //Wichtig immer CSS importieren

import ls_icon from './images/LoginSeite_Icon.png';
import ls_icon2 from './images/LoginSeite_Icon_Lupe.png';

export default function Login() {
  const navigate = useNavigate()

  function LoginWeiter() {
    navigate('/dashboard')
  }
//type => text (normaler String) // password (normaler String aber versteckt)
  return (
    <main className="page-center">
      <img src={ls_icon} className="LS_Icon" />
      <img src={ls_icon2} className="LS_Icon_Lupe" onClick={LoginWeiter}/>
      <input type="text" className="LS_Ausweisnummer" placeholder="Ausweisnummer eingeben"/>
      <input type="password" className="LS_Passwort" placeholder="Passwort eingeben"/>
      <p className = "LS_Ausweisnummer_text">Ausweisnummer eingeben:</p>
      <p className = "LS_Passwort_text">Passwort eingeben:</p>



    </main>
  )
}
