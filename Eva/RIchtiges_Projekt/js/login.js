// js/login.js – Hilfsfunktionen für Login
// Wird von app.js verwendet

/**
 * Generiert eine zufällige 6-stellige Konto-ID (Buchstaben + Zahlen)
 */
function genId() {
  const z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length: 6}, () => z[Math.floor(Math.random() * z.length)]).join('');
}

if (typeof module !== 'undefined') module.exports = { genId };