/**
 * Zentrale Emoji-Komponente. Rendert Emojis als Twemoji-SVGs anstatt
 * als native Unicode-Zeichen. Damit sehen die Icons auf jedem Betriebssystem
 * (Windows, macOS, Linux-Kiosk) exakt gleich aus - unabhaengig von der
 * installierten Emoji-Schriftart.
 *
 * Verwendung:
 *   <Emoji char="👤" />                         // Standard
 *   <Emoji char="🏢" className="menu-v2-emoji" />  // mit eigener Klasse
 *
 * Die Groesse wird ueber CSS gesteuert - die SVGs skalieren mit der
 * eingestellten font-size (em-basiert) oder explizite width/height.
 */

// Twemoji-SVGs importieren (werden von Vite automatisch in den Build uebernommen)
import u1f464 from './images/emoji/1f464.svg'   // 👤 Person
import u1f4dd from './images/emoji/1f4dd.svg'   // 📝 Memo
import u1f3e2 from './images/emoji/1f3e2.svg'   // 🏢 Office Building
import u1f4e5 from './images/emoji/1f4e5.svg'   // 📥 Inbox Tray
import u1f4e4 from './images/emoji/1f4e4.svg'   // 📤 Outbox Tray
import u1f504 from './images/emoji/1f504.svg'   // 🔄 Counterclockwise Arrows
import u1f4c8 from './images/emoji/1f4c8.svg'   // 📈 Chart Increasing
import u1f3ae from './images/emoji/1f3ae.svg'   // 🎮 Video Game
import u1f4b0 from './images/emoji/1f4b0.svg'   // 💰 Money Bag
import u1f3a1 from './images/emoji/1f3a1.svg'   // 🎡 Ferris Wheel
import u1f4b8 from './images/emoji/1f4b8.svg'   // 💸 Money With Wings
import u1f4ca from './images/emoji/1f4ca.svg'   // 📊 Bar Chart
import u1f4cb from './images/emoji/1f4cb.svg'   // 📋 Clipboard
import u1f5d1 from './images/emoji/1f5d1.svg'   // 🗑️ Wastebasket
import u1f6aa from './images/emoji/1f6aa.svg'   // 🚪 Door
import u26a0  from './images/emoji/26a0.svg'    // ⚠️ Warning

const EMOJI_MAP = {
  '👤': u1f464,
  '📝': u1f4dd,
  '🏢': u1f3e2,
  '📥': u1f4e5,
  '📤': u1f4e4,
  '🔄': u1f504,
  '📈': u1f4c8,
  '🎮': u1f3ae,
  '💰': u1f4b0,
  '🎡': u1f3a1,
  '💸': u1f4b8,
  '📊': u1f4ca,
  '📋': u1f4cb,
  '🗑️': u1f5d1,
  '🗑':  u1f5d1,  // Variante ohne FE0F-Selector
  '🚪': u1f6aa,
  '⚠️': u26a0,
  '⚠':  u26a0,   // Variante ohne FE0F-Selector
}

export default function Emoji({ char, className = '', alt }) {
  const src = EMOJI_MAP[char]
  if (!src) {
    // Fallback: Unicode-Zeichen als normales Span - falls Mapping fehlt
    return <span className={className}>{char}</span>
  }
  return <img src={src} alt={alt || char} className={`emoji ${className}`.trim()} draggable="false" />
}
