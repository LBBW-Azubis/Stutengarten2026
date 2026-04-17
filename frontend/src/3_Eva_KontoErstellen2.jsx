import { useNavigate } from 'react-router-dom'

import './3_Eva_KontoErstellen2.css'  //Wichtig immer CSS importieren

import loginIcon from './images/Login.png'

export default function Eva_KontoErstellen2() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="seite-layout">
        <div className="seite-icon">
          <img src={loginIcon} alt="Person" />
        </div>
        <div className="seite-felder">
          <div style={{ marginBottom: 24 }}>
            <span
              className="feld-input anzeige"
              style={{ fontSize: '1.1rem', padding: '12px 20px' }}
            >
              Neuen Kunden erstellen?
            </span>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <button
              className="btn btn-gruen"
              style={{ minWidth: 80 }}
              onClick={() => navigate('/mainsite/kontoerstellen3')}
            >
              JA
            </button>
            <button
              className="btn btn-dunkel"
              style={{ minWidth: 80 }}
              onClick={() => navigate(-1)}
            >
              NEIN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
