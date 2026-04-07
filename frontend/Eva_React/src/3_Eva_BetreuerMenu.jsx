import { useNavigate } from 'react-router-dom'
import { useAppContext } from './AppContext'

import './3_Eva_BetreuerMenu.css'  //Wichtig immer CSS importieren

import berufeIcon from './images/Berufe_Kachel.png'
import hackerIcon from './images/Hacker_Bidl.png'
import spieleIcon from './images/Spiel_menü.png'

export default function Eva_BetreuerMenu() {
  const navigate = useNavigate()
  const {
    hackerAktiv, setHackerAktiv,
    hackerIntervall, setHackerIntervall,
    hackerAutoStart, setHackerAutoStart,
    spieleAktiv, setSpieleAktiv,
    spieleAutoStart, setSpieleAutoStart,
  } = useAppContext()

  const intervallOptionen = [0.166, 1, 2, 3, 5, 10, 15]

  return (
    <div className="page betreuer-page">
      <div className="betreuer-layout">

        {/* Links: Einstellungen */}
        <div className="betreuer-settings">

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
                        {min < 1 ? '10 Sek' : `${min} Min`}
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

        {/* Rechts: Berufe Kachel */}
        <div className="betreuer-kacheln">
          <div className="kachel" onClick={() => navigate('/mainsite/berufe')}>
            <div className="kachel-bild">
              <img src={berufeIcon} alt="Berufe" />
            </div>
            <div className="kachel-label">Berufe</div>
          </div>
        </div>

      </div>
    </div>
  )
}
