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
STATIC_IP="192.168.1.10/24"
NETWORK_IFACE="enp3s0"          # ggf. anpassen (ip a)
WIFI_IFACE="wlo1"              # ggf. anpassen (ip a)
NETPLAN_FILE="/etc/netplan/01-netcfg.yaml"

# ── PM2 & Backend starten ────────────────────────────────────────────────────
info "=== 10. PM2 installieren & Backend starten ==="
sudo npm install -g pm2

# Vorherige PM2-Instanz sauber entfernen (falls Neustart)
pm2 delete stutengarten-backend 2>/dev/null || true

pm2 start "venv/bin/python3 backend/app.py" --name stutengarten-backend
pm2 save

info "PM2 in den Autostart eintragen..."
# Spezieller und direkter Autostart-Befehl für Ubuntu (systemd)
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# ── Statische IP (Netplan) ───────────────────────────────────────────────────
info "=== 11. Statische IP konfigurieren (${STATIC_IP} auf ${NETWORK_IFACE}) ==="
sudo tee "$NETPLAN_FILE" > /dev/null <<YAML
network:
  version: 2
  renderer: networkd
  ethernets:
    ${NETWORK_IFACE}:
      dhcp4: no
      optional: true
      addresses:
        - ${STATIC_IP}
  wifis:
    ${WIFI_IFACE}:
      dhcp4: true
      optional: true
      access-points:
        "Stutengarten":
          password: "stutengarten"
YAML
sudo netplan apply
info "Statische IP gesetzt. Aktuelle Konfiguration:"
ip a show "$NETWORK_IFACE" 2>/dev/null || warn "Interface ${NETWORK_IFACE} nicht gefunden."

# Nochmals speichern
pm2 save

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Backend-Setup abgeschlossen!${NC}"
echo -e "${GREEN}  Backend läuft unter: http://${STATIC_IP%%/*}:5000${NC}"
echo -e "${GREEN}  PM2-Status prüfen:   pm2 status${NC}"
echo -e "${GREEN}  Logs anzeigen:       pm2 logs stutengarten-backend${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
