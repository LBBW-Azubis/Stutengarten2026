# Stutengarten2026
Bank-Anwendung für den Stutengarten 2026 der Auszubildenden Fachinformatiker JG24

------------------------------------------------

Die Dokumentation für das Backend ist in der OneDrive

Nur die Ansprechpartner mergen die Branches

Benötigte Downloads:
- MariaDB 12.0.2
    - Konfiguration aus backend/server.config
    - Änderung von Program Files\MariaDB 12.0\data\my.ini bei Unterpunkt [mysqld] "skip-name-resolve" hinzufügen
- Flask + CORS
- Python 3.11.9
- Pandas
- MySQL
- Node.JS (inkl. npm install im direkten Unterordner)
- Pyinstaller
- Openpyxl
- Waitress (als Produktions-Server)

## API-Übersicht (Stand Codebasis)

Die Excel-Datei `API Endpoints.xlsx` ist **nicht vollständig aktuell** zur aktuellen Backend-Implementierung.

Neu/zusätzlich im Code vorhandene Endpunkte (u. a.):

- **Health**
  - `GET /ping`
  - `GET /health`
  - `GET /health/pool`

- **Settings**
  - `GET /settings`
  - `PATCH /settings`

- **Import**
  - `POST /customer/import`
  - `POST /company/import`

- **Customers**
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

- **Companies**
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

- **Shares**
  - `POST /share`
  - `GET /share/<share_name>`
  - `GET /shares`

Hinweis:
- Die tatsächlichen Endpunkte werden in den Flask-Blueprints in `backend/blueprints/` definiert.
- Bitte `API Endpoints.xlsx` anhand dieser Liste aktualisieren, damit Dokumentation und Code wieder synchron sind.
