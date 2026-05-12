import './Info.css'  //Wichtig immer CSS importieren

import infoIcon from './images/Info_menü.png'

export default function Info() {
  return (
    <div className="info-seite">
      <div className="info-inhalt">
        <div className="info-icon">
          <img src={infoIcon} alt="Info" />
        </div>
        <div className="info-texte">
          <h2 className="info-titel">Info</h2>
          <p className="info-text">Hier findest du wichtige Informationen zur App.</p>
        </div>
      </div>
    </div>
  )
}
