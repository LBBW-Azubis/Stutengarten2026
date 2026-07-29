import './Dokumente.css'  //Wichtig immer CSS importieren

// Anwenderdoku-Seite (nur ueber das Betreuer-Menu erreichbar):
// Die Anwenderdokumentation wird beim Oeffnen automatisch im grossen
// Widget geladen, rechts steht nur der Zoom-Hinweis.
// Die PDF liegt in frontend/public/pdfs/ und wird von Vite/nginx
// als statische Datei mit ausgeliefert (funktioniert offline im LAN).
// #toolbar=0&navpanes=0 blendet in Chromiums PDF-Viewer die Werkzeugleiste
// aus (kein Download-/Druck-Button) - das Widget kann nur anzeigen.
export default function Dokumente() {
  return (
    <div className="page dokumente-page">
      <div className="dok-layout">

        {/* Mitte: grosses Anzeige-Widget mit der Anwenderdoku */}
        <div className="dok-widget">
          <iframe
            className="dok-widget-frame"
            src="/pdfs/anwenderdoku.pdf#toolbar=0&navpanes=0"
            title="Anwenderdoku"
          />
        </div>

        {/* Rechts: Bedien-Hinweis zum Zoomen */}
        <div className="dok-seite-rechts">
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
