#!/bin/bash
# =============================================================================
# Stutengarten 2026 – Frontend Setup (Nginx + Vue/React Build)
# Voraussetzung: Backend-Setup (01_setup_backend.sh) wurde bereits ausgeführt.
# =============================================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info() { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }

REPO_DIR="$HOME/Stutengarten2026"

# ── Nginx installieren ───────────────────────────────────────────────────────
info "=== 1. Nginx installieren ==="
sudo apt install -y nginx
sudo systemctl enable nginx

# ── Frontend bauen ───────────────────────────────────────────────────────────
info "=== 2. Frontend dependencies installieren & bauen ==="
cd "$REPO_DIR/frontend"
npm install
npm run build

# ── Build nach /var/www/html deployen ────────────────────────────────────────
info "=== 3. Build deployen ==="
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
info "Dateien nach /var/www/html kopiert."

# ── Nginx für SPA konfigurieren ──────────────────────────────────────────────
info "=== 4. Nginx-Konfiguration für Single Page App anpassen ==="
NGINX_DEFAULT="/etc/nginx/sites-available/default"

# try_files-Block setzen (ersetzt vorhandenen location / Block)
sudo python3 - <<'PYEOF'
import re, pathlib

path = pathlib.Path("/etc/nginx/sites-available/default")
content = path.read_text()

# Ersetze den location / { ... } Block
new_block = "location / {\n        try_files $uri $uri/ /index.html;\n    }"
content = re.sub(
    r'location\s+/\s*\{[^}]*\}',
    new_block,
    content,
    count=1
)
path.write_text(content)
print("Nginx-Konfiguration aktualisiert.")
PYEOF

# Konfiguration testen
info "=== 5. Nginx-Konfiguration testen ==="
sudo nginx -t

# Nginx neu starten
info "=== 6. Nginx neu starten ==="
sudo systemctl restart nginx

# Firewall (Port 80 sicherstellen)
info "=== 7. Firewall – Port 80 sicherstellen ==="
sudo ufw allow 80/tcp
sudo ufw --force enable

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Frontend-Setup abgeschlossen!${NC}"
echo -e "${GREEN}  Erreichbar unter: http://$(hostname -I | awk '{print $1}')${NC}"
echo -e "${GREEN}  Nginx-Status:     sudo systemctl status nginx${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
