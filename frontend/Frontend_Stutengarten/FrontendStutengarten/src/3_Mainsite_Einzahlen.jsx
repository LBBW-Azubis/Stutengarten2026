import { useNavigate } from 'react-router-dom'
import { useState } from "react";

import './3_Mainsite_Einzahlen.css'  //Wichtig immer CSS importieren
import ls_icon from './images/Einzahlen_Site_Icon.png';






export default function Dashboard() {
  const [Name_Eingabe, setName_Eingabe] = useState(""); // 👈 hier dein stutengarten_id-State



  
  
  const navigate = useNavigate()


  const [Name, setName] = useState(""); // 👈 hier dein stutengarten_id-State
  const [Kontostand, setKontostand] = useState(""); // 👈 hier dein stutengarten_id-State
  const [Betrag, setBetrag] = useState(""); // 👈 hier dein stutengarten_id-State
  const [KontostandNeu, setKontostandNeu] = useState(""); // 👈 hier dein stutengarten_id-State


  function OnClick_Startseite() {
    navigate('/mainsite')
  }


  const KontostandNeu_Berechnen = async () => {

    //setKontostandNeu("Test");
    try{
      const kontostand_num = parseFloat(Kontostand);
      const betrag_num = parseFloat(Betrag);
      const kontostand_neu = kontostand_num + betrag_num;
      setKontostandNeu(kontostand_neu.toString());
      const response = await fetch("http://192.168.1.10:5000/customer/" + Name_Eingabe + "/savingsbook/balance", { // ID = 1
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        balance: kontostand_neu // nur das Feld, das geändert wird
      }),
    });

    const data = await response.json();
    setKontostandNeu(data.balance.toString()); // aktualisierten Kontostand anzeigen

    

    }catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
  }
  }

const OnClick_Search_Kontonummer = async () => {
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
    //setKontostand(data2.balance);
    //setKontostand(JSON.stringify(data2));
    if (data2.length === 0) {
      setKontostand("Kein Sparbuch");
    } else {
      setKontostand(data2[0].balance);
    }


  } catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
  }
};




  /* Alte Variante für 1 Anfrage nur
  const OnClick_Search_Kontonummer = async () => {
    //Logik für LOGIN 
    //GET-Abfrage

    try {
      const tmp_response = "http://192.168.1.10:5000/customer/" + Name_Eingabe; //hier die URL mit der eingegebenen Kontonummer
      const tmp_response2 = "http://192.168.1.10:5000/customer/" + Name_Eingabe + "/savingsbook"; //hier die URL mit der eingegebenen Kontonummer und dem Pfad /savings
      // /customr/k1/savingsbook
      const response = await fetch(tmp_response);
      const response2 = await fetch(tmp_response2);
      const data = await response.json(); // 👈 JSON parsen (UTF-8 korrekt)
      const data2 = await response2.json(); // 👈 JSON parsen (UTF-8 korrekt)
      setName(data.first_name + " " + data.last_name); //Vorname und Nachname (Ausweisnummer)
      setKontostand(data2.balance); //Kontostand
    } catch (error) {
      console.error("Fehler bei der API-Anfrage:", error);
    }
    //WICHTIG TESTEN => Welcher Fehlercode kommt wenn z.B. die Kontonummer nicht existiert? (z.B. 404)
    //                  Nutzen für Fehlermeldung "Kontonummer existiert nicht" oder so ähnlich
  }
    */
  



  return (
    <main className="page-center">
      
      <img src={ls_icon} className="Einzahlen_Icon" />
      <p className = "Einzahlen_Kontonummer_Text">Kontonummer: </p>
      <input type="text" className="Einzahlen_Kontonummer_Eingabe" placeholder="Kontonummer eingeben..." value={Name_Eingabe} onChange={(e) => setName_Eingabe(e.target.value)}/>
      <button className="Einzahlen_Kontonummer_Button" onClick={OnClick_Search_Kontonummer}>Suchen</button>


      <div className="trennlinie"></div>
      <div className="trennlinie_2"></div>



      <p className = "Einzahlen_Kontoname_Text">Name: </p>
      <p className="Einzahlen_Kontoname_Wert">{Name}</p>

      <p className = "Einzahlen_Kontostand_Text">Kontostand: </p>
      <p className="Einzahlen_Kontostand_Wert">{Kontostand}</p>

      <p className = "Einzahlen_Kontostand_Neu_Text">Kontostand neu: </p>
      <p className="Einzahlen_Kontostand_Neu_Wert">{KontostandNeu}</p>


      <p className = "Einzahlen_Betrag_Text">Betrag einzahlen: </p>
      <input 
        type="text" 
        className="Einzahlen_Betrag" 
        placeholder="Betrag eingeben..." 
        value={Betrag}  // 👈 bindet den State an das Input-Feld
        onChange={(e) => setBetrag(e.target.value)} // 👈 aktualisiert den State bei jeder Eingabe
      />

      <button className="Einzahlen_Konto_Button" onClick={KontostandNeu_Berechnen}>Einzahlen</button>
      <p className = "Einzahlen_Startseite" onClick={OnClick_Startseite}>zur Startseite</p>
                  
        



    </main>
  )
}
