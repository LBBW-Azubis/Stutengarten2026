#!/bin/bash
# =============================================================================
# Stutengarten 2026 – Backend Setup
# Führe dieses Skript als normaler User (nicht root) auf dem Ubuntu-Server aus.
# =============================================================================
set -e

# ── Farben ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Konfiguration – hier anpassen ───────────────────────────────────────────
DB_NAME="stutengarten"
DB_USER="root"
DB_PASS="1234"
REPO_URL="https://github.com/LBBW-Azubis/Stutengarten2026.git"
REPO_DIR="$HOME/Stutengarten2026"
STATIC_IP="192.168.1.10/24"
NETWORK_IFACE="enp0s8"          # ggf. anpassen (ip a)
NETPLAN_FILE="/etc/netplan/01-netcfg.yaml"

# ============================================================================
echo ""
info "=== 1. System aktualisieren ==="
sudo apt update && sudo apt upgrade -y

# ── Basis-Werkzeuge ──────────────────────────────────────────────────────────
info "=== 2. Basis-Werkzeuge installieren ==="
sudo apt install -y software-properties-common curl git build-essential language-pack-de
sudo locale-gen de_DE.UTF-8
sudo update-locale LANG=de_DE.UTF-8

# ── Python 3.11 ─────────────────────────────────────────────────────────────
info "=== 3. Python 3.11 installieren ==="
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# ── MariaDB 12 ──────────────────────────────────────────────────────────────
info "=== 4. MariaDB 12 installieren ==="
curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup \
    | sudo bash -s -- --mariadb-server-version="mariadb-12.0"
sudo apt update
sudo apt install -y mariadb-server
sudo systemctl enable mariadb
sudo systemctl start mariadb

# ── MariaDB konfigurieren ────────────────────────────────────────────────────
info "=== 5. MariaDB konfigurieren (Datenbank + Root-Passwort) ==="
sudo mariadb <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
ALTER USER '${DB_USER}'@'localhost'
    IDENTIFIED VIA mysql_native_password
    USING PASSWORD('${DB_PASS}');
FLUSH PRIVILEGES;
SQL
info "Datenbank '${DB_NAME}' und Root-Passwort gesetzt."

# ── Node.js 22 ──────────────────────────────────────────────────────────────
info "=== 6. Node.js 22 installieren ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# ── Repository klonen ────────────────────────────────────────────────────────
info "=== 7. Repository klonen ==="
if [ -d "$REPO_DIR" ]; then
    warn "Verzeichnis $REPO_DIR existiert bereits – überspringe clone."
else
    git clone "$REPO_URL" "$REPO_DIR"
fi
cd "$REPO_DIR"

# ── Python Virtual Environment ───────────────────────────────────────────────
info "=== 8. Python-Virtualenv & Packages ==="
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install flask flask-cors pandas mysql-connector-python pyinstaller openpyxl waitress
deactivate

# ── NPM (Backend-Ordner, falls vorhanden) ───────────────────────────────────
info "=== 9. NPM install (Backend-Ordner) ==="
if [ -d "backend" ]; then
    cd backend && npm install && cd "$REPO_DIR"
else
    warn "Kein 'backend'-Ordner gefunden – npm install übersprungen."
fi

# ── SQL-Dump einspielen ──────────────────────────────────────────────────────
info "=== 10. Datenbank-Schema einspielen ==="
if [ -f "backend/datenbank.sql" ]; then
    sudo mariadb -u "$DB_USER" -p"$DB_PASS" < backend/datenbank.sql
    info "Schema aus backend/datenbank.sql eingespielt."
else
    warn "backend/datenbank.sql nicht gefunden – Schema-Import übersprungen."
fi

# ── Firewall ─────────────────────────────────────────────────────────────────
info "=== 11. UFW-Firewall konfigurieren ==="
sudo ufw allow 5000/tcp
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw --force enable
info "UFW aktiv. Offene Ports: 22 (SSH), 80 (HTTP), 5000 (Backend)."

# ── Statische IP (Netplan) ───────────────────────────────────────────────────
info "=== 12. Statische IP konfigurieren (${STATIC_IP} auf ${NETWORK_IFACE}) ==="
sudo tee "$NETPLAN_FILE" > /dev/null <<YAML
network:
  version: 2
  renderer: networkd
  ethernets:
    ${NETWORK_IFACE}:
      addresses:
        - ${STATIC_IP}
YAML
sudo netplan apply
info "Statische IP gesetzt. Aktuelle Konfiguration:"
ip a show "$NETWORK_IFACE" 2>/dev/null || warn "Interface ${NETWORK_IFACE} nicht gefunden."

# ── PM2 & Backend starten ────────────────────────────────────────────────────
info "=== 13. PM2 installieren & Backend starten ==="
sudo npm install -g pm2
cd "$REPO_DIR"

# Vorherige PM2-Instanz sauber entfernen (falls Neustart)
pm2 delete stutengarten-backend 2>/dev/null || true

pm2 start "venv/bin/python3 backend/app.py" --name stutengarten-backend
pm2 save

info "PM2 Startup-Befehl generieren (bitte manuell ausführen):"
pm2 startup | tail -1   # gibt den sudo-Befehl aus – muss manuell kopiert & ausgeführt werden

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Backend-Setup abgeschlossen!${NC}"
echo -e "${GREEN}  Backend läuft unter: http://${STATIC_IP%%/*}:5000${NC}"
echo -e "${GREEN}  PM2-Status prüfen:   pm2 status${NC}"
echo -e "${GREEN}  Logs anzeigen:       pm2 logs stutengarten-backend${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
