import './Tschuess.css'  //Wichtig immer CSS importieren

import bwBankLogo from './images/BwBank_Logo.png'

export default function Tschuess() {
  function handleTschuess() {
    window.location.reload()
  }

  return (
    <div className="tschuess-seite">
      <div className="tschuess-logo">
        <img src={bwBankLogo} alt="BW Bank" />
      </div>
      <button
        className="btn btn-gruen"
        style={{ fontSize: '1.2rem', padding: '14px 48px' }}
        onClick={handleTschuess}
      >
        Tschuess!
      </button>
    </div>
  )
}
