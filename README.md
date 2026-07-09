# 🏦 Stutengarten2026 💻

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
- `dokumentation/` – Dokumentationen (Backend, Installation, etc.) 
- `frontend/` – Frontend-Anwendung
- `script/` – Setup-/Deployment-/Betriebsskripte
- `xlsx-Files/` – projektbezogene Excel-Dateien

---

## Voraussetzungen

### Backend
- **Python 3.11.9**
- **MariaDB 12.0.2**
- Python-Pakete:
  - Flask
  - flask-cors
  - pandas
  - mysql-connector-python
  - pyinstaller
  - openpyxl
  - waitress

### Frontend
- **Node.js** (inkl. `npm`)
- Abhängigkeiten gemäß `package.json` im Frontend-Ordner

---

## API-Endpunkte (Backend)

### Health
- `GET /ping`
- `GET /health`
- `GET /health/pool`

### Settings
- `GET /settings`
- `PATCH /settings`

### Import
- `POST /customer/import`
- `POST /company/import`

### Customers
- `GET /customer/<stutengarten_id>`
- `POST /customer`
- `PATCH /customer/<stutengarten_id>`
- `DELETE /customer/<stutengarten_id>`
- `GET /customersavingsbook`
- `GET /customer/<stutengarten_id>/savingsbook`
- `PATCH /customer/<stutengarten_id>/savingsbook/balance`
- `POST /customer/<stutengarten_id>/transaction`
- `GET /customer/<stutengarten_id>/transactions`
- `GET /customer/statistics`
- `GET /customer/<stutengarten_id>/statistics`
- `POST /customer/transfer`
- `GET /shares/available`
- `GET /shares/name/<share_name>`
- `POST /customer/<stutengarten_id>/shares/buy`
- `GET /customer/<stutengarten_id>/shares`
- `PATCH /customer/<stutengarten_id>/shares/<share_name>`
- `DELETE /customer/<stutengarten_id>/shares/<share_name>`

### Companies
- `GET /company/<company_name>`
- `POST /company`
- `PATCH /company/<company_name>`
- `DELETE /company/<company_name>`
- `GET /companysavingsbook`
- `GET /company/<company_name>/savingsbook`
- `PATCH /company/<company_name>/savingsbook/balance`
- `GET /company/<company_name>/transactions`
- `POST /company/<company_name>/transactions`
- `GET /company/statistics`
- `GET /company/<company_name>/statistics`

### Shares
- `POST /share`
- `GET /share/<share_name>`
- `GET /shares`
