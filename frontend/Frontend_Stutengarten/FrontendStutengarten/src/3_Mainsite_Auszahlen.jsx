import { useNavigate } from 'react-router-dom'
import { useState } from "react";

import './3_Mainsite_Einzahlen.css'  //Wichtig immer CSS importieren
import ls_icon from './images/Einzahlen_Site_Icon.png';






export default function Dashboard() {
  const [Name_Eingabe, setName_Eingabe] = useState(""); // 👈 hier dein stutengarten_id-State



  
  
  const navigate = useNavigate()


  const [Name, setName] = useState(""); // 👈 hier dein stutengarten_id-State
  function OnClick_Startseite() {
    navigate('/mainsite')
  }

  const OnClick_Search_Kontonummer = async () => {
    //Logik für LOGIN 
    //GET-Abfrage

    try {
      const tmp_response = "http://192.168.1.10:5000/customer/" + Name_Eingabe; //hier die URL mit der eingegebenen Kontonummer
      const response = await fetch(tmp_response);

      const data = await response.json(); // 👈 JSON parsen (UTF-8 korrekt)
      setName(data.first_name + " " + data.last_name); //Vorname und Nachname (Ausweisnummer)
    } catch (error) {
      console.error("Fehler bei der API-Anfrage:", error);
    }
    //WICHTIG TESTEN => Welcher Fehlercode kommt wenn z.B. die Kontonummer nicht existiert? (z.B. 404)
    //                  Nutzen für Fehlermeldung "Kontonummer existiert nicht" oder so ähnlich
  }
  return (
    <main className="page-center">
      
      <img src={ls_icon} className="Einzahlen_Icon" />
      <p className = "Einzahlen_Kontonummer_Text">Kontonummer: </p>
      <input type="text" className="Einzahlen_Kontonummer_Eingabe" placeholder="Kontonummer eingeben..." value={Name_Eingabe} onChange={(e) => setName_Eingabe(e.target.value)}/>
      <button className="Einzahlen_Kontonummer_Button" onClick={OnClick_Search_Kontonummer}>Suchen</button>


      <div className="trennlinie"></div>
      <div className="trennlinie_2"></div>



      <p className = "Einzahlen_Kontoname_Text">Name: </p>
      <p className="Einzahlen_Kontoname_Wert"></p>

      <p className = "Einzahlen_Kontostand_Text">Kontostand: </p>
      <p className="Einzahlen_Kontostand_Wert">{Name}</p>

      <p className = "Einzahlen_Kontostand_Neu_Text">Kontostand neu: </p>
      <p className="Einzahlen_Kontostand_Neu_Wert"></p>


      <p className = "Auszahlen_Betrag_Text">Betrag:</p>
      <input type="text" className="Auszahlen_Betrag" placeholder="Betrag eingeben.."/>
      <button className="Einzahlen_Konto_Button" onClick={OnClick_Search_Kontonummer}>Auszahlen</button>
      <p className = "Einzahlen_Startseite" onClick={OnClick_Startseite}>zur Startseite</p>
                  
        



    </main>
  )
}
