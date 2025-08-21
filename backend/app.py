"""
    Import configparser for server.config
    flask endpoint to read an uploaded XLSX file using the helper library `xlsx_file_reader`.
"""
import configparser
from flask import Flask, request, jsonify
from xlsx_file_reader import XlsxFileReader
from db_connector import DbConnector
from customer_import import CustomerImport
from company_import import CompanyImport
from kunde import Kunde, CustomException, KundeException

# Initialize Flask app
app = Flask(__name__)

# Read configuration
config = configparser.ConfigParser()
config.read("server.config")

# Getting values from config file
ip = config["server"]["IPAddress"]
port = int(config["server"]["port"])
db = config["server"]["database"]
user = config["server"]["user"]
password = config["server"]["password"]

# Connecting to database
connector = DbConnector()
connector.connect(ip, user, password, db, port)

# Initialize XLSX reader, Customer Import and Company Import
xlsx_reader = XlsxFileReader()
customer_importer = CustomerImport(connector)
company_importer = CompanyImport(connector)

# Define Flask endpoint to read an uploaded XLSX file
@app.route("/import_customers", methods=["POST"])
def import_customers():
    """
    Import customer data from XLSX file directly into the database
    
    Expects a multipart/form-data POST with the field name "file".
    
    Returns:
    - 200 JSON with import results on success
    - 400 JSON {"error": "No file uploaded"} when no file was sent
    - 400 JSON {"error": "Invalid file type"} for non-XLSX files
    - 500 JSON {"status": "error", "message": "..."} on unexpected errors
    """
    try:
        # key in frontend has to be called "kunden"
        customer_file = request.files.get("kunden")
        if not customer_file:
            return jsonify({"error": "No file uploaded"}), 400
        # Check file type
        if not customer_file.filename.lower().endswith('.xlsx'):
            return jsonify({"error": "Invalid file type. Only .xlsx files are supported."}), 400
        
        # Actually import the customers
        result = customer_importer.import_customers(customer_file)
        
        if result["status"] == "success":
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"status": "error", "message": str(exc)}), 500

@app.route("/import_companies", methods=["POST"])
def import_companies():
    """
    Import company data from XLSX file directly into the database
    
    Expects a multipart/form-data POST with the field name "file".
    
    Returns:
    - 200 JSON with import results on success
    - 400 JSON {"error": "No file uploaded"} when no file was sent
    - 400 JSON {"error": "Invalid file type"} for non-XLSX files
    - 500 JSON {"status": "error", "message": "..."} on unexpected errors
    """
    try:
        # key in frontend has to be called "unternehmen"
        company_file = request.files.get("unternehmen")
        if not company_file:
            return jsonify({"error": "No file uploaded"}), 400
        # Check file type
        if not company_file.filename.lower().endswith('.xlsx'):
            return jsonify({"error": "Invalid file type. Only .xlsx files are supported."}), 400
        
        # Actually import the companies
        result = company_importer.import_company(company_file)
        
        if result["status"] == "success":
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"status": "error", "message": str(exc)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint to verify database connection
    """
    try:
        connection = connector.get_connection()
        if connection and connection.is_connected():
            return jsonify({"status": "healthy", "database": "connected"}), 200
        else:
            return jsonify({"status": "unhealthy", "database": "disconnected"}), 500
    except Exception as exc: # pylint: disable=broad-except
        return jsonify({"status": "error", "message": str(exc)}), 500
    

@app.route("/kunden/<int:kunden_id>", methods=["GET"])
def get_kunde(kunden_id):
    """
    Retrieve a customer by database ID

    GET /kunden/<kunden_id>

    Returns:
    - 200 JSON with customer data, e.g. {"id": 1, "stutengarten_id": "SG-2026", "vorname": "Max", "nachname": "Mustermann"}
    - 404 JSON {"error": "..."} if no customer with this ID exists or a customer-specific error occurs
    - 500 JSON {"error": "Internal server error", "details": "..."} on unexpected errors
    """
    try:
        kunde = Kunde.get_by_db_id(connector, kunden_id)
        return jsonify(kunde.to_dict()), 200
    except (CustomException, KundeException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Interner Serverfehler", "details": str(e)}), 500


@app.route("/kunden", methods=["POST"])
def create_kunde():
    """
    Create a new customer

    POST /kunden

    Returns:
    - 200 JSON with customer data on success
    - 400 JSON {"error": "..."} if required fields are missing or invalid
    - 500 JSON {"error": "..."} on other errors
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        kunde = Kunde(
            connector,
            stutengarten_id=data.get("stutengarten_id"),
            vorname=data.get("vorname"),
            nachname=data.get("nachname")
        )
        return jsonify(kunde.to_dict()), 200
    except KundeException as e:
        return jsonify({"error": str(e)}), 400
    except (CustomException) as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Interner Serverfehler", "details": str(e)}), 500

@app.route("/kunden/<int:kunden_id>", methods=["PATCH"])
def update_kunde(kunden_id):
    """
    Partially update customer data (stutengarten_id, vorname, nachname)

    PATCH /kunden/<kunden_id>
    
    Returns:
    - 200 JSON with updated customer data and list of updated fields
    - 400 JSON {"error": "..."} if no valid field is supplied or body is missing
    - 404 JSON {"error": "..."} if the customer does not exist
    - 500 JSON {"error": "..."} on other errors
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        kunde = Kunde.get_by_db_id(connector, kunden_id)
    except (CustomException, KundeException) as e:
        return jsonify({"error": str(e)}), 404

    updates = []
    try:
        if "stutengarten_id" in data:
            kunde.update_stutengarten_id(data["stutengarten_id"])
            updates.append("stutengarten_id")
        if "vorname" in data:
            kunde.update_vorname(data["vorname"])
            updates.append("vorname")
        if "nachname" in data:
            kunde.update_nachname(data["nachname"])
            updates.append("nachname")
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400

        return jsonify({"status": "success", "updated": updates, "kunde": kunde.to_dict()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    try:
        app.run(host='0.0.0.0', port=5000)
    finally:
        # Close database connection when app shuts down
        if connector:
            connector.close()
            print("Database connection closed")

#End-of-file

