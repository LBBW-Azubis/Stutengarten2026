#!/bin/bash
# =============================================================================
# Stutengarten 2026 – Backend Update & Neustart
# Ausführen NACHDEM du die neuesten Änderungen per "git pull" geholt hast.
# Aktualisiert Python-Abhängigkeiten (falls nötig) und startet den
# PM2-Backend-Prozess neu.
# =============================================================================
set -e

# ── Farben ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Konfiguration – hier anpassen ───────────────────────────────────────────
REPO_DIR="$HOME/Stutengarten2026"
PM2_NAME="stutengarten-backend"

# ============================================================================
cd "$REPO_DIR" || error "Projektverzeichnis ${REPO_DIR} nicht gefunden."

info "=== 1. Python-Abhängigkeiten aktualisieren ==="
if [ -d "venv" ]; then
    source venv/bin/activate
    pip install --upgrade pip -q
    if [ -f "backend/requirements.txt" ]; then
        pip install -r backend/requirements.txt -q
        info "Abhängigkeiten aus backend/requirements.txt installiert."
    else
        pip install flask flask-cors pandas mysql-connector-python pyinstaller openpyxl waitress -q
        warn "Kein backend/requirements.txt gefunden – Standard-Pakete aktualisiert."
    fi
    deactivate
else
    error "venv nicht gefunden in ${REPO_DIR}. Bitte zuerst 01_setup_backend.sh ausführen."
fi

info "=== 2. Backend über PM2 neu starten ==="
if pm2 describe "$PM2_NAME" > /dev/null 2>&1; then
    pm2 restart "$PM2_NAME"
    info "PM2-Prozess '${PM2_NAME}' neu gestartet."
else
    warn "PM2-Prozess '${PM2_NAME}' lief nicht – wird neu gestartet."
    pm2 start "venv/bin/python3 backend/app.py" --name "$PM2_NAME"
fi
pm2 save

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Backend-Update abgeschlossen!${NC}"
echo -e "${GREEN}  Status prüfen:  pm2 status${NC}"
echo -e "${GREEN}  Logs anzeigen:  pm2 logs ${PM2_NAME}${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
