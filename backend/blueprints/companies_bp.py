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

def _load_company(connector, company_name: str) -> Company:
    """
    Resolve a company object by its unique name
    """
    try:
        return Company.get_by_name(connector, company_name)
    except (CustomCompanyException, CompanyException) as err:
        raise CompanyException(str(err)) from err

@companies_bp.route("/company/<string:company_name>", methods=["GET"])
def get_company(company_name):
    """
    Retrieve a company by its name.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = _load_company(connector, company_name)
        return jsonify(company.to_dict()), 200
    except CompanyException as err:
        return jsonify({"error": str(err)}), 404
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(err)}), 500


@companies_bp.route("/company", methods=["POST"])
def create_company():
    """
    Create a new company.
    Expected JSON body:
    {
        "name": "Company Name",
        "folder_handed_over": false
    }
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
        return jsonify(company.to_dict()), 201
    except CompanyException as err:
        return jsonify({"error": str(err)}), 400
    except CustomCompanyException as err:
        return jsonify({"error": str(err)}), 500
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(err)}), 500


@companies_bp.route("/company/<string:company_name>", methods=["PATCH"])
def update_company(company_name):
    """
    Partially update company fields.
    Allowed fields: name, folder_handed_over
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = _load_company(connector, company_name)
    except CompanyException as err:
        return jsonify({"error": str(err)}), 404

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

        return jsonify({
            "status": "success",
            "updated": updates,
            "company": company.to_dict()
        }), 200
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": str(err)}), 500


@companies_bp.route("/company/<string:company_name>", methods=["DELETE"])
def delete_company(company_name):
    """
    Delete a company by its name.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = _load_company(connector, company_name)
        company.delete()
        return jsonify({"status": "success", "deleted": company_name}), 200
    except CompanyException as err:
        return jsonify({"error": str(err)}), 404
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(err)}), 500


@companies_bp.route("/companysavingsbook", methods=["GET"])
def get_all_company_savings_books():
    """
    Retrieve all company savings books overview.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        result = CompanySavingsBook.get_all_company_savings_books(connector)
        return jsonify(result), 200
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": str(err)}), 500


@companies_bp.route("/company/<string:company_name>/savingsbook", methods=["GET"])
def get_savings_book_for_company(company_name):
    """
    Retrieve savings book overview for a specific company by name.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = _load_company(connector, company_name)
        result = CompanySavingsBook.get_company_savings_book_overview(connector, company.id)
        return jsonify(result), 200
    except CompanyException as err:
        return jsonify({"error": str(err)}), 404
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": str(err)}), 500


@companies_bp.route("/company/<string:company_name>/savingsbook", methods=["POST"])
def create_savings_book_for_company(company_name):
    """
    Create a new savings book for a company identified by name.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = _load_company(connector, company_name)
        new_book = CompanySavingsBook.create_new(connector, company.id)
        return jsonify(new_book), 201
    except CompanyException as err:
        return jsonify({"error": str(err)}), 404
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": str(err)}), 500


@companies_bp.route("/company/<string:company_name>/savingsbook/balance", methods=["PATCH"])
def update_balance_for_company(company_name):
    """
    Update the balance of a company's savings book.
    Expected JSON body:
    {
        "balance": 123
    }
    """
    data = request.json
    if not data or "balance" not in data:
        return jsonify({"error": "No new balance provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = _load_company(connector, company_name)
        updated = CompanySavingsBook.set_balance(connector, company.id, data["balance"])
        return jsonify(updated), 200
    except CompanyException as err:
        return jsonify({"error": str(err)}), 404
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": str(err)}), 500


@companies_bp.route("/company/<string:company_name>/transactions", methods=["GET"])
def get_company_transactions(company_name):
    """
    Retrieve all transactions for a specific company by name.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        company = _load_company(connector, company_name)
        transactions = CompanyTransaction.get_all_transactions_for_company(connector, company.id)
        return jsonify(transactions), 200
    except CompanyException as err:
        return jsonify({"error": str(err)}), 404
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": f"Error retrieving transactions: {str(err)}"}), 500


@companies_bp.route("/company/<string:company_name>/transactions", methods=["POST"])
def create_company_transaction(company_name):
    """
    Create a new transaction for a company identified by name.
    Expected JSON body:
    {
        "amount": 100,
        "purpose": "Some text"
    }
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
        company = _load_company(connector, company_name)
        company_savings_book = company.get_savings_book()

        conn = connector.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT id FROM unternehmenssparbuecher WHERE unternehmen_fk = %s",
                (company.id,),
            )
            savings_book_row = cursor.fetchone()
            if not savings_book_row:
                return jsonify({"error": "No savings book found for this company"}), 404
            savings_book_id = savings_book_row["id"]
        finally:
            cursor.close()
            conn.close()

        transaction = CompanyTransaction(
            connector,
            savings_book_id,
            amount,
            purpose,
            company_savings_book,
        )
        return jsonify(transaction.to_dict()), 201
    except (CustomCompanyException, CompanyException) as err:
        return jsonify({"error": str(err)}), 404
    except CompanyTransactionException as err:
        return jsonify({"error": str(err)}), 400
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": f"Internal server error: {str(err)}"}), 500


@companies_bp.route("/company/statistics", methods=["GET"])
def get_company_statistics():
    """
    Retrieve company transaction statistics grouped by weekday.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        statistics = CompanyTransaction.get_company_statistics(connector)
        return jsonify(statistics), 200
    except Exception as err:  # pylint: disable=broad-except
        return jsonify({"error": f"Error retrieving statistics: {str(err)}"}), 500
#End-of-file
