"""
    import blueprints for health check
    jsonify for answer on api response
    request for requesting a json file
    current_app for current connection
    rest for needed connections
"""

from flask import Blueprint, jsonify, request, current_app
from customer import Customer, CustomException, CustomerException
from customer_transactions import CustomerTransaction, CustomerTransactionException
from customer_saving_book import CustomerSavingsBook
from customer_shares import CustomerShares

customers_bp = Blueprint("customers", __name__)

@customers_bp.route("/customer/<string:stutengarten_id>", methods=["GET"])
def get_customer(stutengarten_id):
    """
    Retrieve a customer by database ID
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)
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


@customers_bp.route("/customer/<string:stutengarten_id>", methods=["PATCH"])
def update_customer(stutengarten_id):
    """
    Partially update customer data (stutengarten_id, first_name, last_name)
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)
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

        return jsonify({"status": "success", "updated": updates, "customer": customer.to_dict()}), 200 #pylint: disable=line-too-long
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@customers_bp.route("/customer/<string:stutengarten_id>", methods=["DELETE"])
def delete_customers(stutengarten_id):
    """
    Delete a customer by database ID
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)
        customer.delete()
        return jsonify({"status": "success", "deleted id": stutengarten_id}), 200
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
        result = CustomerSavingsBook.get_all_savings_books(connector)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@customers_bp.route("/customer/<string:stutengarten_id>/savingsbook", methods=["GET"])
def get_savings_book_for_customer(stutengarten_id):
    """
    Retrieve the savings book overview for a specific customer.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        result = CustomerSavingsBook.get_savings_book_overview(connector, stutengarten_id)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 404


@customers_bp.route("/customer/<string:stutengarten_id>/savingsbook", methods=["POST"])
def create_savings_book_for_customer(stutengarten_id):
    """
    Create a new savings book for a customer.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        new_book = CustomerSavingsBook.create_new(connector, stutengarten_id)
        return jsonify(new_book), 201
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@customers_bp.route("/customer/<string:stutengarten_id>/savingsbook/balance", methods=["PATCH"])
def update_balance_for_customer(stutengarten_id):
    """
    Update the balance of a customer's savings book.
    Expects JSON: {"balance": new_balance}
    """
    data = request.json
    if not data or "balance" not in data:
        return jsonify({"error": "No new balance provided"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        updated = CustomerSavingsBook.set_balance(connector, stutengarten_id, data["balance"])
        return jsonify(updated), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500

@customers_bp.route("/customer/<string:stutengarten_id>/transaction", methods=["POST"])
def create_customer_transaction(stutengarten_id):
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
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)

        # Get customer savings book object
        customer_savings_book = customer.get_savings_book()

        # Get savings book ID from database (Tabellenname angepasst!)
        conn = connector.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT id FROM kundensparbuecher WHERE kunden_fk = %s",
                (customer.id,),
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

@customers_bp.route("/customer/<string:stutengarten_id>/transactions", methods=["GET"])
def get_customer_transactions(stutengarten_id):
    """
    Retrieve all transactions for a specific customer.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        transactions = CustomerTransaction.get_all_transactions_for_customer(connector, stutengarten_id) #pylint: disable=line-too-long
        return jsonify([transaction.to_dict() for transaction in transactions]), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Error retrieving transactions: {str(e)}"}), 500

@customers_bp.route("/customer/statistics", methods=["GET"])
def get_customer_statistics():
    """
    Returns customer transaction statistics by weekday.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        result = CustomerTransaction.get_customer_statistics(connector)
        return jsonify(result), 200
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500

@customers_bp.route("/customer/<string:stutengarten_id>/shares", methods=["POST"])
def buy_customer_share(stutengarten_id):
    """
    Creates/Buys a new share for customer

    POST /customer/<stutengarten_id>/shares
    Expects JSON: {"value": 3}
    
    Returns:
    - 201 JSON with share information
    - 400 JSON {"error": "..."} if invalid data
    - 404 JSON {"error": "..."} if customer not found
    - 500 JSON {"error": "..."} other errors
    """
    connector = current_app.config["DB_CONNECTOR"]
    data = request.json

    if not data or "value" not in data:
        return jsonify({"error": "Value is required"}), 400

    value = data.get("value")

    try:
        # Ensure customer exists
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)

        # Get customer savings book
        customer_savings_book = customer.get_savings_book()

        # Get savings book ID from database
        conn = connector.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT id FROM kundensparbuecher WHERE kunden_fk = %s",
                (customer.id,)
            )
            savings_book_row = cursor.fetchone()
            if not savings_book_row:
                return jsonify({"error": "No savings book found for this customer"}), 404
            savings_book_id = savings_book_row["id"]
        finally:
            cursor.close()

        # Create/buy share
        share = CustomerShares(
            connector,
            value,
            savings_book_id,
            customer_savings_book
        )

        return jsonify({
            "status": "success",
            "share_id": share.get_id(),
            "value": share.get_value(),
            "customer_savings_book_id": share.get_customer_savings_book_id()
        }), 201

    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@customers_bp.route("/customer/<string:stutengarten_id>/shares", methods=["GET"])
def get_customer_shares(stutengarten_id):
    """
    Get all shares for a specific customer
    
    GET /customer/<stutengarten_id>/shares
    
    Returns:
    - 200 JSON with list of shares
    - 404 JSON {"error": "..."} if customer not found
    - 500 JSON {"error": "..."} other errors
    """
    connector = current_app.config["DB_CONNECTOR"]

    try:
        # Ensure customer exists
        Customer.get_by_stutengarten_id(connector, stutengarten_id)

        # Get all shares
        shares = CustomerShares.get_all_customer_shares(connector, stutengarten_id)

        return jsonify([{
            "share_id": share.get_id(),
            "value": share.get_value(),
            "customer_savings_book_id": share.get_customer_savings_book_id()
        } for share in shares]), 200

    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@customers_bp.route("/customer/<string:stutengarten_id>/shares/<int:share_id>", methods=["DELETE"])
def sell_customer_share(stutengarten_id, share_id):
    """
    Sell a share for a customer
    
    DELETE /customer/<stutengarten_id>/shares/<share_id>
    
    Returns:
    - 200 JSON with sell information
    - 404 JSON {"error": "..."} if customer or share not found
    - 500 JSON {"error": "..."} other errors
    """
    connector = current_app.config["DB_CONNECTOR"]

    try:
        # Ensure customer exists
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)

        # Get customer savings book
        customer_savings_book = customer.get_savings_book()

        # Sell share - pass stutengarten_id, NOT savings_book_id!
        result = CustomerShares.sell_share(
            connector,
            share_id,
            stutengarten_id,  # Pass stutengarten_id here
            customer_savings_book
        )

        return jsonify(result), 200

    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@customers_bp.route("/customer/<string:stutengarten_id>/shares/<int:share_id>", methods=["PATCH"])
def update_share_value(stutengarten_id, share_id):
    """
    Update the value of a specific share
    
    PATCH /customer/<stutengarten_id>/shares/<share_id>
    Expects JSON: {"value": new_value}
    
    Returns:
    - 200 JSON with update information
    - 400 JSON {"error": "..."} if invalid data
    - 404 JSON {"error": "..."} if customer or share not found
    - 500 JSON {"error": "..."} other errors
    """
    connector = current_app.config["DB_CONNECTOR"]
    data = request.json

    if not data or "value" not in data:
        return jsonify({"error": "New value is required"}), 400

    new_value = data.get("value")

    try:
        # Ensure customer exists
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)

        # Get savings book ID from database
        conn = connector.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT id FROM kundensparbuecher WHERE kunden_fk = %s",
                (customer.id,)
            )
            savings_book_row = cursor.fetchone()
            if not savings_book_row:
                return jsonify({"error": "No savings book found for this customer"}), 404
        finally:
            cursor.close()

        # Update share value
        result = CustomerShares.update_share_value(
            connector,
            share_id,
            new_value,
            stutengarten_id
        )

        return jsonify(result), 200

    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:  # pylint: disable=broad-except
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@customers_bp.route("/customer/transfer", methods=["POST"])
def transfer_between_customers():
    """
    customer transfer

    Expects JSON: 
    {
    "from": "K1",
    "to": "K2",
    "amount": 50,
    "purpose": "Überweisung"
    }
    """
    data = request.json or {}
    from_id = data.get("from")
    to_id = data.get("to")
    amount = data.get("amount")
    purpose = data.get("purpose", "")
    if not from_id or not to_id or amount is None:
        return jsonify({"error": "from, to and amount are required"}), 400
    try:
        amount = int(amount)
    except Exception: # pylint: disable=broad-except
        return jsonify({"error": "amount must be an integer"}), 400
    if amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400
    connector = current_app.config["DB_CONNECTOR"]
    try:
        result = CustomerTransaction.transfer(connector, from_id, to_id, amount, purpose)
        return jsonify(result), 201
    except (CustomException, CustomerException, CustomerTransactionException) as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e: # pylint: disable=broad-except
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
#End-of-file
