import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from "react";


import './2_Mainsite.css'  //Wichtig immer CSS importieren


import ms_konto_icon from './images/Mainsite_Konto_Icon.png';
import ms_einzahlen_icon from './images/Mainsite_Einzahlen_Icon.png';
import ms_auszahlen_icon from './images/Mainsite_Auszahlen_Icon.png';
import ms_ueberweisen_icon from './images/Mainsite_Ueberweisung_Icon.png';
import ms_aktien_icon from './images/Mainsite_Aktien_Icon.png';
import ms_spiele_icon from './images/Mainsite_Spiele_Icon.png';
import ms_kontoerstellen_icon from './images/Mainsite_Kontoerstellen_Icon.png';
import ms_info_icon from './images/Mainsite_Info_Icon.png'; 







export default function Dashboard() {
  const navigate = useNavigate();
  const [userAusweisnummer, setUserAusweisnummer] = useState("");

  // Beim Laden die Ausweisnummer aus localStorage auslesen
  useEffect(() => {
    const ausweisnummer = localStorage.getItem('userAusweisnummer') || "Unbekannt";
    if (ausweisnummer) {
      setUserAusweisnummer(ausweisnummer);
    }
  }, []);







  return (
    <main className="page-center">
      
      <div className="MS_User_Container">
        <p className="MS_User_Text">Benutzer: {userAusweisnummer}</p>
      </div>
      
      <div className="MS_MenuContainer">

        <div className="MS_Konto_Container">
          <img src={ms_konto_icon} className="MS_Konto_Icon" onClick={() => navigate('/mainsite/konto')}/>
          <p className="MS_Konto_Icon_Text">Konto</p>
        </div>

        <div className="MS_Einzahlen_Container">
          <img src={ms_einzahlen_icon} className="MS_Einzahlen_Icon" onClick={() => navigate('/mainsite/einzahlen')} />
          <p className="MS_Einzahlen_Icon_Text">Einzahlen</p>
        </div>
          
        <div className="MS_Auszahlen_Container">
          <img src={ms_auszahlen_icon} className="MS_Auszahlen_Icon" onClick={() => navigate('/mainsite/auszahlen')} />
          <p className="MS_Auszahlen_Icon_Text">Auszahlen</p>
        </div>
          
        <div className="MS_Ueberweisung_Container">
          <img src={ms_ueberweisen_icon} className="MS_Ueberweisung_Icon" onClick={() => navigate('/mainsite/ueberweisen')} />
          <p className="MS_Ueberweisung_Icon_Text">Überweisen</p>
        </div>
         
        <div className="MS_Aktien_Container">
          <img src={ms_aktien_icon} className="MS_Aktien_Icon" onClick={() => navigate('/mainsite/aktien')} />
          <p className="MS_Aktien_Icon_Text">Aktien</p>
        </div>
          
        <div className="MS_Spiele_Container">
          <img src={ms_spiele_icon} className="MS_Spiele_Icon" onClick={() => navigate('/mainsite/spiele')} />
          <p className="MS_Spiele_Icon_Text">Spiele</p>
        </div>
        
        <div className="MS_Kontoerstellen_Container">
          <img src={ms_kontoerstellen_icon} className="MS_Kontoerstellen_Icon" onClick={() => navigate('/mainsite/kontoerstellen')} />
          <p className="MS_Kontoerstellen_Icon_Text">Konto erstellen</p>
        </div>
         
        <div className="MS_Info_Container">
          <img src={ms_info_icon} className="MS_Info_Icon" onClick={() => navigate('/mainsite/info')} />
          <p className="MS_Info_Icon_Text">Info</p>
        </div>

      </div>

    </main>
  )
}
