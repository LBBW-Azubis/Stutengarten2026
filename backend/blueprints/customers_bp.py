from flask import Blueprint, jsonify, request, current_app
from customer import Customer, CustomException, CustomerException
from customer_transactions import CustomerTransaction, CustomerTransactionException
from saving_book import SavingsBook

customers_bp = Blueprint("customers", __name__)

@customers_bp.route("/customer/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    """
    Retrieve a customer by database ID
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        customer = Customer.get_by_db_id(connector, customer_id)
        return jsonify(customer.to_dict()), 200
    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@customers_bp.route("/customer", methods=["POST"])
def create_customer():
    """
    Create a new customer
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        customer = Customer(
            connector,
            stutengarten_id=data.get("stutengarten_id"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
        )
        return jsonify(customer.to_dict()), 200
    except CustomerException as e:
        return jsonify({"error": str(e)}), 400
    except CustomException as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@customers_bp.route("/customer/<int:customer_id>", methods=["PATCH"])
def update_customer(customer_id):
    """
    Partially update customer data (stutengarten_id, first_name, last_name)
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        customer = Customer.get_by_db_id(connector, customer_id)
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

        return jsonify({"status": "success", "updated": updates, "customer": customer.to_dict()}), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@customers_bp.route("/customer/<int:customer_id>", methods=["DELETE"])
def delete_customers(customer_id):
    """
    Delete a customer by database ID
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        customer = Customer.get_by_db_id(connector, customer_id)
        customer.delete()
        return jsonify({"status": "success", "deleted id": customer_id}), 200
    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@customers_bp.route("/customersavingsbook", methods=["GET"])
def get_all_savings_books():
    """
    Retrieve an overview of all savings books.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        result = SavingsBook.get_all_savings_books(connector)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@customers_bp.route("/customer/<int:customer_id>/savingsbook", methods=["GET"])
def get_savings_book_for_customer(customer_id):
    """
    Retrieve the savings book overview for a specific customer.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        result = SavingsBook.get_savings_book_overview(connector, customer_id)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 404


@customers_bp.route("/customer/<int:customer_id>/savingsbook", methods=["POST"])
def create_savings_book_for_customer(customer_id):
    """
    Create a new savings book for a customer.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        new_book = SavingsBook.create_new(connector, customer_id)
        return jsonify(new_book), 201
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@customers_bp.route("/customer/<int:customer_id>/savingsbook/balance", methods=["PATCH"])
def update_balance_for_customer(customer_id):
    """
    Update the balance of a customer's savings book.
    Expects JSON: {"balance": new_balance}
    """
    data = request.json
    if not data or "balance" not in data:
        return jsonify({"error": "No new balance provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        updated = SavingsBook.set_balance(connector, customer_id, data["balance"])
        return jsonify(updated), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500

@customers_bp.route("/customer/<int:customer_id>/transactions", methods=["POST"])
def create_customer_transaction(customer_id):
    """
    Create a new transaction for a customer
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
        # Ensure customer exists
        customer = Customer.get_by_db_id(connector, customer_id)

        # Get customer savings book object
        customer_savings_book = customer.get_savings_book()

        # Get savings book ID from database (Tabellenname angepasst!)
        conn = connector.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT id FROM kundensparbuecher WHERE kunden_fk = %s",
                (customer_id,),
            )
            savings_book_row = cursor.fetchone()
            if not savings_book_row:
                return jsonify({"error": "No savings book found for this customer"}), 404
            savings_book_id = savings_book_row["id"]
        finally:
            cursor.close()

        # Create transaction (Tabellenname für Umsätze ebenfalls anpassen!)
        transaction = CustomerTransaction(
            connector,
            savings_book_id,
            amount,
            purpose,
            customer_savings_book,
        )

        return jsonify(transaction.to_dict()), 201

    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except CustomerTransactionException as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
@customers_bp.route("/customer/<int:customer_id>/transactions", methods=["GET"])
def get_customer_transactions(customer_id):
    """
    Retrieve all transactions for a specific customer.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        transactions = CustomerTransaction.get_all_transactions_for_customer(connector, customer_id)
        return jsonify([transaction.to_dict() for transaction in transactions]), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Error retrieving transactions: {str(e)}"}), 500 
#End-of-file
