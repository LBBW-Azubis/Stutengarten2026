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
  return (
    <main className="page-center">
        <div className="menu-item">
    <img src={ms_konto_icon} className="MS_Konto_Icon" />
    <p className="MS_Icon_Text">Konto</p>
  </div>

  <div className="menu-item">
    <img src={ms_einzahlen_icon} className="MS_Einzahlen_Icon" />
    <p className="MS_Icon_Text">Einzahlen</p>
  </div>

  <div className="menu-item">
    <img src={ms_auszahlen_icon} className="MS_Auszahlen_Icon" />
    <p className="MS_Icon_Text">Auszahlen</p>
  </div>

  <div className="menu-item">
    <img src={ms_ueberweisen_icon} className="MS_Ueberweisung_Icon" />
    <p className="MS_Icon_Text">Überweisen</p>
  </div>

  <div className="menu-item">
    <img src={ms_aktien_icon} className="MS_Aktien_Icon" />
    <p className="MS_Icon_Text">Aktien</p>
  </div>

  <div className="menu-item">
    <img src={ms_spiele_icon} className="MS_Spiele_Icon" />
    <p className="MS_Icon_Text">Spiele</p>
  </div>

  <div className="menu-item">
    <img src={ms_kontoerstellen_icon} className="MS_Kontoerstellen_Icon" />
    <p className="MS_Icon_Text">Konto erstellen</p>
  </div>

  <div className="menu-item">
    <img src={ms_info_icon} className="MS_Info_Icon" />
    <p className="MS_Icon_Text">Info</p>
  </div>




    </main>
  )
}
