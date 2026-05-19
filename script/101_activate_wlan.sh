#!/bin/bash

# =================================================================
# 101_activate_wlan.sh
# Reaktiviert das WLAN (entfernt die dauerhafte Blockierung)
# =================================================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== WLAN Reaktivierung ===${NC}\n"

# 1. Permanentes Blockier-Skript entfernen
DISPATCHER_FILE="/etc/networkd-dispatcher/dormant.d/disable-wifi"
if [ -f "$DISPATCHER_FILE" ]; then
    echo -e "${YELLOW}Entferne dauerhafte WLAN-Sperrung ($DISPATCHER_FILE)...${NC}"
    sudo rm "$DISPATCHER_FILE"
else
    echo -e "${YELLOW}Keine dauerhafte Sperrdatei unter $DISPATCHER_FILE gefunden.${NC}"
fi

# 2. WLAN-Interface finden und aktivieren
WIFI_IFACE=$(ip link | grep -E '^[0-9]+: (wl)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)

if [[ -n "$WIFI_IFACE" ]]; then
    echo -e "${GREEN}Schalte WLAN-Interface $WIFI_IFACE ein...${NC}"
    sudo ip link set "$WIFI_IFACE" up
    echo -e "${GREEN}WLAN-Interface $WIFI_IFACE ist jetzt aktiviert!${NC}"
else
    echo -e "${YELLOW}Kein WLAN-Interface im System gefunden.${NC}"
fi

echo -e "\n${GREEN}Vorgang abgeschlossen!${NC}"
