import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { useAppContext } from './AppContext'

import './BetreuerMenu.css'  //Wichtig immer CSS importieren

import hackerIcon from './images/Hacker_Bidl.png'
import spieleIcon from './images/Spiel_menü.png'
import excelIcon from './images/Excel_Icon.svg'

export default function BetreuerMenu() {
  const navigate = useNavigate()
  const kundenInputRef = useRef(null)
  const unternehmenInputRef = useRef(null)
  const [importStatus, setImportStatus] = useState(null)  // { typ: 'ok'|'err', text: string }
  const [showLoeschenDialog, setShowLoeschenDialog] = useState(false)
  const [loeschenInput, setLoeschenInput] = useState('')
  const [showBeendenDialog, setShowBeendenDialog] = useState(false)

  function oeffneLoeschenDialog() {
    setLoeschenInput('')
    setShowLoeschenDialog(true)
  }

  function schliesseLoeschenDialog() {
    setShowLoeschenDialog(false)
    setLoeschenInput('')
  }

  function beendeAnwendung() {
    setShowBeendenDialog(false)
    // Im Chromium-Kiosk-Mode schliesst das das Fenster wie ALT+F4.
    // In normalen Browser-Tabs blockiert der Browser window.close() aus
    // Sicherheitsgruenden - dann fallen wir auf about:blank zurueck.
    try { window.open('', '_self', '')?.close() } catch (e) { /* ignore */ }
    try { window.close() } catch (e) { /* ignore */ }
    setTimeout(() => { window.location.href = 'about:blank' }, 200)
  }

  async function bestaetigeLoeschen() {
    if (loeschenInput !== 'Loeschen') return
    schliesseLoeschenDialog()

    // === BACKEND: Datenbank zuruecksetzen ===
    // POST http://192.168.1.10:5000/clear-database
    try {
      const response = await fetch('http://192.168.1.10:5000/clear-database', {
        method: 'POST',
      })
      console.log('[Datenbank] Clear Status:', response.status)
      if (response.ok) {
        zeigeImportMeldung('ok', 'Datenbank erfolgreich zurueckgesetzt!')
      } else {
        zeigeImportMeldung('err', 'Datenbank zuruecksetzen fehlgeschlagen')
      }
    } catch (error) {
      console.error('[Datenbank] Fehler:', error)
      zeigeImportMeldung('err', 'Verbindung zum Server fehlgeschlagen')
    }
    // === ENDE BACKEND ===
  }

  function zeigeImportMeldung(typ, text) {
    setImportStatus({ typ, text })
    setTimeout(() => setImportStatus(null), 5000)
  }

  async function handleKundenImport(e) {
    const datei = e.target.files?.[0]
    if (!datei) return

    // === BACKEND: Kunden-Excel importieren ===
    // POST http://192.168.1.10:5000/customer/import - Excel als multipart/form-data
    try {
      const formData = new FormData()
      formData.append('file', datei)

      const response = await fetch('http://192.168.1.10:5000/customer/import', {
        method: 'POST',
        body: formData,
      })
      const text = await response.text()
      let data = null
      try { data = JSON.parse(text) } catch { /* keine JSON */ }
      console.log('[Import Kunden] Status:', response.status, 'Body:', data ?? text)

      if (response.ok) {
        // Anzahl aus count-Feld oder aus Message-String extrahieren
        const rawMsg = data?.message || text || ''
        const match = rawMsg.match(/(\d+)/)
        const anzahl = data?.count ?? (match ? match[1] : null)
        zeigeImportMeldung('ok', anzahl !== null
          ? `Excel erfolgreich hochgeladen mit ${anzahl} Kunden`
          : 'Excel erfolgreich hochgeladen')
      } else {
        zeigeImportMeldung('err', 'Import fehlgeschlagen')
      }
    } catch (error) {
      console.error('[Import Kunden] Fehler:', error)
      zeigeImportMeldung('err', 'Verbindung zum Server fehlgeschlagen')
    }
    // === ENDE BACKEND ===

    e.target.value = ''
  }

  async function handleUnternehmenImport(e) {
    const datei = e.target.files?.[0]
    if (!datei) return

    // === BACKEND: Unternehmen-Excel importieren ===
    // POST http://192.168.1.10:5000/company/import - Excel als multipart/form-data
    try {
      const formData = new FormData()
      formData.append('file', datei)

      const response = await fetch('http://192.168.1.10:5000/company/import', {
        method: 'POST',
        body: formData,
      })
      const text = await response.text()
      let data = null
      try { data = JSON.parse(text) } catch { /* keine JSON */ }
      console.log('[Import Unternehmen] Status:', response.status, 'Body:', data ?? text)

      if (response.ok) {
        const rawMsg = data?.message || text || ''
        const match = rawMsg.match(/(\d+)/)
        const anzahl = data?.count ?? (match ? match[1] : null)
        zeigeImportMeldung('ok', anzahl !== null
          ? `Excel erfolgreich hochgeladen mit ${anzahl} Unternehmen`
          : 'Excel erfolgreich hochgeladen')
      } else {
        zeigeImportMeldung('err', 'Import fehlgeschlagen')
      }
    } catch (error) {
      console.error('[Import Unternehmen] Fehler:', error)
      zeigeImportMeldung('err', 'Verbindung zum Server fehlgeschlagen')
    }
    // === ENDE BACKEND ===

    e.target.value = ''
  }
  const {
    hackerAktiv, setHackerAktiv,
    hackerIntervall, setHackerIntervall,
    hackerAutoStart, setHackerAutoStart,
    spieleAktiv, setSpieleAktiv,
    spieleAutoStart, setSpieleAutoStart,
  } = useAppContext()

  const intervallOptionen = [0.166, 30, 60, 90, 120, 180, 240]  // in Minuten: 10 Sek, 0,5 H, 1 H, 1,5 H, 2 H, 3 H, 4 H

  return (
    <div className="page betreuer-page">
      <div className="betreuer-todo">
        <strong>To-Do:</strong>
        <div>1. Settings API Call einbauen / testen (Donnerstag - Backend)</div>
      </div>
      <div className="betreuer-layout">

        {/* Links: Einstellungen */}
        <div className="betreuer-settings">
          <div className="betreuer-settings-titel">Einstellungen</div>

          {/* Hacker-Einstellungen */}
          <div className="settings-box">
            <div className="settings-box-header">
              <img src={hackerIcon} alt="Hacker" className="settings-box-icon" />
              <h2>Hacker-Angriff</h2>
            </div>
            <div className="settings-box-body">
              <div className="setting-row">
                <span className="setting-label">Hacker-Angriff:</span>
                <div className="setting-controls">
                  <div className="toggle-group">
                    <button className={`toggle-btn ${hackerAktiv ? 'aktiv' : ''}`} onClick={() => setHackerAktiv(true)}>AN</button>
                    <button className={`toggle-btn ${!hackerAktiv ? 'inaktiv' : ''}`} onClick={() => setHackerAktiv(false)}>AUS</button>
                  </div>
                  <span className={`status-badge ${hackerAktiv ? 'status-an' : 'status-aus'}`}>
                    {hackerAktiv ? 'Aktiv' : 'Deaktiviert'}
                  </span>
                </div>
              </div>
              <div className="setting-row">
                <span className="setting-label">Intervall:</span>
                <div className="setting-controls">
                  <div className="intervall-group">
                    {intervallOptionen.map(min => (
                      <button
                        key={min}
                        className={`intervall-btn ${hackerIntervall === min ? 'ausgewaehlt' : ''}`}
                        onClick={() => setHackerIntervall(min)}
                      >
                        {min < 1 ? '10 Sek' : `${(min / 60).toString().replace('.', ',')} H`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="setting-row">
                <span className="setting-label">Beim Neustart aktiv:</span>
                <div className="setting-controls">
                  <div className="toggle-group">
                    <button className={`toggle-btn ${hackerAutoStart ? 'aktiv' : ''}`} onClick={() => setHackerAutoStart(true)}>JA</button>
                    <button className={`toggle-btn ${!hackerAutoStart ? 'inaktiv' : ''}`} onClick={() => setHackerAutoStart(false)}>NEIN</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spiele-Einstellungen */}
          <div className="settings-box">
            <div className="settings-box-header">
              <img src={spieleIcon} alt="Spiele" className="settings-box-icon" />
              <h2>Spiele</h2>
            </div>
            <div className="settings-box-body">
              <div className="setting-row">
                <span className="setting-label">Spiele erlaubt:</span>
                <div className="setting-controls">
                  <div className="toggle-group">
                    <button className={`toggle-btn ${spieleAktiv ? 'aktiv' : ''}`} onClick={() => setSpieleAktiv(true)}>AN</button>
                    <button className={`toggle-btn ${!spieleAktiv ? 'inaktiv' : ''}`} onClick={() => setSpieleAktiv(false)}>AUS</button>
                  </div>
                  <span className={`status-badge ${spieleAktiv ? 'status-an' : 'status-aus'}`}>
                    {spieleAktiv ? 'Erlaubt' : 'Gesperrt'}
                  </span>
                </div>
              </div>
              <div className="setting-row">
                <span className="setting-label">Beim Neustart aktiv:</span>
                <div className="setting-controls">
                  <div className="toggle-group">
                    <button className={`toggle-btn ${spieleAutoStart ? 'aktiv' : ''}`} onClick={() => setSpieleAutoStart(true)}>JA</button>
                    <button className={`toggle-btn ${!spieleAutoStart ? 'inaktiv' : ''}`} onClick={() => setSpieleAutoStart(false)}>NEIN</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Trennlinie */}
        <div className="betreuer-trenner"></div>

        {/* Rechts: Aktionen */}
        <div className="betreuer-kacheln">
          <div className="betreuer-kacheln-titel">Aktionen</div>

          {importStatus && (
            <div className={`import-status import-status-${importStatus.typ}`}>
              {importStatus.text}
            </div>
          )}

          <div className="aktionen-grid">
            <div className="kachel" onClick={() => navigate('/mainsite/unternehmen-erstellen')}>
              <div className="kachel-bild">
                <span className="betreuer-kachel-emoji">🏢</span>
              </div>
              <div className="kachel-label">Unternehmen erstellen</div>
            </div>

            <div className="kachel" onClick={() => navigate('/mainsite/unternehmen-loeschen')}>
              <div className="kachel-bild">
                <span className="betreuer-kachel-emoji">🗑️</span>
              </div>
              <div className="kachel-label kachel-label-danger">Unternehmen loeschen</div>
            </div>

            <div className="kachel" onClick={() => kundenInputRef.current?.click()}>
              <div className="kachel-bild import-bild">
                <span className="betreuer-kachel-emoji">👤</span>
                <img src={excelIcon} alt="Excel" className="import-badge" />
              </div>
              <div className="kachel-label">Import Kunden</div>
            </div>

            <div className="kachel" onClick={() => unternehmenInputRef.current?.click()}>
              <div className="kachel-bild import-bild">
                <span className="betreuer-kachel-emoji">🏢</span>
                <img src={excelIcon} alt="Excel" className="import-badge" />
              </div>
              <div className="kachel-label">Import Unternehmen</div>
            </div>

            <div className="kachel" onClick={oeffneLoeschenDialog}>
              <div className="kachel-bild">
                <span className="betreuer-kachel-emoji">🗑️</span>
              </div>
              <div className="kachel-label kachel-label-danger">Datenbank Loeschen</div>
            </div>

            <div className="kachel" onClick={() => setShowBeendenDialog(true)}>
              <div className="kachel-bild">
                <span className="betreuer-kachel-emoji">🚪</span>
              </div>
              <div className="kachel-label">Anwendung beenden</div>
            </div>
          </div>

          <input
            ref={kundenInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={handleKundenImport}
          />
          <input
            ref={unternehmenInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={handleUnternehmenImport}
          />
        </div>

      </div>

      {/* Datenbank-Loeschen Bestaetigungs-Dialog */}
      {showLoeschenDialog && (
        <div className="loeschen-overlay" onClick={schliesseLoeschenDialog}>
          <div className="loeschen-dialog" onClick={e => e.stopPropagation()}>
            <div className="loeschen-titel">⚠️ Datenbank zuruecksetzen</div>
            <div className="loeschen-text">
              Willst du wirklich die Datenbank zuruecksetzen?<br />
              Falls ja, gib <strong>Loeschen</strong> ein.
            </div>
            <input
              type="text"
              className="loeschen-input"
              placeholder="Loeschen"
              value={loeschenInput}
              onChange={e => setLoeschenInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') bestaetigeLoeschen() }}
              autoFocus
            />
            <div className="loeschen-buttons">
              <button
                className="loeschen-btn loeschen-btn-cancel"
                onClick={schliesseLoeschenDialog}
              >Abbrechen</button>
              <button
                className="loeschen-btn loeschen-btn-confirm"
                onClick={bestaetigeLoeschen}
                disabled={loeschenInput !== 'Loeschen'}
              >Loeschen</button>
            </div>
          </div>
        </div>
      )}

      {/* Anwendung-Beenden Bestaetigungs-Dialog */}
      {showBeendenDialog && (
        <div className="loeschen-overlay" onClick={() => setShowBeendenDialog(false)}>
          <div className="beenden-dialog" onClick={e => e.stopPropagation()}>
            <div className="beenden-titel">Anwendung beenden?</div>
            <div className="beenden-text">
              Moechtest du die Anwendung wirklich schliessen?
            </div>
            <div className="loeschen-buttons">
              <button
                className="loeschen-btn loeschen-btn-cancel"
                onClick={() => setShowBeendenDialog(false)}
              >Nein</button>
              <button
                className="loeschen-btn beenden-btn-ja"
                onClick={beendeAnwendung}
              >Ja</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
