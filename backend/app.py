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

if __name__ == "__main__":
    try:
        app.run(host='0.0.0.0', port=5000)
    finally:
        # Close database connection when app shuts down
        if connector:
            connector.close()
            print("Database connection closed")

#End-of-file

