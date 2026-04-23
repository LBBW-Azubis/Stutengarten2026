#!/bin/bash

# =================================================================
# INTERAKTIVES SETUP: UBUNTU FRAME (OHNE GATEWAY)
# =================================================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Ubuntu Kiosk Konfiguration (Lokal/No-Gateway) ===${NC}\n"

# --- INTERAKTIVE ABFRAGE ---

# 1. Netzwerk-Interface erkennen
DEFAULT_IFACE=$(ip link | grep -E '^[0-9]+: (en|eth)' | awk -F: '{print $2}' | tr -d ' ' | head -n1)
read -p "Netzwerk-Interface [$DEFAULT_IFACE]: " INTERFACE
INTERFACE=${INTERFACE:-$DEFAULT_IFACE}

# 2. IP-Adresse
read -p "Gewünschte IP-Adresse (z.B. 192.168.1.100): " IP_ADDR
if [[ -z "$IP_ADDR" ]]; then echo "Fehler: Keine IP angegeben!"; exit 1; fi

# 3. Subnetzmaske (Prefix-Länge)
read -p "Subnetz-Prefix (z.B. 24 für 255.255.255.0) [24]: " PREFIX
PREFIX=${PREFIX:-24}

# 4. Webseite
read -p "Kiosk-URL [https://ubuntu.com]: " TARGET_URL
TARGET_URL=${TARGET_URL:-https://ubuntu.com}

echo -e "\n${YELLOW}Zusammenfassung:${NC}"
echo -e "IP-Adresse: $IP_ADDR/$PREFIX"
echo -e "Interface:  $INTERFACE"
echo -e "Gateway:    (Keines konfiguriert)"
echo -e "URL:        $TARGET_URL"
read -p "Konfiguration so anwenden? (y/n) " CONFIRM

if [[ "$CONFIRM" != "y" ]]; then echo "Abgebrochen."; exit 1; fi

# --- AUSFÜHRUNG ---

echo -e "\n${GREEN}>>> Konfiguriere Netzwerk via Netplan...${NC}"
# Netplan-Datei ohne 'routes' oder 'gateway4'
sudo tee /etc/netplan/01-netcfg.yaml > /dev/null <<EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    $INTERFACE:
      dhcp4: no
      addresses:
        - $IP_ADDR/$PREFIX
EOF

sudo netplan apply

echo -e "${GREEN}>>> Installiere Ubuntu Frame & Browser...${NC}"
sudo snap install ubuntu-frame
sudo snap install wpe-webkit-mirror

echo -e "${GREEN}>>> Konfiguriere Browser-URL...${NC}"
sudo snap set wpe-webkit-mirror url=$TARGET_URL
sudo snap connect wpe-webkit-mirror:wayland ubuntu-frame
sudo snap set ubuntu-frame daemon=true

echo -e "\n${GREEN}Fertig! Die IP wurde gesetzt und der Kiosk startet.${NC}"