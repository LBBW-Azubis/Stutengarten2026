import { useState } from 'react'

import './Dokumente.css'  //Wichtig immer CSS importieren

// Dokumente-Seite (nur ueber das Betreuer-Menu erreichbar):
// In der Mitte ein grosses Anzeige-Widget, rechts die Auswahl-Buttons.
// Die PDFs liegen in frontend/public/pdfs/ und werden von Vite/nginx
// als statische Dateien mit ausgeliefert (funktioniert offline im LAN).
// #toolbar=0&navpanes=0 blendet in Chromiums PDF-Viewer die Werkzeugleiste
// aus (kein Download-/Druck-Button) - das Widget kann nur anzeigen.
const DOKUMENTE = [
  { label: 'Anwenderdoku', datei: 'anwenderdoku.pdf' },
  { label: 'Backend-Doku', datei: 'backend-doku.pdf' },
  { label: 'Installationsanleitung', datei: 'installationsanleitung.pdf' },
]

export default function Dokumente() {
  const [ausgewaehlt, setAusgewaehlt] = useState(null)  // Index des aktiven Buttons (null = nichts gewaehlt)

  return (
    <div className="page dokumente-page">
      <div className="dok-layout">

        {/* Mitte: grosses Anzeige-Widget */}
        <div className="dok-widget">
          {ausgewaehlt === null ? (
            <div className="dok-widget-platzhalter">
              Bitte rechts ein Dokument auswählen
            </div>
          ) : (
            <iframe
              className="dok-widget-frame"
              src={`/pdfs/${DOKUMENTE[ausgewaehlt].datei}#toolbar=0&navpanes=0`}
              title={DOKUMENTE[ausgewaehlt].label}
            />
          )}
        </div>

        {/* Rechts: Auswahl-Buttons */}
        <div className="dok-buttons">
          {DOKUMENTE.map((dok, i) => (
            <button
              key={dok.datei}
              className={`dok-btn${ausgewaehlt === i ? ' dok-btn-aktiv' : ''}`}
              onClick={() => setAusgewaehlt(i)}
            >{dok.label}</button>
          ))}

          {/* Bedien-Hinweis zum Zoomen */}
          <div className="dok-zoom-hinweis">
            <div className="dok-zoom-hinweis-titel">Zoomen:</div>
            <div><kbd>STRG</kbd> + <kbd>+</kbd> / <kbd>−</kbd></div>
            <div>oder <kbd>STRG</kbd> + Mausrad</div>
          </div>
        </div>

      </div>
    </div>
  )
}
