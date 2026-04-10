"""
    import blueprints for import of file
    jsonify for answer on api response
    request for requesting a file
    current_app for current connection
"""

from flask import Blueprint, jsonify, request, current_app
from customer_import import CustomerImport
from company_import import CompanyImport

imports_bp = Blueprint("imports", __name__)

@imports_bp.route("/customer/import", methods=["POST"])
def import_customers():
    """
    Import customer data from XLSX file directly into the database
    
    Expects a multipart/form-data POST with the field name "customers".
    """
    try:
        customer_file = request.files.get("customers") or request.files.get("file")
        if not customer_file:
            return jsonify({"error": "No file uploaded"}), 400
        if not customer_file.filename.lower().endswith(".xlsx"):
            return jsonify({"error": "Invalid file type. Only .xlsx files are supported."}), 400

        connector = current_app.config["DB_CONNECTOR"]
        customer_importer = CustomerImport(connector)
        result = customer_importer.import_customers(customer_file)

        if result.get("status") == "success":
            return jsonify(result), 200
        return jsonify(result), 400

    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"status": "error", "message": str(exc)}), 500


@imports_bp.route("/company/import", methods=["POST"])
def import_companies():
    """
    Import company data from XLSX file directly into the database
    
    Expects a multipart/form-data POST with the field name "companies".
    """
    try:
        company_file = request.files.get("companies") or request.files.get("file")
        if not company_file:
            return jsonify({"error": "No file uploaded"}), 400
        if not company_file.filename.lower().endswith(".xlsx"):
            return jsonify({"error": "Invalid file type. Only .xlsx files are supported."}), 400

        connector = current_app.config["DB_CONNECTOR"]
        company_importer = CompanyImport(connector)
        result = company_importer.import_company(company_file)

        if result.get("status") == "success":
            return jsonify(result), 200
        return jsonify(result), 400

    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"status": "error", "message": str(exc)}), 500
#End-of-file
