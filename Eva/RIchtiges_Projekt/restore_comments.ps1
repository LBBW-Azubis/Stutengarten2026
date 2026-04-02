
# restore_comments.ps1
# Fixes encoding issues + adds back all comments to app.css, app.js, index.html
$p   = 'c:\Users\walds\Desktop\Stutengarte_Projekt_Frontend\RIchtiges_Projekt'
$enc = [System.Text.UTF8Encoding]::new($false)   # UTF-8 without BOM

# ============================
#  HELPER
# ============================
function ins($t, $before, $comment) {
    return $t.Replace($before, ($comment + "`n" + $before))
}

# ============================
#  1. app.js  – encoding + comments
# ============================
$f = "$p\app.js"
$t = [System.IO.File]::ReadAllText($f, $enc)

# ----- encoding fixes (global) -----
$t = $t.Replace('â€¦',  '…')
$t = $t.Replace('Ãœ',   'Ü')
$t = $t.Replace('Ã¼',   'ü')
$t = $t.Replace('Ã¤',   'ä')
$t = $t.Replace('Ã¶',   'ö')
$t = $t.Replace('Ã ',   'à')

# ----- file header -----
$t = $t.Replace(
'const state = {',
"// =============================================`n// STUTENGARTEN BANKFILIALE – app.js`n// =============================================`n`n// ===== STATE =====`nconst state = {")

# ----- state.mitarbeiter comment -----
$t = $t.Replace(
'state.mitarbeiter = null;',
"// logged-in employee (staff) — separate from ``aktuellerNutzer`` (the customer)`nstate.mitarbeiter = null;")

# ----- HILFSFUNKTIONEN -----
$t = $t.Replace(
'function genId() {',
"// ===== HILFSFUNKTIONEN =====`nfunction genId() {")

# ----- bildImg comment -----
$t = $t.Replace(
'function bildImg(src, alt, css) {',
"// Bildplatzhalter-Helper: gibt ein <img> zurück, das bei Fehler unsichtbar bleibt`nfunction bildImg(src, alt, css) {")

# ----- NAVIGATION -----
$t = $t.Replace(
'function zeigeSeite(name) {',
"// ===== NAVIGATION =====`nfunction zeigeSeite(name) {")

# ----- renderKundenSelector comment -----
$t = $t.Replace(
'function renderKundenSelector(containerDiv, pageName) {',
"// Reusable customer selector inserted at top of pages where staff should enter a customer ID`nfunction renderKundenSelector(containerDiv, pageName) {")

# ----- BETREUER LOGIN -----
$t = $t.Replace(
"document.getElementById('betreuerPwInput').addEventListener('keydown', e => {",
"// ===== BETREUER LOGIN =====`ndocument.getElementById('betreuerPwInput').addEventListener('keydown', e => {")

# ----- Betreuer Lupen-Button comment -----
$t = $t.Replace(
'const betreuerSuchBtn = document.getElementById(''betreuerSuchBtn'');',
"// Betreuer: Klick auf Lupen-Button neben dem Passwort-input`nconst betreuerSuchBtn = document.getElementById('betreuerSuchBtn');")

# ----- Zurück-Pfeil comment -----
$t = $t.Replace(
"const backImg = document.querySelector('#backBar .zurueck-pfeil');",
"// Zurück-Pfeil navigiert zur vorherigen Seite`nconst backImg = document.querySelector('#backBar .zurueck-pfeil');")

# ----- SEITEN header + LOGIN -----
$t = $t.Replace(
'function seiteLogin() {',
"// =============================================`n// ===== SEITEN =====`n// =============================================`n`n// ── LOGIN ──`n// Ausweis-Nummer eingeben → Konto suchen → Weiter`nfunction seiteLogin() {")

# ----- MENÜ -----
$t = $t.Replace(
'function seiteMenu() {',
"// ── MENÜ ──`nfunction seiteMenu() {")

# ----- BETREUER MENÜ -----
$t = $t.Replace(
'function seiteBetreuerMenu() {',
"// ── BETREUER MENÜ (nur `"Berufe`" Kachel, gleiche Optik wie Kinder-Menü) ──`nfunction seiteBetreuerMenu() {")

# ----- INFO -----
$t = $t.Replace(
'function seiteInfo() {',
"// ── INFO-SEITE (Hauptmenü) ──`nfunction seiteInfo() {")

# ----- KONTO ANZEIGEN -----
$t = $t.Replace(
'function seiteKonto() {',
"// ── KONTO ANZEIGEN ──`nfunction seiteKonto() {")

# ----- KONTO ERSTELLEN 1 -----
$t = $t.Replace(
'function seiteKontoErstellen1() {',
"// ── KONTO ERSTELLEN 1: Kontonummer suchen ──`nfunction seiteKontoErstellen1() {")

# ----- KONTO ERSTELLEN 2 -----
$t = $t.Replace(
'function seiteKontoErstellen2() {',
"// ── KONTO ERSTELLEN 2: Neuen Kunden erstellen? JA / NEIN ──`nfunction seiteKontoErstellen2() {")

# ----- KONTO ERSTELLEN 3 -----
$t = $t.Replace(
'function seiteKontoErstellen3() {',
"// ── KONTO ERSTELLEN 3: Daten eingeben ──`nfunction seiteKontoErstellen3() {")

# ----- EINZAHLEN -----
$t = $t.Replace(
'function seiteEinzahlen() {',
"// ── EINZAHLEN ──`nfunction seiteEinzahlen() {")

# ----- AUSZAHLEN -----
$t = $t.Replace(
'function seiteAuszahlen() {',
"// ── AUSZAHLEN ──`nfunction seiteAuszahlen() {")

# ----- ÜBERWEISUNG -----
$t = $t.Replace(
'function seiteUeberweisung() {',
"// ── ÜBERWEISUNG ──`nfunction seiteUeberweisung() {")

# ----- AKTIEN KAUFEN -----
$t = $t.Replace(
'function seiteAktienKaufen() {',
"// ── AKTIEN KAUFEN ──`nfunction seiteAktienKaufen() {")

# ----- AKTIEN KAUFEN ZAEHLER -----
$t = $t.Replace(
'function seiteAktienKaufenZaehler() {',
"// ── AKTIEN KAUFEN – KURS EINTRAGEN ──`n// Nach dem Kauf dreht man am Rad und trägt das Ergebnis hier ein.`nfunction seiteAktienKaufenZaehler() {")

# ----- AKTIEN VERKAUFEN -----
$t = $t.Replace(
'function seiteAktienVerkaufen() {',
"// ── AKTIEN VERKAUFEN ──`nfunction seiteAktienVerkaufen() {")

# ----- HACKER -----
$t = $t.Replace(
'function seiteHacker() {',
"// ── HACKER ──`nfunction seiteHacker() {")

# ----- RANKING -----
$t = $t.Replace(
'function seiteRanking() {',
"// ── RANKING ──`nfunction seiteRanking() {")

# ----- SPIEL -----
$t = $t.Replace(
'function seiteSpiel() {',
"// ── SPIEL ──`nfunction seiteSpiel() {")

# ----- BERUFE -----
$t = $t.Replace(
'function seiteBerufe() {',
"// ── BERUFE: Beruf suchen & eingeben ──`nfunction seiteBerufe() {")

# ----- BERUF EINZAHLEN -----
$t = $t.Replace(
'function seiteBerufEinzahlen() {',
"// ── BERUF EINZAHLEN ──`nfunction seiteBerufEinzahlen() {")

# ----- TSCHÜSS -----
$t = $t.Replace(
'function seiteTschuess() {',
"// ── TSCHÜSS ──`nfunction seiteTschuess() {")

# ----- START -----
$t = $t.Replace(
"zeigeSeite('login');",
"// ===== START =====`nzeigeSeite('login');")

[System.IO.File]::WriteAllText($f, $t, $enc)
Write-Host "app.js done: $((($t -split '\n').Count)) lines"

# ============================
#  2. app.css  – section comments
# ============================
$f = "$p\app.css"
$t = [System.IO.File]::ReadAllText($f, $enc)

# File header
$t = $t.Replace(
'* { box-sizing: border-box; margin: 0; padding: 0; }',
"/* ==============================================`n   STUTENGARTEN BANKFILIALE – app.css`n   Design: exakt nach Stutengarten_Anwendung.pdf`n   Farben:`n     #123250  Dunkelblau  (Header, Footer, Buttons dunkel)`n     #36C291  Grün        (Felder, Buttons grün)`n     #19AAD2  Hellblau`n     #F0825A  Coral`n     #FFD719  Gelb`n     #c3aad2  Lila`n     Weiß     Seitenhintergrund`n============================================== */`n`n* { box-sizing: border-box; margin: 0; padding: 0; }")

# Keine Scrollbar
$t = $t.Replace(
"html, body {`n  height: 100%;",
"/* Keine Scrollbar: Inhalt soll immer auf eine Seite passen */`nhtml, body {`n  height: 100%;")

# HEADER
$t = $t.Replace("`n.header {", "`n/* ── HEADER ── */`n.header {")

# FOOTER-LEISTE
$t = $t.Replace("`n.fusszeile {", "`n/* ── FOOTER-LEISTE (Betreuer-Login + Logo + X) ── */`n.fusszeile {")

# inline comments stripped (trailing spaces)
$t = $t.Replace("  gap: 4px; `n  flex: 1;", "  gap: 4px; /* etwas näher zusammenrücken */`n  flex: 1;")
$t = $t.Replace("  padding: 0 2px; `n  display: inline-flex;", "  padding: 0 2px; /* enger am Eingabefeld */`n  display: inline-flex;")
$t = $t.Replace("  height: 20px; `n  width: auto;", "  height: 20px; /* leicht größer, aber unauffällig */`n  width: auto;")

# ZURÜCK-BAR
$t = $t.Replace("`n.zurueck-bar {", "`n/* ── ZURÜCK-BAR ── */`n.zurueck-bar {")

# top: 72px inline comment
$t = $t.Replace("  top: 72px; `n  left: 0;", "  top: 72px; /* leicht nach oben verschoben, damit die Trennlinie höher sitzt */`n  left: 0;")

# make it obvious
$t = $t.Replace(".zurueck-pfeil { cursor: pointer; }", "/* make it obvious the arrow is clickable */`n.zurueck-pfeil { cursor: pointer; }")

# MAIN
$t = $t.Replace("`nmain#app {", "`n/* ── MAIN ── */`nmain#app {")

# Wennn Zurück-Bar
$t = $t.Replace("`nbody.hat-zurueck main#app {", "`n/* Wenn Zurück-Bar sichtbar ist, etwas mehr Abstand oben (angepasst an die neue Bar-Position) */`nbody.hat-zurueck main#app {")

# SEITEN-WRAPPER
$t = $t.Replace("`n.page {", "`n/* ── SEITEN-WRAPPER ── */`n.page {")

# Kunden-Selector
$t = $t.Replace("`n.kunden-selector {", "`n/* Kunden-Selector: occupies full width so its .feld-zeile lines up with others */`n.kunden-selector {")

# Auf Konto- und Konto-erstellen-Seiten
$t = $t.Replace(
".kunden-selector .feld-zeile { margin-bottom:0; }`n.page.konto-erstellen-seite .feld-zeile {",
".kunden-selector .feld-zeile { margin-bottom:0; }`n/* Auf Konto- und Konto-erstellen-Seiten: gleiche Breite für Eingabefelder und feste Label-Breite */`n.page.konto-erstellen-seite .feld-zeile {")

# Ensure kunden selector input
$t = $t.Replace(
".page.konto-erstellen-seite .feld-input.anzeige { width: 420px; min-width: 420px; }`n.page.konto-erstellen-seite .kunden-selector .feld-input {",
".page.konto-erstellen-seite .feld-input.anzeige { width: 420px; min-width: 420px; }`n/* Ensure kunden selector input uses the same sizing when inserted into .seite-felder */`n.page.konto-erstellen-seite .kunden-selector .feld-input {")

# LAYOUT
$t = $t.Replace("`n.seite-layout {", "`n/* ── LAYOUT: Icon links, Felder rechts ── */`n.seite-layout {")

# FELD-ZEILE
$t = $t.Replace("  gap: 0;`n}`n.feld-zeile {", "  gap: 0;`n}`n/* ── FELD-ZEILE: Label + grünes Feld ── */`n.feld-zeile {")

# Make spans with .feld-input
$t = $t.Replace(
"  outline: none;`n}`n.feld-input { display: inline-block;",
"  outline: none;`n}`n/* Make spans with .feld-input respect width too */`n.feld-input { display: inline-block;")

# Lesbare Felder
$t = $t.Replace(
"  background: #2aab7e;`n}`n.feld-input.anzeige {",
"  background: #2aab7e;`n}`n/* Lesbare (nicht editierbare) Felder – etwas heller */`n.feld-input.anzeige {")

# Such-Icon Button
$t = $t.Replace(
"  cursor: default;`n}`n.such-btn {",
"  cursor: default;`n}`n/* Such-Icon Button neben Feld */`n.such-btn {")

# BUTTONS
$t = $t.Replace(
"  object-fit: contain;`n}`n.btn {",
"  object-fit: contain;`n}`n/* ── BUTTONS ── */`n.btn {")

# AKTIONS-ZEILE
$t = $t.Replace(
".btn-voll   { width: 100%; text-align: center; }`n.aktions-zeile {",
".btn-voll   { width: 100%; text-align: center; }`n/* ── AKTIONS-ZEILE (Betrag + Button) ── */`n.aktions-zeile {")

# COUNTER
$t = $t.Replace(
"  gap: 12px;`n  margin-top: 10px;`n}`n.counter-zeile {",
"  gap: 12px;`n  margin-top: 10px;`n}`n/* ── COUNTER (-- - Wert + ++) ── */`n.counter-zeile {")

# TABELLE
$t = $t.Replace(
"  border-radius: 4px;`n}`n.daten-tabelle {",
"  border-radius: 4px;`n}`n/* ── TABELLE ── */`n.daten-tabelle {")

# lila / hellgrau-lila
$t = $t.Replace(
".daten-tabelle tr:nth-child(odd) td  { background: #e8d5e8; } `n.daten-tabelle tr:nth-child(even) td { background: #e8e8f0; } ",
".daten-tabelle tr:nth-child(odd) td  { background: #e8d5e8; } /* lila */`n.daten-tabelle tr:nth-child(even) td { background: #e8e8f0; } /* hellgrau-lila */")

# MENÜ-KACHELN
$t = $t.Replace(
".daten-tabelle tr:nth-child(even) td { background: #e8e8f0; } /* hellgrau-lila */`n.menu-grid {",
".daten-tabelle tr:nth-child(even) td { background: #e8e8f0; } /* hellgrau-lila */`n/* ── MENÜ-KACHELN ── */`n.menu-grid {")

# object-fit: contain in kachel-bild img
$t = $t.Replace(
"  object-fit: contain; `n  display: block;",
"  object-fit: contain; /* show whole image, not cropped */`n  display: block;")

# Große Kachelfläche Kommentar
$t = $t.Replace(
"  text-align: center;`n}`nbody.seite-menu .menu-grid {",
"  text-align: center;`n}`n/* Größere Kachelfläche auf der Haupt-Menüseite (Kinder-Arbeitsfläche)`n   Die Bilder in den Kacheln bleiben bei 100x100; die Kachel selbst wird`n   größer, hat mehr Abstand und eine größere Beschriftung. */`nbody.seite-menu .menu-grid {")

# inline comments in seite-menu grid
$t = $t.Replace("  column-gap: 36px; `n  row-gap: 18px;    `n  margin: -20px 0 44px; `n}",
"  column-gap: 36px; /* horizontal spacing between tiles */`n  row-gap: 18px;    /* reduced vertical spacing between rows */`n  margin: -20px 0 44px; /* deutlich weiter oben anzeigen */`n}")

# inline comment min-height kachel + Leicht größere comment
$t = $t.Replace(
"  min-height: 200px; `n}`nbody.seite-menu .kachel-bild {`n  width: 100px;",
"  min-height: 200px; /* moderate clickable area, tighter rows */`n}`n/* Leicht größere Icon-Fläche; Bild im Inneren bleibt zentriert */`nbody.seite-menu .kachel-bild {`n  width: 100px;")

# Responsive adjustments
$t = $t.Replace(
"  font-size: 1.2rem;`n}`n@media (max-width: 900px) {",
"  font-size: 1.2rem;`n}`n/* Responsive adjustments for the menu page */`n@media (max-width: 900px) {")

# inside first @media: Use two columns
$t = $t.Replace(
"@media (max-width: 900px) {`n  .menu-grid {",
"@media (max-width: 900px) {`n  /* Use two columns on narrow screens */`n  .menu-grid {")

# inside first @media: Slightly smaller
$t = $t.Replace(
"  body.seite-menu .kachel-label { font-size: 1rem; }`n  body.seite-menu .kachel-bild { width: 88px; height: 88px; }",
"  body.seite-menu .kachel-label { font-size: 1rem; }`n  /* Slightly smaller images on small screens to keep spacing */`n  body.seite-menu .kachel-bild { width: 88px; height: 88px; }")

# inside @media 1400: Larger spacing
$t = $t.Replace(
"@media (min-width: 1400px) {`n  body.seite-menu .menu-grid {",
"@media (min-width: 1400px) {`n  /* Larger spacing and tiles on very wide screens */`n  body.seite-menu .menu-grid {")

# inside @media 1400: Slightly larger
$t = $t.Replace(
"  body.seite-menu .kachel-label { font-size: 1.35rem; }`n  body.seite-menu .kachel-bild { width: 120px; height: 120px; }",
"  body.seite-menu .kachel-label { font-size: 1.35rem; }`n  /* Slightly larger images on very wide screens */`n  body.seite-menu .kachel-bild { width: 120px; height: 120px; }")

# LOGIN-SEITE
$t = $t.Replace(
"  body.seite-menu .kachel-bild { width: 120px; height: 120px; }`n}`n.login-seite {",
"  body.seite-menu .kachel-bild { width: 120px; height: 120px; }`n}`n/* ── LOGIN-SEITE ── */`n.login-seite {")

# inside .login-seite centering comments
$t = $t.Replace(
"  align-items: center;`n  min-height: calc(100vh - 80px - 50px);`n  justify-content: center;`n  transform: translateY(-6%);",
"  align-items: center;`n  /* Vertically center inside the available main area (header 80px + footer 50px) */`n  min-height: calc(100vh - 80px - 50px);`n  justify-content: center;`n  /* Nudge slightly upward so the box sits a bit higher than exact center */`n  transform: translateY(-6%);")

# Konto erstellen comment
$t = $t.Replace(
"  max-width: 520px;`n}`n.page.konto-erstellen-seite .seite-layout {",
"  max-width: 520px;`n}`n/* Konto erstellen: nudge the central content slightly downwards */`n.page.konto-erstellen-seite .seite-layout {")

# inline comments padding-top/left
$t = $t.Replace(
"  padding-top: 120px; `n  padding-left: 80px; `n}",
"  padding-top: 120px; /* stärker nach unten schieben */`n  padding-left: 80px; /* schiebe den Inhalt nach rechts */`n}")

# HACKER-SEITE
$t = $t.Replace(
"  .page.konto-erstellen-seite .seite-layout { padding-top: 64px; padding-left: 24px; }`n}`n.hacker-seite {",
"  .page.konto-erstellen-seite .seite-layout { padding-top: 64px; padding-left: 24px; }`n}`n/* ── HACKER-SEITE ── */`n.hacker-seite {")

# Hacker-Angriff-Box
$t = $t.Replace(
"  text-align: center;`n}`n.hacker-angriff-box {",
"  text-align: center;`n}`n/* Hacker-Angriff-Box (dunkelblauer Hintergrund) */`n.hacker-angriff-box {")

# HACKER MINI-SPIEL
$t = $t.Replace(
"  color: white;`n}`n.hacker-spiel-box {",
"  color: white;`n}`n/* ── HACKER MINI-SPIEL (Vollbild) ── */`n.hacker-spiel-box {")

# TSCHÜSS-SEITE
$t = $t.Replace(
".hk-shake { animation: hk-shake-anim 0.4s ease; background: rgba(240,130,90,0.35) !important; }`n.tschuess-seite {",
".hk-shake { animation: hk-shake-anim 0.4s ease; background: rgba(240,130,90,0.35) !important; }`n/* ── TSCHÜSS-SEITE ── */`n.tschuess-seite {")

# ÜBERWEISUNGS-LAYOUT
$t = $t.Replace(
"  letter-spacing: 0.05em;`n}`n.ueberw-layout {",
"  letter-spacing: 0.05em;`n}`n/* ── ÜBERWEISUNGS-LAYOUT ── */`n.ueberw-layout {")

# FEHLER / HINWEIS
$t = $t.Replace(
"  width: 80px;`n  height: 80px;`n  object-fit: contain;`n}`n.fehler-text {",
"  width: 80px;`n  height: 80px;`n  object-fit: contain;`n}`n/* ── FEHLER / HINWEIS ── */`n.fehler-text {")

# SPIEL-SEITE
$t = $t.Replace(
"  color: #36C291;`n  font-size: 0.88rem;`n  margin-top: 6px;`n  display: none;`n}`n.spiel-layout {",
"  color: #36C291;`n  font-size: 0.88rem;`n  margin-top: 6px;`n  display: none;`n}`n/* ── SPIEL-SEITE ── */`n.spiel-layout {")

# RANKING
$t = $t.Replace(
"  margin-bottom: 10px;`n}`n.ranking-layout {",
"  margin-bottom: 10px;`n}`n/* ── RANKING ── */`n.ranking-layout {")

# BERUFE
$t = $t.Replace(
".ranking-icon img {`n  width: 100%;`n  object-fit: contain;`n}`n.berufe-such-layout {",
".ranking-icon img {`n  width: 100%;`n  object-fit: contain;`n}`n/* ── BERUFE ── */`n.berufe-such-layout {")

[System.IO.File]::WriteAllText($f, $t, $enc)
Write-Host "app.css done: $((($t -split '\n').Count)) lines"

# ============================
#  3. index.html  – encoding + comments
# ============================
$f = "$p\index.html"
$t = [System.IO.File]::ReadAllText($f, $enc)

# encoding fixes
$t = $t.Replace('Ã¼', 'ü')

# footer comment
$t = $t.Replace(
'<main id="app"></main>',
"<main id=""app""></main>`n  <!-- Footer-Leiste: Betreuer-Login links, BW-Bank-Logo rechts, X-Button ganz links -->")

# BwBank logo placeholder
$t = $t.Replace(
"    </div>`n    <img src=""images/BwBank_Logo.png""",
"    </div>`n    <!-- Platzhalter: images/BwBank_Logo.png -->`n    <img src=""images/BwBank_Logo.png""")

# Zurück-Bar comment
$t = $t.Replace(
"  </footer>`n  <div class=""zurueck-bar""",
"  </footer>`n  <!-- Zurück-zur-Startseite-Bar (nur auf Unterseiten) -->`n  <div class=""zurueck-bar""")

# Zurück Pfeil placeholder + fix alt text
$t = $t.Replace(
'    <img src="images/Zurueck_Pfeil.png" alt="Zur',
"    <!-- Platzhalter: images/Zurueck_Pfeil.png -->`n    <img src=""images/Zurueck_Pfeil.png"" alt=""Zur")

[System.IO.File]::WriteAllText($f, $t, $enc)
Write-Host "index.html done: $((($t -split '\n').Count)) lines"

Write-Host "`nAlle Dateien wiederhergestellt!"
