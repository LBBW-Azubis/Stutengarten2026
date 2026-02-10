import { useState } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");




/*
const handleClick = async () => {
  try {
    const response = await fetch("http://192.168.1.10:5000/customer/1", {
      method: "DELETE",
    });

    const data = await response.json(); // Backend sollte JSON zurückgeben, z.B. { success: true }

    setMessage("Server-Antwort DELETE: " + JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fehler bei der DELETE-Anfrage:", error);
    setMessage("Fehler beim Löschen");
  }
};
*/

//Für PATCH Abfragen 
/*
  const handleClick = async () => {
  try {
    const response = await fetch("http://192.168.1.10:5000/customer/1", { // ID = 1
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        first_name: "Tester" // nur das Feld, das geändert wird
      }),
    });

    const data = await response.json();

    setMessage("Server-Antwort PATCH: " + JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fehler bei der PATCH-Anfrage:", error);
    setMessage("Fehler beim PATCHen");
  }
};
*/





//Für POST Abfragen
/*
  const handleClick = async () => {
  try {
    const response = await fetch("http://192.168.1.10:5000/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        stutengarten_id: 4,
        first_name: "WhatsUpMy",
        last_name: "Dude"
        // weitere Felder, z.B.:
        // city: "Köln"
      }),
    });

    const data = await response.json();

    setMessage("Server-Antwort: " + JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Fehler bei der POST-Anfrage:", error);
    setMessage("Fehler beim Senden der Daten");
  }
};
*/




  //Für GET Abfragen
  /*
const handleClick = async () => {
  try {
    
    const response = await fetch("http://192.168.1.10:5000/customer/2");

    const data = await response.json(); // 👈 JSON parsen (UTF-8 korrekt)

    // Beispiel: data.name, data.city, etc.
    setMessage(JSON.stringify(data, null, 2)); // nur zum Anzeigen (stringify nutzen für JSON zu Text)
  } catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
    setMessage("Fehler beim Laden der Daten");
  }
};
*/


//Testen von /health
const handleClick = async () => {
  try {
    
    const response = await fetch("http://192.168.1.10:5000/health");

    const data = await response.json(); // 👈 JSON parsen (UTF-8 korrekt)

    // Beispiel: data.name, data.city, etc.
    setMessage(JSON.stringify(data, null, 2)); // nur zum Anzeigen (stringify nutzen für JSON zu Text)
  } catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
    setMessage("Fehler beim Laden der Daten");
  }
};



  return (
    <div style={{ padding: "20px" }}>
      <h1>Backend Test UI</h1>

      <div className="DivTest">
        <input
          type="text"
          placeholder="Name eingeben..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <button onClick={handleClick}>Test Button</button>

      <p>{message}</p>
    </div>
  );
}

export default App;
