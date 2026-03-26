import { useNavigate } from 'react-router-dom'
import { useState } from "react";

import './3_Mainsite_Konto_Daten.css'  //Wichtig immer CSS importieren
import ls_icon from './images/LoginSeite_Icon.png';
import ls_icon2 from './images/Einzahlen_Site_Icon.png';






export default function Dashboard() {
  const [eingabe, setEingabe] = useState("");
  const [name, setName] = useState("");
  const [Kontostand, setKontostand] = useState("");

      
    const navigate = useNavigate()
    function OnClick_Startseite() {
      navigate('/mainsite')
    }



    //-----TESTEN----//
    //Muss noch getestet werden!
    const KontostandNeu_Berechnen = async (Name_Eingabe) => {

      try {
        const url1 = "http://192.168.1.10:5000/customer/" + Name_Eingabe;
        const url2 = "http://192.168.1.10:5000/customer/" + Name_Eingabe + "/savingsbook";

        // Beide Requests gleichzeitig starten
        const [response, response2] = await Promise.all([
          fetch(url1),
          fetch(url2)
        ]);

        // Optional: Status prüfen (sehr wichtig!)
        if (!response.ok) {
          throw new Error("Kunde nicht gefunden (Status: " + response.status + ")");
        }

        if (!response2.ok) {
          setKontostand("N/A"); // Falls kein Sparbuch vorhanden, Kontostand auf "N/A" setzen
          //throw new Error("Sparbuch nicht gefunden (Status: " + response2.status + ")");
        }

        // Beide JSONs gleichzeitig parsen
        const [data, data2] = await Promise.all([
          response.json(),
          response2.json()
        ]);

        setName(data.first_name + " " + data.last_name);
        if (data2.length === 0) {
          setKontostand("Kein Sparbuch");
        } else {
          setKontostand(data2[0].balance);
        }


      } catch (error) {
        console.error("Fehler bei der API-Anfrage:", error);
      }
    }





  return (
    <main className="page-center">

         <img src={ls_icon2} className="Einzahlen_Icon" />
         <p className = "Einzahlen_Kontonummer_Text">Kontonummer: </p>
         <input type="text" className="Einzahlen_Kontonummer_Eingabe" placeholder="Kontonummer eingeben..." value={eingabe} onChange={(e) => setEingabe(e.target.value)}/>
         <button className="Einzahlen_Kontonummer_Button" onClick={() => KontostandNeu_Berechnen(eingabe)}>Suchen</button>
   
   
         <div className="trennlinie"></div>
         <div className="trennlinie_2"></div>
   
   
         <p className = "Einzahlen_Kontoname_Text">Name: </p>
         <p className="Einzahlen_Kontoname_Wert">{name}</p>
   
         <p className = "Einzahlen_Kontostand_Text">Kontostand: </p>
         <p className="Einzahlen_Kontostand_Wert">{Kontostand}</p>

    </main>
  )
}
