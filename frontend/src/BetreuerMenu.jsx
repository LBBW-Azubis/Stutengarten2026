import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from './AppContext'
import Emoji from './Emoji'
import Popup from './Popup'

import './BetreuerMenu.css'  //Wichtig immer CSS importieren

import hackerIcon from './images/Hacker_Bidl.png'
import spieleIcon from './images/Spiel_menü.png'

export default function BetreuerMenu() {
  const navigate = useNavigate()
  const [importStatus, setImportStatus] = useState(null)  // { typ: 'ok'|'err', text: string } - Statusmeldung fuer Datenbank-Aktionen
  const [showLoeschenDialog, setShowLoeschenDialog] = useState(false)
  const [loeschenInput, setLoeschenInput] = useState('')
  const [popup, setPopup] = useState('')

  function oeffneLoeschenDialog() {
    setLoeschenInput('')
    setShowLoeschenDialog(true)
  }

  function schliesseLoeschenDialog() {
    setShowLoeschenDialog(false)
    setLoeschenInput('')
  }

  async function handleSettingsSpeichern() {
    // === BACKEND: Settings speichern ===
    // PATCH http://192.168.1.10:5000/settings
    // hackerIntervall wird in Stunden gesendet (intern in Minuten gespeichert)
    const body = {
      hackerAktiv,
      hackerIntervall: hackerIntervall / 60,
      hackerAutoStart,
      spieleAktiv,
      spieleAutoStart,
    }
    try {
      await fetch('http://192.168.1.10:5000/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error('[Settings] PATCH Fehler:', error)
    }
    // === ENDE BACKEND ===
  }

  async function bestaetigeLoeschen() {
    if (loeschenInput !== 'Löschen') return
    schliesseLoeschenDialog()

    // === BACKEND: Datenbank zuruecksetzen ===
    // POST http://192.168.1.10:5000/clear-database
    try {
      const response = await fetch('http://192.168.1.10:5000/clear-database', {
        method: 'POST',
      })
      console.log('[Datenbank] Clear Status:', response.status)
      if (response.ok) {
        setPopup('Datenbank wurde erfolgreich zurückgesetzt!')
      } else {
        zeigeImportMeldung('err', 'Datenbank zurücksetzen fehlgeschlagen')
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

  const {
    hackerAktiv, setHackerAktiv,
    hackerIntervall, setHackerIntervall,
    hackerAutoStart, setHackerAutoStart,
    spieleAktiv, setSpieleAktiv,
    spieleAutoStart, setSpieleAutoStart,
  } = useAppContext()

  const intervallOptionen = [30, 60, 90, 120, 180, 240]  // in Minuten: 0,5 H, 1 H, 1,5 H, 2 H, 3 H, 4 H

  return (
    <div className="page betreuer-page">
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
                        {`${(min / 60).toString().replace('.', ',')} H`}
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

          {/* Speichern unter den Einstellungen */}
          <div className="settings-speichern">
            <button
              className="settings-speichern-btn"
              onClick={handleSettingsSpeichern}
            >Speichern</button>
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
                <Emoji char="🏢" className="betreuer-kachel-emoji" />
              </div>
              <div className="kachel-label">Unternehmen erstellen</div>
            </div>

            <div className="kachel" onClick={() => navigate('/mainsite/unternehmen-loeschen')}>
              <div className="kachel-bild">
                <Emoji char="🗑️" className="betreuer-kachel-emoji" />
              </div>
              <div className="kachel-label kachel-label-danger">Unternehmen löschen</div>
            </div>

            <div className="kachel" onClick={oeffneLoeschenDialog}>
              <div className="kachel-bild">
                <Emoji char="🗑️" className="betreuer-kachel-emoji" />
              </div>
              <div className="kachel-label kachel-label-danger">Datenbank Löschen</div>
            </div>

          </div>
        </div>

      </div>

      {/* Datenbank-Loeschen Bestaetigungs-Dialog */}
      {showLoeschenDialog && (
        <div className="loeschen-overlay" onClick={schliesseLoeschenDialog}>
          <div className="loeschen-dialog" onClick={e => e.stopPropagation()}>
            <div className="loeschen-titel"><Emoji char="⚠️" /> Datenbank zurücksetzen</div>
            <div className="loeschen-text">
              Willst du wirklich die Datenbank zurücksetzen?<br />
              Falls ja, gib <strong>Löschen</strong> ein.
            </div>
            <input
              type="text"
              className="loeschen-input"
              placeholder="Löschen"
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
                disabled={loeschenInput !== 'Löschen'}
              >Löschen</button>
            </div>
          </div>
        </div>
      )}

      <Popup message={popup} onClose={() => setPopup('')} />
    </div>
  )
}
