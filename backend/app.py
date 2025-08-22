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
from customer import Customer, CustomException, CustomerException
from saving_book import SavingsBook

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
        # key in frontend has to be called "customers"
        customer_file = request.files.get("customers")
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
        # key in frontend has to be called "companies"
        company_file = request.files.get("companies")
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


@app.route("/customers/<int:customers_id>", methods=["GET"])
def get_customer(customer_id):
    """
    Retrieve a customer by database ID

    GET /customers/<customers_id>

    Returns:
    - 200 JSON with customer data, e.g. {"id": 1, "stutengarten_id": "SG-2026", "vorname": "Max", "nachname": "Mustermann"}
    - 404 JSON {"error": "..."} if no customer with this ID exists or a customer-specific error occurs
    - 500 JSON {"error": "Internal server error", "details": "..."} on unexpected errors
    """
    try:
        customer = Customer.get_by_db_id(connector, customer_id)
        return jsonify(customer.to_dict()), 200
    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/customers", methods=["POST"])
def create_customer():
    """
    Create a new customer

    POST /customers

    Returns:
    - 200 JSON with customer data on success
    - 400 JSON {"error": "..."} if required fields are missing or invalid
    - 500 JSON {"error": "..."} on other errors
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        customer = Customer(
            connector,
            stutengarten_id=data.get("stutengarten_id"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name")
        )
        return jsonify(customer.to_dict()), 200
    except CustomerException as e:
        return jsonify({"error": str(e)}), 400
    except (CustomException) as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/customers/<int:customers_id>", methods=["PATCH"])
def update_customer(customers_id):
    """
    Partially update customer data (stutengarten_id, vorname, nachname)

    PATCH /customers/<customers_id>
    
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
        customer = Customer.get_by_db_id(connector, customers_id)
    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404

    updates = []
    try:
        if "stutengarten_id" in data:
            customer.update_stutengarten_id(data["stutengarten_id"])
            updates.append("stutengarten_id")
        if "first_name" in data:
            customer.update_first_name(data["first_name"])
            updates.append("first_name")
        if "last_name" in data:
            customer.update_last_name(data["last_name"])
            updates.append("last_name")
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400

        return jsonify({"status": "success",
                        "updated": updates,
                        "customer": customer.to_dict()}), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500

@app.route("/customers/<int:customers_id>", methods=["DELETE"])
def delete_customers(customers_id):
    """
    Delete a customer by database ID

    DELETE /customers/<customers_id>

    Returns:
    - 200 JSON {"status": "success"} if deleted
    - 404 JSON {"error": "..."} if not found
    - 500 JSON {"error": "..."} on other errors
    """
    try:
        customer = Customer.get_by_db_id(connector, customers_id)
        customer.delete()
        return jsonify({"status": "success", "deleted id": customers_id}), 200
    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route("/savingsbook", methods=["GET"])
def get_all_savings_books():
    """
    Retrieve an overview of all savings books.

    GET /savingsbooks

    Returns:
    - 200 JSON list of all savings books with customer data,
      e.g. [{"stutengarten_id": "...", "vorname": "...", "nachname": "...", "saldo": ...}]
    - 500 JSON {"error": "..."} on failure
    """
    try:
        result = SavingsBook.get_all_savings_books(connector)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500

@app.route("/customers/<int:customers_id>/savingsbook", methods=["GET"])
def get_savings_book_for_customer(customers_id):
    """
    Retrieve the savings book overview for a specific customer.

    GET /customers/<customers_id>/savingsbook

    Returns:
    - 200 JSON list with savings book info for the customer,
      e.g. [{"stutengarten_id": "...", "saldo": ...}]
    - 404 JSON {"error": "..."} if no savings book for customer found
    """
    try:
        result = SavingsBook.get_savings_book_overview(connector, customers_id)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 404

@app.route("/customers/<int:customers_id>/savingsbook", methods=["POST"])
def create_savings_book_for_customer(customers_id):
    """
    Create a new savings book for a customer.

    POST /customers/<customers_id>/savingsbook

    Returns:
    - 201 JSON {"kunden_id": ..., "saldo": 0} on success
    - 500 JSON {"error": "..."} on failure
    """
    try:
        new_book = SavingsBook.create_new(connector, customers_id)
        return jsonify(new_book), 201
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500

@app.route("/customers/<int:customers_id>/savingsbook/balance", methods=["PATCH"])
def update_balance_for_customer(customers_id):
    """
    Update the balance of a customer's savings book.

    PATCH /customers/<customers_id>/savingsbook/balance

    Expects JSON: {"balance": new_balance}

    Returns:
    - 200 JSON {"kunden_id": ..., "balance": ...} on success
    - 400 JSON {"error": "No new balance provided"} if balance is missing
    - 500 JSON {"error": "..."} on failure
    """
    data = request.json
    if not data or "balance" not in data:
        return jsonify({"error": "No new balance provided"}), 400
    try:
        updated = SavingsBook.set_balance(connector, customers_id, data["balance"])
        return jsonify(updated), 200
    except Exception as e:  # pylint: disable=broad-except
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
