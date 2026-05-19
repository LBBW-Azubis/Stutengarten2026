import './Popup.css'

export default function Popup({ message, onClose }) {
  if (!message) return null
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-dialog" onClick={e => e.stopPropagation()}>
        <div className="popup-icon">✓</div>
        <div className="popup-text">{message}</div>
        <button className="popup-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  )
}
