# Stutengarten2026

Bank-Anwendung für den Stutengarten 2026 der Auszubildenden Fachinformatiker JG24.

---

## Projektüberblick

Dieses Repository enthält die Anwendung für den Stutengarten 2026 mit:

- einem **Python/Flask-Backend**
- einem **JavaScript-Frontend**
- unterstützenden **Setup- und Betriebs-Skripten**

Die Anwendung bildet zentrale Bankprozesse für Kunden und Unternehmen ab (z. B. Kontoführung, Transaktionen, Importe und weitere Fachlogik).

---

## Repository-Struktur

- `backend/` – Backend (Flask, Datenbankzugriff, Fachlogik)
- `frontend/` – Frontend-Anwendung
- `script/` – Setup-/Deployment-/Betriebsskripte
- `xlsx-Files/` – projektbezogene Excel-Dateien

---

## Voraussetzungen

Für die lokale Entwicklung bzw. den Betrieb werden u. a. benötigt:

- **Python 3.11.9**
- **MariaDB 12.0.2**
- **Node.js** (inkl. `npm`)
- Python-Pakete:
  - Flask
  - flask-cors
  - pandas
  - mysql-connector-python
  - pyinstaller
  - openpyxl
  - waitress

---

## Installation (Kurzfassung)

### 1) Repository klonen

```bash
git clone https://github.com/LBBW-Azubis/Stutengarten2026.git
cd Stutengarten2026
```

### 2) Backend-Abhängigkeiten installieren

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install flask flask-cors pandas mysql-connector-python pyinstaller openpyxl waitress
```

### 3) Datenbank konfigurieren

- Datenbankverbindung in `backend/server.config` hinterlegen.
- Falls erforderlich: MariaDB-Konfiguration anpassen (z. B. `skip-name-resolve` unter `[mysqld]`).

### 4) Anwendung starten

Backend (lokal):

```bash
source venv/bin/activate
python backend/app.py
```

---

## Entwicklungs- und Teamhinweise

- Branches und Pull Requests nach Teamprozess verwenden.
- Merges in zentrale Branches erfolgen durch die verantwortlichen Ansprechpartner.
- Backend-Dokumentation/Projektunterlagen liegen zusätzlich in der OneDrive.

---

## Wartung

Bei Änderungen an Konfiguration, Datenmodell oder Betriebsabläufen sollte diese README zeitnah mit aktualisiert werden.
