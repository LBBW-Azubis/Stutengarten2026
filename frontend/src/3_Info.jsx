import './3_Info.css'  //Wichtig immer CSS importieren

import infoIcon from './images/Info_menü.png'

export default function Info() {
  return (
    <div className="page">
      <div className="seite-layout">
        <div className="seite-icon">
          <img src={infoIcon} alt="Info" />
        </div>
        <div className="seite-felder">
          <h2>Info</h2>
          <p style={{ marginTop: 8 }}>Hier findest du wichtige Informationen zur App.</p>
        </div>
      </div>
    </div>
  )
}
