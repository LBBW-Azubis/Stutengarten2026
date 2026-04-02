// js/aktie.js – Aktien-Logik
// Wird von app.js verwendet

/**
 * Generiert eine zufällige 8-stellige Aktiennummer
 */
function genAktienNummer() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

/**
 * Berechnet den Gesamtwert aller Aktien
 */
function gesamtWert(aktien) {
  return aktien.reduce((sum, a) => sum + a.wert, 0);
}

const MAX_AKTIEN_PRO_PERSON = 3;

/**
 * Kauft Aktien, sofern das Maximum nicht überschritten wird.
 * @param {number} aktuelleAnzahl – wie viele der Kunde bereits besitzt
 * @param {number} kaufen – wie viele er kaufen möchte
 * @returns {{ ok: boolean, fehler?: string }}
 */
function aktienKaufenPruefen(aktuelleAnzahl, kaufen) {
  if (!Number.isInteger(kaufen) || kaufen < 1) {
    return { ok: false, fehler: 'Bitte eine gültige Anzahl (mind. 1) eingeben.' };
  }
  if (aktuelleAnzahl + kaufen > MAX_AKTIEN_PRO_PERSON) {
    return { ok: false, fehler: `Maximal ${MAX_AKTIEN_PRO_PERSON} Aktien pro Person erlaubt.` };
  }
  return { ok: true };
}

/**
 * Wird beim Klick auf "kaufen" ausgeführt.
 */
function aktienKaufen() {
  const input = document.getElementById('aktien-kaufen-anzahl');
  const fehlerDiv = document.getElementById('aktien-fehler');
  const kaufen = parseInt(input.value, 10);

  // Aktuelle Anzahl aus der Tabelle zählen
  const tabelleZeilen = document.querySelectorAll('.daten-tabelle tbody tr');
  const aktuelleAnzahl = tabelleZeilen.length;

  const ergebnis = aktienKaufenPruefen(aktuelleAnzahl, kaufen);
  if (!ergebnis.ok) {
    fehlerDiv.textContent = ergebnis.fehler;
    fehlerDiv.style.display = 'block';
    input.focus();
    return;
  }

  fehlerDiv.style.display = 'none';

  // Neue Aktien in die Tabelle eintragen
  const tbody = document.querySelector('.daten-tabelle tbody');
  for (let i = 0; i < kaufen; i++) {
    const nr = genAktienNummer();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="checkbox" /></td><td>${nr}</td><td>4</td>`;
    tbody.appendChild(tr);
  }

  input.value = '';
}

if (typeof module !== 'undefined') module.exports = { genAktienNummer, gesamtWert, aktienKaufenPruefen };