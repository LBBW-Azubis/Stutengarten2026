"""
    import blueprints for health check
    jsonify for answer on api response
    current_app for current connection
"""
from flask import Blueprint, jsonify, current_app

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint to verify database connection
    """
    try:
        connector = current_app.config["DB_CONNECTOR"]
        connection = connector.get_connection()
        if connection and connection.is_connected():
            return jsonify({"status": "healthy", "database": "connected"}), 200
        else:
            return jsonify({"status": "unhealthy", "database": "disconnected"}), 500
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({"status": "error", "message": str(exc)}), 500
#End-of-file
