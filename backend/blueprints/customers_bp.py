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
from share import Share, ShareException

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
        if not customer_savings_book:
            return jsonify({"error": "No savings book found for this customer"}), 404

        # Get savings book ID from database
        conn = connector.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            # KORREKTUR: Verwende stutengarten_id (den Parameter der Route) für die Abfrage
            cursor.execute(
                "SELECT id FROM kundensparbuecher WHERE kunden_fk = %s",
                (stutengarten_id,),
            )
            savings_book_row = cursor.fetchone()
            if not savings_book_row:
                return jsonify({"error": "No savings book found for this customer"}), 404
            savings_book_id = savings_book_row["id"]
        finally:
            cursor.close()
            conn.close()

        # Create transaction
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

@customers_bp.route("/shares/available", methods=["GET"])
def get_available_shares():
    """
    Shows all available shares (without fixed price)
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        shares = Share.get_all_available_shares(connector)
        return jsonify([share.to_dict() for share in shares]), 200
    except Exception as e: #pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500


@customers_bp.route("/shares/name/<string:share_name>", methods=["GET"])
def get_share_by_name(share_name):
    """
    Search for a share by name
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        share = Share.get_by_name(connector, share_name)
        return jsonify(share.to_dict()), 200
    except ShareException as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e: #pylint: disable=broad-except
        return jsonify({"error": str(e)}), 500

@customers_bp.route("/customer/<string:stutengarten_id>/shares/buy", methods=["POST"])
def buy_customer_share_new(stutengarten_id):
    """
    Buy shares for a customer with FREE investment amount
    """
    connector = current_app.config["DB_CONNECTOR"]
    data = request.json
    if not data or "share_id" not in data or "amount" not in data:
        return jsonify({"error": "share_id and amount are required"}), 400

    share_id, amount = data.get("share_id"), data.get("amount")
    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount"}), 400

    try:
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)
        customer_savings_book = customer.get_savings_book()

        purchase = CustomerShares(
            db=connector,
            share_id=share_id,
            customer_stutengarten_id=stutengarten_id,
            invested_amount=amount,
            customer_savings_book=customer_savings_book
        )
        share = Share.get_by_id(connector, share_id)
        return jsonify({
            "status": "success", "message": f"{amount} Stuggis invested in {share.name}!",
            "purchase_id": purchase.id, "share_name": share.name, "symbol": share.symbol,
            "invested_amount": amount, "current_value": amount,
            "new_balance": customer_savings_book.balance
        }), 201
    except (CustomerException, ShareException, CustomException) as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e: #pylint: disable=broad-except
        return jsonify({"error": f"Error: {str(e)}"}), 500


@customers_bp.route("/customer/<string:stutengarten_id>/shares", methods=["GET"])
def get_customer_shares_new(stutengarten_id):
    """
    Shows all shares of a customer with profit/loss
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        Customer.get_by_stutengarten_id(connector, stutengarten_id)
        shares = CustomerShares.get_all_customer_shares(connector, stutengarten_id)
        return jsonify([share.to_dict() for share in shares]), 200
    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e: #pylint: disable=broad-except
        return jsonify({"error": f"Error: {str(e)}"}), 500


@customers_bp.route("/customer/<string:stutengarten_id>/shares/<int:share_id>", methods=["PATCH"])
def update_share_value_new(stutengarten_id, share_id):
    """
    MANUAL: Updates share value after physical wheel of fortune
    """
    connector = current_app.config["DB_CONNECTOR"]
    data = request.json
    if not data or "new_value" not in data:
        return jsonify({"error": "new_value is required"}), 400

    try:
        new_value = float(data["new_value"])
        result = CustomerShares.update_share_value(connector, share_id, new_value, stutengarten_id)
        return jsonify({"status": "success", "message": "Share value updated", **result}), 200
    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except ValueError:
        return jsonify({"error": "Invalid value"}), 400
    except Exception as e: #pylint: disable=broad-except
        return jsonify({"error": f"Error: {str(e)}"}), 500


@customers_bp.route("/customer/<string:stutengarten_id>/shares/<int:share_id>", methods=["DELETE"])
def sell_customer_share_new(stutengarten_id, share_id):
    """
    Sells share at current value
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        customer = Customer.get_by_stutengarten_id(connector, stutengarten_id)
        customer_savings_book = customer.get_savings_book()

        all_shares = CustomerShares.get_all_customer_shares(connector, stutengarten_id)
        share_to_sell = None

        for share in all_shares:
            if share.id == share_id:
                share_to_sell = share
                break

        if not share_to_sell:
            return jsonify({"error": "Share not found"}), 404

        result = share_to_sell.sell(customer_savings_book)
        return jsonify(result), 200
    except (CustomException, CustomerException) as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e: #pylint: disable=broad-except
        return jsonify({"error": f"Error: {str(e)}"}), 500

#End-of-file
