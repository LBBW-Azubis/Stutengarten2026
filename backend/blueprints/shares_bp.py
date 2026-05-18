"""
    Blueprint for managing shares (aktien).
"""

from flask import Blueprint, jsonify, request, current_app
from share import Share, ShareException

shares_bp = Blueprint("shares", __name__)

@shares_bp.route("/share", methods=["POST"])
def create_share():
    """
    Create a new share.
    Expected JSON body:
    {
        "name": "Share Name",
        "symbol": "SHR",
        "description": "Share description text"
    }
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name")
    symbol = data.get("symbol")
    description = data.get("description", "")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    connector = current_app.config["DB_CONNECTOR"]
    try:
        share = Share(
            connector,
            name=name,
            symbol=symbol,
            description=description
        )
        return jsonify(share.to_dict()), 201
    except ShareException as err:
        return jsonify({"error": str(err)}), 400
    except Exception as err:
        return jsonify({"error": "Internal server error", "details": str(err)}), 500

@shares_bp.route("/share/<string:share_name>", methods=["GET"])
def get_share(share_name):
    """
    Retrieve a share by its name.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        share = Share.get_by_name(connector, share_name)
        return jsonify(share.to_dict()), 200
    except ShareException as err:
        return jsonify({"error": str(err)}), 404
    except Exception as err:
        return jsonify({"error": "Internal server error", "details": str(err)}), 500

@shares_bp.route("/shares", methods=["GET"])
def get_all_shares():
    """
    Retrieve all shares.
    """
    connector = current_app.config["DB_CONNECTOR"]
    try:
        shares = Share.get_all_available_shares(connector)
        return jsonify([share.to_dict() for share in shares]), 200
    except Exception as err:
        return jsonify({"error": "Internal server error", "details": str(err)}), 500

#End-of-file
