"""
    import blueprints for health check
    jsonify for answer on api response
    request for requesting a json file
    current_app for current connection
    rest for needed connections
"""

from flask import Blueprint, jsonify, request, current_app
from company import Company, CustomCompanyException, CompanyException
from company_saving_book import CompanySavingsBook
from company_transactions import CompanyTransaction, CompanyTransactionException

companies_bp = Blueprint("companies", __name__)

@companies_bp.route("/company/<int:company_id>", methods=["GET"])
def get_company(company_id):
    """
    Retrieve a company by database ID
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = Company.get_by_db_id(connector, company_id)
        return jsonify(company.to_dict()), 200
    except (CustomCompanyException, CompanyException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@companies_bp.route("/company/<string:bezeichnung>", methods=["GET"])
def get_company_by_name(bezeichnung):
    """
    Retrieve a company by name in database
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = Company.get_by_name(connector, bezeichnung)
        return jsonify(company.to_dict()), 200
    except (CustomCompanyException, CompanyException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e: #pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@companies_bp.route("/company", methods=["POST"])
def create_company():
    """
    Create a new company
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = Company(
            connector,
            name=data.get("name"),
            folder_handed_over=data.get("folder_handed_over", False),
        )
        return jsonify(company.to_dict()), 200
    except CompanyException as e:
        return jsonify({"error": str(e)}), 400
    except CustomCompanyException as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@companies_bp.route("/company/<int:company_id>", methods=["PATCH"])
def update_company(company_id):
    """
    Partially update company data (name, folder_handed_over)
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = Company.get_by_db_id(connector, company_id)
    except (CustomCompanyException, CompanyException) as e:
        return jsonify({"error": str(e)}), 404

    updates = []
    try:
        if "name" in data:
            company.update_name(data["name"])
            updates.append("name")
        if "folder_handed_over" in data:
            company.update_folder_handed_over(data["folder_handed_over"])
            updates.append("folder_handed_over")
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400

        return jsonify({"status": "success", "updated": updates, "company": company.to_dict()}), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@companies_bp.route("/company/<int:company_id>", methods=["DELETE"])
def delete_company(company_id):
    """
    Delete a company by database ID
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = Company.get_by_db_id(connector, company_id)
        company.delete()
        return jsonify({"status": "success", "deleted id": company_id}), 200
    except (CustomCompanyException, CompanyException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@companies_bp.route("/companysavingsbook", methods=["GET"])
def get_all_company_savings_books():
    """
    Retrieve an overview of all company savings books.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        result = CompanySavingsBook.get_all_company_savings_books(connector)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@companies_bp.route("/company/<int:company_id>/savingsbook", methods=["GET"])
def get_savings_book_for_company(company_id):
    """
    Retrieve the savings book overview for a specific company.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        result = CompanySavingsBook.get_company_savings_book_overview(connector, company_id)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 404


@companies_bp.route("/company/<int:company_id>/savingsbook", methods=["POST"])
def create_savings_book_for_company(company_id):
    """
    Create a new savings book for a company.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        new_book = CompanySavingsBook.create_new(connector, company_id)
        return jsonify(new_book), 201
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@companies_bp.route("/company/<int:company_id>/savingsbook/balance", methods=["PATCH"])
def update_balance_for_company(company_id):
    """
    Update the balance of a company's savings book.
    Expects JSON: {"balance": new_balance}
    """
    data = request.json
    if not data:
        return jsonify({"error": "No new balance provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        updated = CompanySavingsBook.set_balance(connector, company_id, data["balance"])
        return jsonify(updated), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@companies_bp.route("/company/<int:company_id>/transactions", methods=["GET"])
def get_company_transactions(company_id):
    """
    Retrieve all transactions for a specific company.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        transactions = CompanyTransaction.get_all_transactions_for_company(connector, company_id)
        return jsonify([transaction.to_dict() for transaction in transactions]), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Error retrieving transactions: {str(e)}"}), 500


@companies_bp.route("/company/<int:company_id>/transactions", methods=["POST"])
def create_company_transaction(company_id):
    """
    Create a new transaction for a company
    Expects JSON: {"amount": 100, "purpose": "..."}
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    amount = data.get("amount")
    purpose = data.get("purpose", "")

    if amount is None:
        return jsonify({"error": "Amount is required"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        # Ensure company exists
        company = Company.get_by_db_id(connector, company_id)

        # Get company savings book object
        company_savings_book = company.get_savings_book()

        # Get savings book ID from database
        conn = connector.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT id FROM unternehmenssparbuecher WHERE unternehmen_fk = %s",
                (company_id,),
            )
            savings_book_row = cursor.fetchone()
            if not savings_book_row:
                return jsonify({"error": "No savings book found for this company"}), 404
            savings_book_id = savings_book_row["id"]
        finally:
            cursor.close()
            conn.close()

        # Create transaction
        transaction = CompanyTransaction(
            connector,
            savings_book_id,
            amount,
            purpose,
            company_savings_book,
        )

        return jsonify(transaction.to_dict()), 201

    except (CustomCompanyException, CompanyException) as e:
        return jsonify({"error": str(e)}), 404
    except CompanyTransactionException as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@companies_bp.route("/company/statistics", methods=["GET"])
def get_company_statistics():
    """
    Retrieve company transaction statistics by weekday
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        statistics = CompanyTransaction.get_company_statistics(connector)
        return jsonify(statistics), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Error retrieving statistics: {str(e)}"}), 500
#End-of-file
