#!/bin/bash
# =================================================================
# 100_deactivate_wlan.sh
# Deaktiviert das WLAN dauerhaft (Interface aus + Blockierung,
# damit es auch nach Reboot/Aufwachen nicht wieder aktiviert wird)
# =================================================================
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== WLAN Deaktivierung ===${NC}\n"

# 1. WLAN-Interface finden und ausschalten
WIFI_IFACE=$(ip link | grep -E '^[0-9]+: (wl)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)
if [[ -n "$WIFI_IFACE" ]]; then
    echo -e "${YELLOW}Schalte WLAN-Interface $WIFI_IFACE aus...${NC}"
    sudo ip link set "$WIFI_IFACE" down
    echo -e "${GREEN}WLAN-Interface $WIFI_IFACE ist jetzt deaktiviert!${NC}"
else
    echo -e "${YELLOW}Kein WLAN-Interface im System gefunden.${NC}"
fi

# 2. Dauerhafte Blockierung einrichten, damit networkd-dispatcher
#    das Interface nach Reboot/Aufwachen nicht wieder aktiviert
DISPATCHER_DIR="/etc/networkd-dispatcher/dormant.d"
DISPATCHER_FILE="${DISPATCHER_DIR}/disable-wifi"

echo -e "${YELLOW}Richte dauerhafte WLAN-Sperrung ein...${NC}"
sudo mkdir -p "$DISPATCHER_DIR"
sudo tee "$DISPATCHER_FILE" > /dev/null <<'EOF'
#!/bin/bash
# Hält das WLAN-Interface dauerhaft deaktiviert
WIFI_IFACE=$(ip link | grep -E '^[0-9]+: (wl)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)
if [[ -n "$WIFI_IFACE" ]]; then
    ip link set "$WIFI_IFACE" down
fi
EOF
sudo chmod +x "$DISPATCHER_FILE"
echo -e "${GREEN}Dauerhafte WLAN-Sperrung eingerichtet ($DISPATCHER_FILE).${NC}"

echo -e "\n${GREEN}Vorgang abgeschlossen!${NC}"
