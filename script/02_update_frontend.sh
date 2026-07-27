#!/bin/bash
# =============================================================================
# Stutengarten 2026 – Frontend Update & Rebuild
# Ausführen NACHDEM du die neuesten Änderungen per "git pull" geholt hast.
# Baut das Frontend neu und deployt es nach /var/www/html.
# =============================================================================
set -e

# ── Farben ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Konfiguration – hier anpassen ───────────────────────────────────────────
REPO_DIR="$HOME/Stutengarten2026"

# ============================================================================
cd "$REPO_DIR/frontend" || error "Frontend-Verzeichnis ${REPO_DIR}/frontend nicht gefunden."

info "=== 1. Dependencies installieren ==="
npm install

info "=== 2. Frontend bauen ==="
npm run build

info "=== 3. Alten Build entfernen & neuen deployen ==="
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
info "Neuer Build nach /var/www/html kopiert."

info "=== 4. Nginx-Konfiguration testen & neu laden ==="
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Frontend-Update abgeschlossen!${NC}"
echo -e "${GREEN}  Erreichbar unter: http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
