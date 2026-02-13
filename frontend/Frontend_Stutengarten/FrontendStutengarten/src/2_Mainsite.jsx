import { useNavigate } from 'react-router-dom'
import { useState } from "react";


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







  return (
    <main className="page-center">
        
          <img src={ms_konto_icon} className="MS_Konto_Icon" onClick={() => navigate('/mainsite/konto')}/>
          <p className="MS_Konto_Icon_Text">Konto</p>
        

          <img src={ms_einzahlen_icon} className="MS_Einzahlen_Icon" onClick={() => navigate('/mainsite/einzahlen')} />
          <p className="MS_Einzahlen_Icon_Text">Einzahlen</p>
       

      
          <img src={ms_auszahlen_icon} className="MS_Auszahlen_Icon" onClick={() => navigate('/mainsite/auszahlen')} />
          <p className="MS_Auszahlen_Icon_Text">Auszahlen</p>
        

    
          <img src={ms_ueberweisen_icon} className="MS_Ueberweisung_Icon" onClick={() => navigate('/mainsite/ueberweisen')} />
          <p className="MS_Ueberweisung_Icon_Text">Überweisen</p>
       

      
          <img src={ms_aktien_icon} className="MS_Aktien_Icon" onClick={() => navigate('/mainsite/aktien')} />
          <p className="MS_Aktien_Icon_Text">Aktien</p>
    

        
          <img src={ms_spiele_icon} className="MS_Spiele_Icon" onClick={() => navigate('/mainsite/spiele')} />
          <p className="MS_Spiele_Icon_Text">Spiele</p>
      

      
          <img src={ms_kontoerstellen_icon} className="MS_Kontoerstellen_Icon" onClick={() => navigate('/mainsite/kontoerstellen')} />
          <p className="MS_Kontoerstellen_Icon_Text">Konto erstellen</p>
       
       
          <img src={ms_info_icon} className="MS_Info_Icon" onClick={() => navigate('/mainsite/info')} />
          <p className="MS_Info_Icon_Text">Info</p>
        




    </main>
  )
}
