import { useNavigate } from 'react-router-dom'
import { useState } from "react";

import './1_Loginsite.css'  //Wichtig immer CSS importieren

import ls_icon from './images/LoginSeite_Icon.png';
import ls_icon2 from './images/LoginSeite_Icon_Lupe.png';

export default function Login() {
  //const navigate = useNavigate()

  //Wichtig für jede Variable:
  //1. Variablen bezeichner
  //2. Funktion um Variable zu setzen
  const [tmpTextGET_DB, setTmpTextGET_DB] = useState("");  // 👈 hier dein String-State
  const [stutengartenId, setStutengartenId] = useState(""); // 👈 hier dein stutengarten_id-State


  const LoginWeiter = async () => { 
    //navigate('/mainsite') //Muss drinne bleiben für "Weiter" auf (Mainsite)



    /* JSON-Datei Format - GET Abfrage (Beispielsdaten)
    {
      "stutengarten_id": "K1",
      "first_name": "Max",
      "last_name": "Mustermann",
    
    }
    */

    //Logik für LOGIN 
    //GET-Abfrage
    

    





    /*
    try {
      const response = await fetch("http://192.168.1.10:5000/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          stutengarten_id: 15,
          first_name: "Test",
          last_name: "de"
          // weitere Felder, z.B.:
          // city: "Köln"
        }),
      });

      const data = await response.json();

      setTmpTextGET_DB("Server-Antwort: " + JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Fehler bei der POST-Anfrage:", error);
      setTmpTextGET_DB("Fehler beim Senden der Daten");
    }

    */
};





  
//type => text (normaler String) // password (normaler String aber versteckt)
  return (
    <main className="page-center">
      <img src={ls_icon} className="LS_Icon" />
      <img src={ls_icon2} className="LS_Icon_Lupe" onClick={LoginWeiter}/>
      <input type="text" className="LS_Ausweisnummer" placeholder="Ausweisnummer eingeben"/>
      <input type="password" className="LS_Passwort" placeholder="Passwort eingeben"/>
      <p className = "LS_Ausweisnummer_text">Ausweisnummer:</p>
      <p className = "LS_Passwort_text">Passwort:</p>



    </main>
  )
}
