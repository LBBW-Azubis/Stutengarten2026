// =============================================
// STUTENGARTEN BANKFILIALE – app.js
// =============================================

// ===== STATE =====
const state = {
  nutzer: [],
  aktuellerNutzer: null,
  betreuerEingeloggt: false,
  hackerTimer: null,
  history: [],            // stack of previous page names for back-navigation
  aktuelleSeite: null,    // currently shown page name
  _backNavigation: false, // internal flag to avoid recording when navigating back
};

// logged-in employee (staff) — separate from `aktuellerNutzer` (the customer)
state.mitarbeiter = null;

// ===== HILFSFUNKTIONEN =====

function genId() {
  const z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length:6}, () => z[Math.floor(Math.random()*z.length)]).join('');
}

function findeNutzer(q) {
  if (!q) return null;
  const s = q.trim().toUpperCase();
  return state.nutzer.find(u => u.id.toUpperCase() === s) || null;
}

function addTranAktion(n) {
  n.transaktionen = (n.transaktionen || 0) + 1;
}

// Bildplatzhalter-Helper: gibt ein <img> zurück, das bei Fehler unsichtbar bleibt
function bildImg(src, alt, css) {
  return `<img src="images/${src}" alt="${alt}" style="${css || ''}"
              onerror="this.style.visibility='hidden';" />`;
}

// ===== NAVIGATION =====

function zeigeSeite(name) {
  const app = document.getElementById('app');
  const backBar = document.getElementById('backBar');
  if (!app) return;

  // Show the back-bar on all pages except the initial login
  const ohneZurueck = ['login'];
  // Manage history: clear for top-level pages, otherwise push current page
  if (ohneZurueck.includes(name)) {
    state.history = [];
  } else {
    if (!state._backNavigation && state.aktuelleSeite && state.aktuelleSeite !== name) {
      state.history.push(state.aktuelleSeite);
    }
    // reset the back-navigation marker after handling it
    if (state._backNavigation) state._backNavigation = false;
  }
  // set current page for future navigations
  state.aktuelleSeite = name;

  // mark body for Betreuer page so CSS can target the back-arrow specifically
  document.body.classList.toggle('seite-betreuer', name === 'betreuerMenu');
  // mark body for main menu (Kinder-Arbeitsfläche) to make tiles larger
  document.body.classList.toggle('seite-menu', name === 'menu');

  if (backBar) {
    backBar.style.display = ohneZurueck.includes(name) ? 'none' : 'flex';
  }
  document.body.classList.toggle('hat-zurueck', !ohneZurueck.includes(name));

  app.innerHTML = '';
  const seiten = {
    login:           seiteLogin,
    menu:            seiteMenu,
    info:            seiteInfo,
    betreuerMenu:    seiteBetreuerMenu,
    konto:           seiteKonto,
    kontoErstellen1: seiteKontoErstellen1,
    kontoErstellen2: seiteKontoErstellen2,
    kontoErstellen3: seiteKontoErstellen3,
    einzahlen:       seiteEinzahlen,
    auszahlen:       seiteAuszahlen,
    ueberweisung:    seiteUeberweisung,
    aktienKaufen:    seiteAktienKaufen,
    aktienKaufenZaehler: seiteAktienKaufenZaehler,
    aktienVerkaufen: seiteAktienVerkaufen,
    hacker:          seiteHacker,
    ranking:         seiteRanking,
    spiel:           seiteSpiel,
    berufe:          seiteBerufe,
    berufEinzahlen:  seiteBerufEinzahlen,
    tschuess:        seiteTschuess,
  };
  if (seiten[name]) app.appendChild(seiten[name]());
}

// Reusable customer selector inserted at top of pages where staff should enter a customer ID
function renderKundenSelector(containerDiv, pageName) {
  const sel = document.createElement('div');
  sel.className = 'kunden-selector';
  // Use the same .feld-zeile markup so label/input align with other fields
  sel.innerHTML = `
    <div class="feld-zeile">
      <label>Kontonummer eingeben:</label>
      <input type="text" class="feld-input" id="kundenIdInput" placeholder="..." style="text-transform:uppercase; width:420px; min-width:420px;" />
      <button class="btn btn-dunkel" id="kundenSuchBtn">Laden</button>
      <span class="fehler-text" id="kundenFehler" style="display:none; margin-left:8px;"></span>
    </div>
  `;
  // Prefer inserting into the page's .seite-felder so it lines up with other fields
  const felder = containerDiv.querySelector('.seite-felder');
  if (felder) {
    felder.insertBefore(sel, felder.firstChild);
  } else {
    // fallback: insert at top of container
    containerDiv.insertBefore(sel, containerDiv.firstChild);
  }

  sel.querySelector('#kundenSuchBtn').addEventListener('click', () => {
    const id = sel.querySelector('#kundenIdInput').value.trim().toUpperCase();
    const fehlerEl = sel.querySelector('#kundenFehler');
    fehlerEl.style.display = 'none';
    if (!id) {
      fehlerEl.textContent = 'Bitte Kontonummer eingeben.';
      fehlerEl.style.display = 'inline-block';
      return;
    }
    const n = findeNutzer(id);
    if (n) {
      state.aktuellerNutzer = n;
    } else {
      // create lightweight temporary customer (demo/testing): give a small starting balance
      state.aktuellerNutzer = { id: id, vorname: '', nachname: '', kontostand: 100, aktien: [], transaktionen:0, beruf:null };
    }
    // re-render the same page so it shows the loaded customer
    zeigeSeite(pageName);
  });
}

function zurueck() {
  if (state.history && state.history.length) {
    const prev = state.history.pop();
    state._backNavigation = true;
    zeigeSeite(prev);
  } else {
    zeigeSeite('menu');
  }
}

// ===== BETREUER LOGIN =====
document.getElementById('betreuerPwInput').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const pw = document.getElementById('betreuerPwInput').value;
  if (pw === '1234') {
    state.betreuerEingeloggt = true;
    document.getElementById('betreuerPwInput').value = '';
    document.getElementById('betreuerPwInput').placeholder = 'Eingeloggt';
    zeigeSeite('betreuerMenu');
  } else {
    document.getElementById('betreuerPwInput').value = '';
    document.getElementById('betreuerPwInput').placeholder = 'Falsch!';
    setTimeout(() => {
      document.getElementById('betreuerPwInput').placeholder = '';
    }, 1500);
  }
});

// Betreuer: Klick auf Lupen-Button neben dem Passwort-input
const betreuerSuchBtn = document.getElementById('betreuerSuchBtn');
if (betreuerSuchBtn) {
  betreuerSuchBtn.addEventListener('click', () => {
    const pwInput = document.getElementById('betreuerPwInput');
    const pw = pwInput ? pwInput.value : '';
    if (pw === '1234') {
      state.betreuerEingeloggt = true;
      if (pwInput) pwInput.value = '';
      if (pwInput) pwInput.placeholder = 'Eingeloggt';
      zeigeSeite('betreuerMenu');
    } else {
      if (pwInput) pwInput.value = '';
      if (pwInput) pwInput.placeholder = 'Falsch!';
      setTimeout(() => { if (pwInput) pwInput.placeholder = ''; }, 1500);
    }
  });
}

document.getElementById('closeBtn').addEventListener('click', () => zeigeSeite('tschuess'));
document.getElementById('backBtn').addEventListener('click', () => zeigeSeite('menu'));
// Zurück-Pfeil navigiert zur vorherigen Seite
const backImg = document.querySelector('#backBar .zurueck-pfeil');
if (backImg) backImg.addEventListener('click', zurueck);

function starteHackerTimer() {
  if (state.hackerTimer) clearInterval(state.hackerTimer);
  state.hackerTimer = setInterval(() => zeigeSeite('hacker'), 3 * 60 * 1000);
}

// =============================================
// ===== SEITEN =====
// =============================================

// ── LOGIN ──
// Ausweis-Nummer eingeben → Konto suchen → Weiter
function seiteLogin() {
  const div = document.createElement('div');
  div.className = 'page login-seite';

  div.innerHTML = `
    <div class="login-icon">
      <!-- BILD EINSETZEN: images/Login.png -->
      ${bildImg('Login.png', 'Person', 'width:160px;height:160px;object-fit:contain;')}
    </div>

    <div class="login-felder">
      <div class="feld-zeile">
        <label>Ausweis Nummer:</label>
        <input type="text" class="feld-input" id="loginAusweis"
               placeholder="…." maxlength="6"
               autocomplete="off" style="text-transform:uppercase;" />
      </div>
      <div class="feld-zeile">
        <label>Passwort:</label>
        <input type="password" class="feld-input" id="loginPasswort" placeholder="…." />
        <button class="such-btn" id="suchBtn">
          <!-- BILD EINSETZEN: images/Suchen.png -->
          ${bildImg('Suchen.png', 'Suchen', 'width:44px;height:44px;')}
        </button>
      </div>

      <span class="fehler-text" id="loginFehler"></span>

      <!-- Vorschau nach Suche -->
      <div id="kundeVorschau" style="display:none; margin-top:8px;">
        <div class="feld-zeile">
          <label>Kontonummer:</label>
          <span class="feld-input anzeige" id="pvId"></span>
        </div>
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige" id="pvName"></span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige" id="pvStand"></span>
        </div>
        <div style="margin-top:10px;">
          <button class="btn btn-dunkel" id="weiterBtn">Weiter</button>
        </div>
      </div>

      <!-- Nicht gefunden -->
      <div id="nichtGefunden" style="display:none; margin-top:8px;">
        <p style="color:#123250; margin-bottom:10px;">Kein Konto gefunden.</p>
        <button class="btn btn-gruen" id="neuAnlegenBtn">Neuen Kunden erstellen</button>
      </div>
    </div>
  `;

  const reset = () => {
    div.querySelector('#kundeVorschau').style.display = 'none';
    div.querySelector('#nichtGefunden').style.display = 'none';
    div.querySelector('#loginFehler').style.display = 'none';
  };

  const suchen = () => {
    const id = div.querySelector('#loginAusweis').value.trim().toUpperCase();
    const pw = div.querySelector('#loginPasswort').value;
    reset();
    // Require both Ausweis-Nummer und Passwort to be filled
    if (!id || !pw) {
      div.querySelector('#loginFehler').textContent = 'Bitte Ausweis-Nummer und Passwort eingeben.';
      div.querySelector('#loginFehler').style.display = 'block';
      return;
    }

    // Authenticate staff — for the demo we accept any ID with the correct password.
    // Do NOT set `state.aktuellerNutzer` here: employee data must be separate from customer data.
    state.mitarbeiter = { id };
    // If the entered password matches the supervisor password, mark betreuer flag
    if (pw === '1234') state.betreuerEingeloggt = true;

    // Clear any currently loaded customer — the staff must explicitly load a customer per transaction.
    state.aktuellerNutzer = null;

    starteHackerTimer();
    zeigeSeite('menu');
  };

  div.querySelector('#suchBtn').addEventListener('click', suchen);
  div.querySelector('#loginAusweis').addEventListener('input', reset);
  div.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') suchen(); }));

  return div;
}

// ── MENÜ ──
function seiteMenu() {
  const div = document.createElement('div');
  div.className = 'page konto-erstellen-seite';

  // Zwei Reihen à 4 Kacheln, exakt wie in der PDF
  const kacheln = [
    { s:'kontoErstellen1', bild:'Konto_erstellen.png',  label:'Konto erstellen' },
    { s:'einzahlen',       bild:'einzahlen.png',        label:'Einzahlen'       },
    { s:'auszahlen',       bild:'auszahlen.png',        label:'Auszahlen'       },
    { s:'ueberweisung',    bild:'Überweisung_menü.png',  label:'Überweisung'     },
    { s:'aktienKaufen',    bild:'aktien_menü.png',      label:'Aktien'          },
    { s:'konto',           bild:'Konto_menü.png',      label:'Konto'           },
    { s:'spiel',           bild:'Spiel_menü.png',       label:'Spiele'          },
    { s:'ranking',         bild:'Info_menü.png',        label:'Ranking'         },
  ];

  div.innerHTML = `
    <div class="menu-grid">
      ${kacheln.map(k => `
        <div class="kachel" data-s="${k.s}">
          <div class="kachel-bild">
            <!-- BILD EINSETZEN: images/${k.bild} -->
            ${bildImg(k.bild, k.label, 'max-width:100%; max-height:100%; object-fit:contain; display:block;')}
          </div>
          <div class="kachel-label">${k.label}</div>
        </div>
      `).join('')}
    </div>
  `;

  div.querySelectorAll('[data-s]').forEach(el =>
    el.addEventListener('click', () => zeigeSeite(el.dataset.s))
  );
  return div;
}

// ── BETREUER MENÜ (nur "Berufe" Kachel, gleiche Optik wie Kinder-Menü) ──
function seiteBetreuerMenu() {
  // Ensure betreuer stylesheet is loaded so it can be edited separately
  const cssId = 'betreuer-css';
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = 'css/betreuer.css';
    document.head.appendChild(link);
  }

  const div = document.createElement('div');
  div.className = 'page betreuer-page';

  const kachel = { s: 'berufe', bild: 'Berufe_Kachel.png', label: 'Berufe' };

  div.innerHTML = `
    <div class="menu-grid">
      <div class="kachel" data-s="${kachel.s}">
        <div class="kachel-bild">${bildImg(kachel.bild, kachel.label, '')}</div>
        <div class="kachel-label">${kachel.label}</div>
      </div>
    </div>
  `;

  // Click handler: go to the berufe page
  const tile = div.querySelector('.kachel');
  if (tile) tile.addEventListener('click', () => zeigeSeite('berufe'));

  return div;
}

// ── INFO-SEITE (Hauptmenü) ──
function seiteInfo() {
  const div = document.createElement('div');
  div.className = 'page';
  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        ${bildImg('Info_menü.png','Info','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <h2>Info</h2>
        <p style="margin-top:8px;">Hier findest du wichtige Informationen zur App.</p>
      </div>
    </div>
  `;
  return div;
}

// ── KONTO ANZEIGEN ──
function seiteKonto() {
  const n = state.aktuellerNutzer || { id:'…', vorname:'', nachname:'', kontostand:'…' };
  const div = document.createElement('div');
  div.className = 'page';
  div.innerHTML = `
    <div class="seite-layout" style="padding-top:120px;padding-left:80px;">
      <div class="seite-icon">
        <!-- BILD EINSETZEN: images/Login.png -->
        ${bildImg('Login.png','Person','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <!-- Kontonummer wird über das obere Kundensuche-Feld geladen; Anzeige entfernt -->
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige">${n.vorname} ${n.nachname}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige">${n.kontostand}</span>
        </div>
        <div style="margin-top:14px;">
          <button class="btn btn-dunkel" id="fertigBtn">Fertig</button>
        </div>
      </div>
    </div>
  `;
  div.querySelector('#fertigBtn').addEventListener('click', zurueck);
  // customer selector (staff can enter a customer's account here)
  renderKundenSelector(div, 'konto');
  return div;
}

// ── KONTO ERSTELLEN 1: Kontonummer suchen ──
function seiteKontoErstellen1() {
  const div = document.createElement('div');
  div.className = 'page konto-erstellen-seite';
  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        ${bildImg('Login.png','Person','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <div class="feld-zeile">
          <label>Kontonummer:</label>
          <input type="text" class="feld-input" id="k1Input"
                 placeholder="z.B. AB1234" maxlength="16" style="text-transform:uppercase;" />
        </div>
        <div class="feld-zeile">
          <label>Vorname:</label>
          <input type="text" class="feld-input" id="k1Vname" placeholder="Vorname" />
        </div>
        <div class="feld-zeile">
          <label>Nachname:</label>
          <input type="text" class="feld-input" id="k1Nname" placeholder="Nachname" />
        </div>
        <span class="fehler-text" id="k1Fehler"></span>
        <div style="margin-top:14px;">
          <button class="btn btn-dunkel" id="k1Fertig">Fertig</button>
        </div>
      </div>
    </div>
  `;

  div.querySelector('#k1Fertig').addEventListener('click', () => {
    const id = div.querySelector('#k1Input').value.trim().toUpperCase();
    const vn = div.querySelector('#k1Vname').value.trim();
    const nn = div.querySelector('#k1Nname').value.trim();
    const fehler = div.querySelector('#k1Fehler');
    fehler.style.display = 'none';
    if (!id || !vn || !nn) {
      fehler.textContent = 'Bitte Kontonummer, Vor- und Nachname ausfüllen.';
      fehler.style.display = 'block';
      return;
    }
    // Set as current user for this session; do not persist to state.nutzer yet
    state.aktuellerNutzer = { id: id, vorname: vn, nachname: nn, kontostand: 0, aktien: [], transaktionen: 0, beruf: null };
    zeigeSeite('konto');
  });

  return div;
}

// ── KONTO ERSTELLEN 2: Neuen Kunden erstellen? JA / NEIN ──
function seiteKontoErstellen2() {
  const div = document.createElement('div');
  div.className = 'page';
  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        <!-- BILD EINSETZEN: images/Login.png -->
        ${bildImg('Login.png','Person','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <div style="margin-bottom:24px;">
          <span class="feld-input anzeige"
                style="font-size:1.1rem; padding:12px 20px;">
            Neuen Kunden erstellen?
          </span>
        </div>
        <div style="display:flex; gap:14px;">
          <button class="btn btn-gruen" id="jaBtn"  style="min-width:80px;">JA</button>
          <button class="btn btn-dunkel" id="neinBtn" style="min-width:80px;">NEIN</button>
        </div>
      </div>
    </div>
  `;
  div.querySelector('#jaBtn').addEventListener('click', () => zeigeSeite('kontoErstellen3'));
  div.querySelector('#neinBtn').addEventListener('click', zurueck);
  return div;
}

// ── KONTO ERSTELLEN 3: Daten eingeben ──
function seiteKontoErstellen3() {
  const neueId = genId();
  const div = document.createElement('div');
  div.className = 'page';
  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        <!-- BILD EINSETZEN: images/Login.png -->
        ${bildImg('Login.png','Person','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <div class="feld-zeile">
          <label>Id:</label>
          <span class="feld-input anzeige">${neueId}</span>
        </div>
        <div class="feld-zeile">
          <label>Vorname:</label>
          <input type="text" class="feld-input" id="k3Vname" placeholder="Vorname" />
        </div>
        <div class="feld-zeile">
          <label>Nachname:</label>
          <input type="text" class="feld-input" id="k3Nname" placeholder="Nachname" />
        </div>
        <span class="fehler-text" id="k3Fehler"></span>
        <div style="margin-top:14px;">
          <button class="btn btn-dunkel" id="k3Fertig">Fertig</button>
        </div>
      </div>
    </div>
  `;

  div.querySelector('#k3Fertig').addEventListener('click', () => {
    const vn = div.querySelector('#k3Vname').value.trim();
    const nn = div.querySelector('#k3Nname').value.trim();
    const fehler = div.querySelector('#k3Fehler');
    if (!vn || !nn) {
      fehler.textContent = 'Bitte Vor- und Nachname eingeben.';
      fehler.style.display = 'block';
      return;
    }
    const neu = { id:neueId, vorname:vn, nachname:nn, kontostand:0,
                  aktien:[], transaktionen:0, sparbuch:0, beruf:null };
    state.nutzer.push(neu);
    state.aktuellerNutzer = neu;
    zeigeSeite('konto');
  });
  return div;
}

// ── EINZAHLEN ──
function seiteEinzahlen() {
  const n = state.aktuellerNutzer || { id:'…', vorname:'', nachname:'', kontostand:0 };
  const div = document.createElement('div');
  div.className = 'page';
  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        <!-- BILD EINSETZEN: images/einzahlen.png -->
        ${bildImg('einzahlen.png','Einzahlen','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <!-- Kontonummer wird über das obere Kundensuche-Feld geladen; Anzeige entfernt -->
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige">${n.vorname} ${n.nachname}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige">${n.kontostand}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand neu:</label>
          <span class="feld-input anzeige" id="neuStand">…</span>
        </div>
        <div class="aktions-zeile">
          <input type="number" class="feld-input" id="betragInput"
                 placeholder="…" min="1" style="max-width:140px;" />
          <button class="btn btn-dunkel" id="einzBtn">einzahlen</button>
        </div>
        <span class="fehler-text" id="einzFehler"></span>
      </div>
    </div>
  `;

  div.querySelector('#betragInput').addEventListener('input', () => {
    const b = parseInt(div.querySelector('#betragInput').value) || 0;
    div.querySelector('#neuStand').textContent = b > 0 ? (n.kontostand + b) : '…';
  });

  div.querySelector('#einzBtn').addEventListener('click', () => {
    const b = parseInt(div.querySelector('#betragInput').value);
    const fehler = div.querySelector('#einzFehler');
    if (!b || b <= 0) { fehler.textContent='Bitte Betrag eingeben.'; fehler.style.display='block'; return; }
    n.kontostand += b;
    addTranAktion(n);
    zeigeSeite('menu');
  });
  // customer selector for staff
  renderKundenSelector(div, 'einzahlen');
  return div;
}

// ── AUSZAHLEN ──
function seiteAuszahlen() {
  const n = state.aktuellerNutzer || { id:'…', vorname:'', nachname:'', kontostand:0 };
  const div = document.createElement('div');
  div.className = 'page';
  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        <!-- BILD EINSETZEN: images/auszahlen.png -->
        ${bildImg('auszahlen.png','Auszahlen','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <!-- Kontonummer wird über das obere Kundensuche-Feld geladen; Anzeige entfernt -->
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige">${n.vorname} ${n.nachname}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige">${n.kontostand}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand neu:</label>
          <span class="feld-input anzeige" id="neuStand">…</span>
        </div>
        <div class="aktions-zeile">
          <input type="number" class="feld-input" id="betragInput"
                 placeholder="…" min="1" style="max-width:140px;" />
          <button class="btn btn-dunkel" id="ausBtn">auszahlen</button>
        </div>
        <span class="fehler-text" id="ausFehler"></span>
      </div>
    </div>
  `;

  div.querySelector('#betragInput').addEventListener('input', () => {
    const b = parseInt(div.querySelector('#betragInput').value) || 0;
    const neu = n.kontostand - b;
    div.querySelector('#neuStand').textContent = b > 0 ? neu : '…';
    div.querySelector('#neuStand').style.color = neu < 0 ? '#d32f2f' : '';
  });

  div.querySelector('#ausBtn').addEventListener('click', () => {
    const b = parseInt(div.querySelector('#betragInput').value);
    const fehler = div.querySelector('#ausFehler');
    if (!b || b <= 0) { fehler.textContent='Bitte Betrag eingeben.'; fehler.style.display='block'; return; }
    if (b > n.kontostand) { fehler.textContent='Nicht genug Guthaben!'; fehler.style.display='block'; return; }
    n.kontostand -= b;
    addTranAktion(n);
    zeigeSeite('menu');
  });
  renderKundenSelector(div, 'auszahlen');
  return div;
}

// ── ÜBERWEISUNG ──
function seiteUeberweisung() {
  const absender = state.aktuellerNutzer || { id: '…', vorname: '', nachname: '', kontostand: 0 };
  let empfaenger = null;
  const div = document.createElement('div');
  div.className = 'page';

  div.innerHTML = `
    <div class="ueberw-layout">
      <!-- Absender -->
      <div class="seite-felder">
        <!-- Kontonummer des Absenders wird über das obere Kundensuche-Feld geladen; Anzeige entfernt -->
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige">${absender.vorname} ${absender.nachname}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige">${absender.kontostand}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand neu:</label>
          <span class="feld-input anzeige" id="absNeu">…</span>
        </div>
      </div>

      <!-- Mitte: Überweisungs-Icon -->
      <div class="ueberw-mitte">
        <!-- BILD EINSETZEN: images/Ueberweisung.png -->
        ${bildImg('Ueberweisung.png','Überweisung','width:80px;height:80px;object-fit:contain;')}
      </div>

      <!-- Empfänger -->
      <div class="seite-felder">
        <div class="feld-zeile">
          <label>Kontonummer:</label>
          <input type="text" class="feld-input" id="empfId"
                 placeholder="…." maxlength="6" style="text-transform:uppercase; max-width:160px;" />
          <button class="such-btn" id="empfSuch">
            <!-- BILD EINSETZEN: images/Suchen.png -->
            ${bildImg('Suchen.png','Suchen','width:28px;height:28px;')}
          </button>
        </div>
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige" id="empfName">…</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige" id="empfStand">…</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand neu:</label>
          <span class="feld-input anzeige" id="empfNeu">…</span>
        </div>
      </div>
    </div>

    <div class="aktions-zeile" style="margin-top:20px; justify-content:center;">
      <input type="number" class="feld-input" id="betragInput"
             placeholder="…" min="1" style="max-width:200px;" />
      <button class="btn btn-dunkel" id="uebBtn">überweisen</button>
    </div>
    <span class="fehler-text" id="uebFehler" style="text-align:center; display:block;"></span>
  `;

  const updateAnzeige = () => {
    const b = parseInt(div.querySelector('#betragInput').value) || 0;
    div.querySelector('#absNeu').textContent = b > 0 ? (absender.kontostand - b) : '…';
    if (empfaenger) div.querySelector('#empfNeu').textContent = b > 0 ? (empfaenger.kontostand + b) : '…';
  };

  div.querySelector('#empfSuch').addEventListener('click', () => {
    const id = div.querySelector('#empfId').value.trim().toUpperCase();
    const fehler = div.querySelector('#uebFehler');
    empfaenger = findeNutzer(id);
    if (!empfaenger || empfaenger.id === absender.id) {
      fehler.textContent = empfaenger ? 'Kein Überweisen an sich selbst.' : 'Konto nicht gefunden.';
      fehler.style.display = 'block';
      empfaenger = null;
      return;
    }
    fehler.style.display = 'none';
    div.querySelector('#empfName').textContent  = empfaenger.vorname + ' ' + empfaenger.nachname;
    div.querySelector('#empfStand').textContent = empfaenger.kontostand;
    updateAnzeige();
  });

  div.querySelector('#betragInput').addEventListener('input', updateAnzeige);

  div.querySelector('#uebBtn').addEventListener('click', () => {
    const b = parseInt(div.querySelector('#betragInput').value);
    const fehler = div.querySelector('#uebFehler');
    if (!empfaenger) { fehler.textContent='Bitte Empfänger suchen.'; fehler.style.display='block'; return; }
    if (!b || b <= 0) { fehler.textContent='Bitte Betrag eingeben.'; fehler.style.display='block'; return; }
    if (b > absender.kontostand) { fehler.textContent='Nicht genug Guthaben!'; fehler.style.display='block'; return; }
    absender.kontostand -= b;
    empfaenger.kontostand += b;
    addTranAktion(absender);
    addTranAktion(empfaenger);
    zeigeSeite('menu');
  });
  // customer selector to choose the sender (staff enters customer id)
  renderKundenSelector(div, 'ueberweisung');
  return div;
}

// ── AKTIEN KAUFEN ──
function seiteAktienKaufen() {
  const n = state.aktuellerNutzer || { id:'…', vorname:'', nachname:'', kontostand:0, aktien:[] };
  const preis = 4;
  let anzahl = 0;
  const div = document.createElement('div');
  div.className = 'page';

  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        <!-- BILD EINSETZEN: images/Bild1.png -->
        ${bildImg('Bild1.png','Aktien','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <!-- Kontonummer wird über das obere Kundensuche-Feld geladen; Anzeige entfernt -->
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige">${n.vorname} ${n.nachname}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige">${n.kontostand}</span>
        </div>
        <div class="feld-zeile">
          <label>Anzahl Aktien:</label>
          <input type="number" id="kaufAnzahl" class="feld-input" min="1" max="3" placeholder="1–3" style="width:80px;" />
          <button class="btn btn-dunkel" id="kaufBtn">kaufen</button>
        </div>
        <span class="fehler-text" id="kaufFehler" style="display:none;"></span>
      </div>
    </div>
  `;

  div.querySelector('#kaufBtn').addEventListener('click', () => {
    const fehler = div.querySelector('#kaufFehler');
    const preis = 3;
    const anzahl = parseInt(div.querySelector('#kaufAnzahl').value, 10);
    if (!anzahl || anzahl < 1) {
      fehler.textContent = 'Bitte eine Anzahl eingeben (mind. 1).';
      fehler.style.display = 'block'; return;
    }
    if (n.aktien.length + anzahl > 3) {
      fehler.textContent = `Maximal 3 Aktien pro Person erlaubt. Bereits vorhanden: ${n.aktien.length}.`;
      fehler.style.display = 'block'; return;
    }
    if (anzahl * preis > n.kontostand) {
      fehler.textContent = 'Nicht genug Guthaben!';
      fehler.style.display = 'block'; return;
    }
    fehler.style.display = 'none';
    const startIdx = n.aktien.length;
    n.kontostand -= anzahl * preis;
    for (let i = 0; i < anzahl; i++) {
      n.aktien.push({ nummer: Math.floor(10000000 + Math.random() * 90000000).toString(), wert: preis });
    }
    state.letzteGekaufteAktien = n.aktien.slice(startIdx);
    addTranAktion(n);
    zeigeSeite('aktienKaufenZaehler');
  });
  // allow staff to enter/select customer on this page
  renderKundenSelector(div, 'aktienKaufen');

  // Inline-Seite für Zähler nach Klick auf "kaufen"
  // (wird als eigene Seite gerendert)
  return div;
}

// ── AKTIEN KAUFEN – KURS EINTRAGEN ──
// Nach dem Kauf dreht man am Rad und trägt das Ergebnis hier ein.
function seiteAktienKaufenZaehler() {
  const n = state.aktuellerNutzer || { id: '…', vorname: '', nachname: '', kontostand: 0, aktien: [] };
  const zuletzt = state.letzteGekaufteAktien || [];
  const basisWert = 3;
  let kurs = null; // null = noch nicht ausgewählt

  const div = document.createElement('div');
  div.className = 'page';
  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        ${bildImg('Bild1.png','Aktien','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige">${n.vorname} ${n.nachname}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige">${n.kontostand}</span>
        </div>
        <div class="counter-zeile">
          <button class="cnt-btn minus-gross" id="kurs-mm">- -</button>
          <button class="cnt-btn minus-klein" id="kurs-mi">-</button>
          <div class="cnt-val" id="kursVal" title="0 auswählen" style="cursor:pointer;">0</div>
          <button class="cnt-btn plus-klein" id="kurs-pl">+</button>
          <button class="cnt-btn plus-gross" id="kurs-pp">+ +</button>
          <button class="btn btn-dunkel" id="eintragenBtn" style="margin-left:12px;">eintragen</button>
        </div>
        <div id="kursInfo" style="margin-top:8px;font-size:0.9rem;color:#123250;"></div>
        <span class="fehler-text" id="kursFehler" style="display:none;"></span>
      </div>
    </div>
  `;

  const kursBtns = [
    { id: 'kurs-mm', val: -2 },
    { id: 'kurs-mi', val: -1 },
    { id: 'kurs-pl', val: +1 },
    { id: 'kurs-pp', val: +2 },
  ];
  const valDiv = div.querySelector('#kursVal');
  const infoDiv = div.querySelector('#kursInfo');

  const updateAuswahl = () => {
    // Anzeige im Zentrum
    valDiv.textContent = kurs === null ? '0' : (kurs > 0 ? '+' + kurs : String(kurs));
    // Buttons hervorheben
    kursBtns.forEach(b => {
      div.querySelector('#' + b.id).classList.toggle('cnt-btn-aktiv', kurs === b.val);
    });
    valDiv.classList.toggle('cnt-val-aktiv', kurs === 0);
    // Info-Zeile
    if (kurs !== null) {
      const neuerWert = Math.max(0, basisWert + kurs);
      infoDiv.textContent = `Kurs: ${kurs > 0 ? '+' + kurs : kurs} → Aktie jetzt ${neuerWert} Stuggis wert`;
    } else {
      infoDiv.textContent = 'Rad-Ergebnis auswählen:';
    }
  };

  // 0 – Zentrum-Div auswählbar machen
  valDiv.addEventListener('click', () => { kurs = 0; updateAuswahl(); });

  kursBtns.forEach(b => {
    div.querySelector('#' + b.id).addEventListener('click', () => { kurs = b.val; updateAuswahl(); });
  });

  updateAuswahl(); // Initialzustand

  div.querySelector('#eintragenBtn').addEventListener('click', () => {
    const fehler = div.querySelector('#kursFehler');
    if (kurs === null) {
      fehler.textContent = 'Bitte zuerst das Rad-Ergebnis auswählen.';
      fehler.style.display = 'block'; return;
    }
    fehler.style.display = 'none';
    const neuerWert = Math.max(0, basisWert + kurs);
    zuletzt.forEach(a => { a.wert = neuerWert; });
    zeigeSeite('aktienVerkaufen');
  });

  renderKundenSelector(div, 'aktienKaufenZaehler');
  return div;
}

// ── AKTIEN VERKAUFEN ──
function seiteAktienVerkaufen() {
  const n = state.aktuellerNutzer || { id:'…', vorname:'', nachname:'', kontostand:0, aktien:[] };
  const div = document.createElement('div');
  div.className = 'page';

  const zeilen = n.aktien.length
    ? n.aktien.map((a,i) => `
        <tr>
          <td><input type="checkbox" class="aktie-cb" data-idx="${i}"
              style="accent-color:#36C291; width:16px; height:16px;" /></td>
          <td>${a.nummer}</td>
          <td>${a.wert}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="text-align:center; color:#888; padding:12px;">Keine Aktien vorhanden</td></tr>`;

  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        <!-- BILD EINSETZEN: images/Bild1.png -->
        ${bildImg('Bild1.png','Aktien','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <!-- Kontonummer wird über das obere Kundensuche-Feld geladen; Anzeige entfernt -->
        <div class="feld-zeile">
          <label>Name:</label>
          <span class="feld-input anzeige">${n.vorname} ${n.nachname}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige">${n.kontostand}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand neu:</label>
          <span class="feld-input anzeige" id="neuKS">…</span>
        </div>
        <table class="daten-tabelle">
          <thead><tr><th></th><th>Aktiennummer</th><th>Wert</th></tr></thead>
          <tbody>${zeilen}</tbody>
        </table>
        <div style="margin-top:10px;">
          <button class="btn btn-dunkel" id="verkaufBtn">verkaufen</button>
        </div>
      </div>
    </div>
  `;

  div.querySelectorAll('.aktie-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const sel = [...div.querySelectorAll('.aktie-cb:checked')];
      const erloes = sel.reduce((s,el) => s + n.aktien[el.dataset.idx].wert, 0);
      div.querySelector('#neuKS').textContent = n.kontostand + erloes;
    });
  });

  div.querySelector('#verkaufBtn').addEventListener('click', () => {
    const sel = [...div.querySelectorAll('.aktie-cb:checked')].map(el => parseInt(el.dataset.idx));
    if (!sel.length) { alert('Bitte mindestens eine Aktie auswählen.'); return; }
    const erloes = sel.reduce((s,i) => s + n.aktien[i].wert, 0);
    n.aktien = n.aktien.filter((_,i) => !sel.includes(i));
    n.kontostand += erloes;
    addTranAktion(n);

    // Fertig-Ansicht nach Verkauf
    div.innerHTML = `
      <div class="seite-layout">
        <div class="seite-icon">
          <!-- BILD EINSETZEN: images/Bild1.png -->
          ${bildImg('Bild1.png','Aktien','width:140px;height:140px;object-fit:contain;')}
        </div>
        <div class="seite-felder">
          <!-- Kontonummer wird über das obere Kundensuche-Feld geladen; Anzeige entfernt -->
            <div class="feld-zeile"><label>Name:</label><span class="feld-input anzeige">${n.vorname} ${n.nachname}</span></div>
            <div class="feld-zeile"><label>Kontostand:</label><span class="feld-input anzeige">${n.kontostand - erloes}</span></div>
            <div class="feld-zeile"><label>Kontostand neu:</label><span class="feld-input anzeige">${n.kontostand}</span></div>
          <table class="daten-tabelle">
            <thead><tr><th>Aktiennummer</th><th>Wert</th></tr></thead>
            <tbody>${n.aktien.map(a=>`<tr><td>${a.nummer}</td><td>${a.wert}</td></tr>`).join('') || '<tr><td colspan="2" style="text-align:center;color:#888;">Keine Aktien</td></tr>'}</tbody>
          </table>
          <div style="margin-top:10px;">
            <button class="btn btn-dunkel" id="fertigBtn">Fertig</button>
          </div>
        </div>
      </div>
    `;
    div.querySelector('#fertigBtn').addEventListener('click', zurueck);
  });
  return div;
}

// ── HACKER ──
function seiteHacker() {
  const div = document.createElement('div');
  div.className = 'hacker-seite';
  div.innerHTML = `
    <div class="hacker-icon-wrap">
      <!-- BILD EINSETZEN: images/Hacker_Bidl.png -->
      ${bildImg('Hacker_Bidl.png','Hacker','width:140px;height:140px;object-fit:contain;')}
    </div>
    <div class="hacker-text">Die Bank wurde gehackt!!!</div>
    <button class="btn btn-dunkel" id="rettenBtn">Bank retten</button>
  `;
  div.querySelector('#rettenBtn').addEventListener('click', () => {
    // ── Mini-Spiel: Emoji-Fehler im Hacker-Code finden ──
    const EMOJIS    = ['🐛','💣','👾','🦠','☠️'];
    const ANZAHL    = 5; // so viele Fehler versteckt im Code
    const ZEILEN    = 30;
    const SPALTEN   = 6;
    const CODE_TOKENS = [
      'if(x>0)','return null;','var _k=[];','new Error()',
      '0x4F2A','delete obj','while(1)','eval(src)',
      'break;','import *','throw e;','const z={}',
      'process.exit','Buffer.from','undefined','__proto__',
      '!==false','===null','>>0x10','<<0xFF',
    ];
    // Erstelle Zeilen: normale Tokens + zufällig verteilte Emojis
    const allPositionen = [];
    for (let r=0; r<ZEILEN; r++)
      for (let c=0; c<SPALTEN; c++) allPositionen.push(r*SPALTEN+c);
    // Wähle ANZAHL zufällige Positionen für Emojis
    const shuffled = allPositionen.sort(() => Math.random()-0.5);
    const fehlerPos = new Set(shuffled.slice(0, ANZAHL));
    let gefunden = 0;
    // Baue HTML der Code-Zeilen
    let cellsHtml = '';
    for (let i=0; i<ZEILEN*SPALTEN; i++) {
      const istFehler = fehlerPos.has(i);
      const emoji = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
      const token = CODE_TOKENS[Math.floor(Math.random()*CODE_TOKENS.length)];
      if (istFehler) {
        cellsHtml += `<span class="hk-cell hk-fehler" data-found="0">${emoji}</span>`;
      } else {
        cellsHtml += `<span class="hk-cell hk-code">${token}</span>`;
      }
    }
    div.innerHTML = `
      <div class="hacker-spiel-box">
        <div class="hk-header">
          <span>🔍 Finde alle <strong>${ANZAHL} Fehler</strong> im Hacker-Code!</span>
          <span id="hkStatus">Gefunden: 0 / ${ANZAHL}</span>
        </div>
        <div class="hk-code-block" id="hkBlock">${cellsHtml}</div>
      </div>
    `;
    div.querySelector('#hkBlock').addEventListener('click', e => {
      const cell = e.target.closest('.hk-fehler');
      if (!cell || cell.dataset.found === '1') return;
      cell.dataset.found = '1';
      cell.classList.add('hk-gefunden');
      gefunden++;
      div.querySelector('#hkStatus').textContent = `Gefunden: ${gefunden} / ${ANZAHL}`;
      if (gefunden >= ANZAHL) {
        div.querySelector('#hkStatus').textContent = '✅ Alle Fehler gefunden! Bank gerettet!';
        div.querySelector('#hkBlock').style.pointerEvents = 'none';
        setTimeout(() => zeigeSeite('menu'), 1500);
      }
    });
    // Falsche Klicks → kurzes Schütteln
    div.querySelector('#hkBlock').addEventListener('click', e => {
      const cell = e.target.closest('.hk-code');
      if (!cell) return;
      cell.classList.add('hk-shake');
      setTimeout(() => cell.classList.remove('hk-shake'), 400);
    });
  });
  return div;
}

// ── RANKING ──
function seiteRanking() {
  const div = document.createElement('div');
  div.className = 'page';
  const sorted = [...state.nutzer].sort((a,b) => (b.transaktionen||0) - (a.transaktionen||0));
  const zeilen = sorted.length
    ? sorted.map((n,i) => `<tr><td>${i+1}</td><td>${n.vorname} ${n.nachname}</td><td>${n.transaktionen||0}</td></tr>`).join('')
    : Array.from({length:8},(_,i) => `<tr><td>${i+1}</td><td></td><td></td></tr>`).join('');

  div.innerHTML = `
    <div class="ranking-layout">
      <div class="ranking-icon">
        <!-- BILD EINSETZEN: images/Ranking_Bild.png -->
        ${bildImg('Ranking_Bild.png','Ranking','width:120px;object-fit:contain;')}
      </div>
      <div style="flex:1;">
        <table class="daten-tabelle">
          <thead><tr><th>Position</th><th>Name</th><th>Transaktionen</th></tr></thead>
          <tbody>${zeilen}</tbody>
        </table>
      </div>
    </div>
  `;
  return div;
}

// ── SPIEL ──
function seiteSpiel() {
  const div = document.createElement('div');
  div.className = 'page';

  div.innerHTML = `
    <div class="spiel-layout">
      <div class="spiel-box" style="flex:1;">
        <div class="snake-score-zeile">
          <span>Punkte: <strong id="snakeScore">0</strong></span>
          <span>Bestleistung: <strong id="snakeBest">0</strong></span>
        </div>
        <div class="spiel-canvas-wrap">
          <canvas id="snakeCanvas" width="520" height="440"></canvas>
        </div>
        <p style="color:white; font-size:0.78rem; text-align:center; margin-top:8px;">
          Pfeiltasten oder WASD
        </p>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btn-gruen" id="snakeStart" style="flex:1;">Starten</button>
          <button class="btn btn-gruen" id="snakeStop" style="flex:1;">Stop</button>
        </div>
      </div>
    </div>
  `;

  const canvas = div.querySelector('#snakeCanvas');
  const ctx = canvas.getContext('2d');
  const sz = 16, cols = Math.floor(canvas.width/sz), rows = Math.floor(canvas.height/sz);
  let snake, dir, food, score, running, animId, lastTime;
  const bester = () => parseInt(localStorage.getItem('snakeBest')||'0');

  function stopSpiel() {
    if (!running) return;
    running = false;
    if (animId) cancelAnimationFrame(animId);
    if (score > bester()) localStorage.setItem('snakeBest', score);
    ctx.fillStyle = 'rgba(18,50,80,0.75)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white'; ctx.textAlign = 'center';
    ctx.font = 'bold 20px Arial'; ctx.fillText('Gestoppt', canvas.width/2, canvas.height/2-10);
    ctx.font = '15px Arial'; ctx.fillText('Punkte: '+score, canvas.width/2, canvas.height/2+14);
    div.querySelector('#snakeBest').textContent = bester();
  }

  function init() {
    snake=[{x:10,y:8}]; dir={x:1,y:0}; score=0; running=true;
    div.querySelector('#snakeScore').textContent=0;
    div.querySelector('#snakeBest').textContent=bester();
    placeFood(); if(animId) cancelAnimationFrame(animId); lastTime=0;
    requestAnimationFrame(loop);
  }

  function placeFood() { food={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)}; }

  function draw() {
    ctx.fillStyle='#123250'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#c3aad2'; ctx.beginPath();
    ctx.arc(food.x*sz+sz/2,food.y*sz+sz/2,sz/2-1,0,Math.PI*2); ctx.fill();
    snake.forEach((s,i)=>{ ctx.fillStyle=i===0?'#fff':'#36C291'; ctx.fillRect(s.x*sz+1,s.y*sz+1,sz-2,sz-2); });
  }

  function loop(ts=0) {
    if(!running) return;
    animId=requestAnimationFrame(loop);
    if(ts-lastTime<150) return; lastTime=ts;
    const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if(h.x<0||h.x>=cols||h.y<0||h.y>=rows||snake.some(s=>s.x===h.x&&s.y===h.y)){
      running=false;
      if(score>bester()) localStorage.setItem('snakeBest',score);
      ctx.fillStyle='rgba(18,50,80,0.75)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='white'; ctx.textAlign='center';
      ctx.font='bold 20px Arial'; ctx.fillText('Game Over',canvas.width/2,canvas.height/2-10);
      ctx.font='15px Arial'; ctx.fillText('Punkte: '+score,canvas.width/2,canvas.height/2+14);
      div.querySelector('#snakeBest').textContent=bester(); return;
    }
    snake.unshift(h);
    if(h.x===food.x&&h.y===food.y){score++;div.querySelector('#snakeScore').textContent=score;placeFood();}
    else snake.pop();
    draw();
  }

  document.addEventListener('keydown',e=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) e.preventDefault();
    if((e.key==='ArrowUp'   ||e.key==='w')&&dir.y!==1)  dir={x:0,y:-1};
    if((e.key==='ArrowDown' ||e.key==='s')&&dir.y!==-1) dir={x:0,y:1};
    if((e.key==='ArrowLeft' ||e.key==='a')&&dir.x!==1)  dir={x:-1,y:0};
    if((e.key==='ArrowRight'||e.key==='d')&&dir.x!==-1) dir={x:1,y:0};
  });

  ctx.fillStyle='#123250'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='white'; ctx.textAlign='center'; ctx.font='bold 14px Arial';
  ctx.fillText('Drücke Starten',canvas.width/2,canvas.height/2);

  div.querySelector('#snakeStart').addEventListener('click', init);
  div.querySelector('#snakeStop').addEventListener('click', stopSpiel);
  return div;
}

// ── BERUFE: Beruf suchen & eingeben ──
function seiteBerufe() {
  const div = document.createElement('div');
  div.className = 'page';

  div.innerHTML = `
    <div class="berufe-such-layout">
      <div class="berufe-such-icon">
        <!-- BILD EINSETZEN: images/Berufe_Kachel.png -->
        ${bildImg('Berufe_Kachel.png','Berufe','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div style="font-size:1.2rem; font-weight:bold; color:#123250;">Berufe</div>
      <div class="feld-zeile">
        <label>Beruf:</label>
        <input type="text" class="feld-input" id="berufInput" placeholder="…." />
        <button class="such-btn" id="berufSuch">
          <!-- BILD EINSETZEN: images/Suchen.png -->
          ${bildImg('Suchen.png','Suchen','width:32px;height:32px;')}
        </button>
      </div>
      <div id="berufWeiter" style="display:none;">
        <div class="feld-zeile">
          <label>Beruf:</label>
          <span class="feld-input anzeige" id="berufAnzeige"></span>
          <button class="btn btn-dunkel" id="hinzufuegenBtn">hinzufügen</button>
        </div>
      </div>
    </div>
  `;

  div.querySelector('#berufSuch').addEventListener('click', () => {
    const val = div.querySelector('#berufInput').value.trim();
    if (!val) return;
    div.querySelector('#berufAnzeige').textContent = val;
    div.querySelector('#berufWeiter').style.display = 'block';
    div.querySelector('#hinzufuegenBtn').onclick = () => {
      if (state.aktuellerNutzer) state.aktuellerNutzer.beruf = { name: val, lohn: 100 };
      zeigeSeite('berufEinzahlen');
    };
  });

  div.querySelector('#berufInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') div.querySelector('#berufSuch').click();
  });
  // allow staff to choose customer here
  renderKundenSelector(div, 'aktienVerkaufen');

  return div;
}

// ── BERUF EINZAHLEN ──
function seiteBerufEinzahlen() {
  const n = state.aktuellerNutzer || { id:'…', vorname:'', nachname:'', kontostand:0, beruf:null };
  const b = (n && n.beruf) ? n.beruf : { name: '…', lohn: 0 };
  const div = document.createElement('div');
  div.className = 'page';

  div.innerHTML = `
    <div class="seite-layout">
      <div class="seite-icon">
        <!-- BILD EINSETZEN: images/Login.png -->
        ${bildImg('Login.png','Person','width:140px;height:140px;object-fit:contain;')}
      </div>
      <div class="seite-felder">
        <div class="feld-zeile">
          <label>Beruf:</label>
          <span class="feld-input anzeige">${b.name}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand:</label>
          <span class="feld-input anzeige">${n.kontostand}</span>
        </div>
        <div class="feld-zeile">
          <label>Kontostand neu:</label>
          <span class="feld-input anzeige" id="neuStandB">…</span>
        </div>
        <div class="aktions-zeile">
          <input type="number" class="feld-input" id="lohnInput"
                 value="${b.lohn}" placeholder="…" style="max-width:140px;" />
          <button class="btn btn-dunkel" id="einzBtn">einzahlen</button>
        </div>
        <span class="fehler-text" id="berufFehler"></span>
      </div>
    </div>
  `;

  div.querySelector('#lohnInput').addEventListener('input', () => {
    const v = parseInt(div.querySelector('#lohnInput').value) || 0;
    div.querySelector('#neuStandB').textContent = v > 0 ? (n.kontostand + v) : '…';
  });
  div.querySelector('#neuStandB').textContent = n.kontostand + b.lohn;

  div.querySelector('#einzBtn').addEventListener('click', () => {
    const v = parseInt(div.querySelector('#lohnInput').value);
    const fehler = div.querySelector('#berufFehler');
    if (!v || v <= 0) { fehler.textContent='Bitte Betrag eingeben.'; fehler.style.display='block'; return; }
    n.kontostand += v;
    addTranAktion(n);
    zeigeSeite('menu');
  });
  renderKundenSelector(div, 'berufEinzahlen');
  return div;
}

// ── TSCHÜSS ──
function seiteTschuess() {
  const div = document.createElement('div');
  div.className = 'tschuess-seite';
  div.innerHTML = `
    <div class="tschuess-logo">
      <!-- BILD EINSETZEN: images/BwBank_Logo.png -->
      ${bildImg('BwBank_Logo.png','BW Bank','height:50px;object-fit:contain;')}
      <div class="tschuess-logo-text" style="display:none;">BW&#8801;BANK</div>
    </div>
    <button class="btn btn-gruen" style="font-size:1.2rem; padding:14px 48px;"
            onclick="location.reload()">Tschüss!</button>
  `;
  return div;
}

// ===== START =====
zeigeSeite('login');