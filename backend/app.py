"""
    import of configparser neccessary for connection to server
"""

import configparser
import logging
from flask import Flask
from flask_cors import CORS
from waitress import serve # Production WSGI Server

from blueprints.health_bp import health_bp  # pylint: disable=import-error
from blueprints.imports_bp import imports_bp  # pylint: disable=import-error
from blueprints.customers_bp import customers_bp  # pylint: disable=import-error
from blueprints.companies_bp import companies_bp  # pylint: disable=import-error
from db_connector import DbConnector

# Prod Server
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('waitress')

app = Flask(__name__)
CORS(app)

import os

config = configparser.ConfigParser()
config_file_path = os.path.join(os.path.dirname(__file__), "server.config")
config.read(config_file_path)

#Fallback if config file is missing or incomplete
server_config = config["server"] if "server" in config else {}
ip = server_config.get("IPAddress", "127.0.0.1")
if ip == "localhost":
    ip = "127.0.0.1"

port = int(config["server"]["port"])
db = config["server"]["database"]
user = config["server"]["user"]
password = config["server"]["password"]

connector = DbConnector()
connector.connect(ip, user, password, db, port)
app.config["DB_CONNECTOR"] = connector

app.register_blueprint(health_bp)
app.register_blueprint(imports_bp)
app.register_blueprint(customers_bp)
app.register_blueprint(companies_bp)

# Development server (debug=True) - nicht für Produktion geeignet
#if __name__ == "__main__":
#    try:
#        app.run(host="0.0.0.0", port=5000)
#    finally:
#        connector = app.config.get("DB_CONNECTOR")
#        if connector:
#            connector.close()
#            print("Database connection closed")

# Production server mit Waitress (WSGI) - empfohlen für Produktion
if __name__ == "__main__":
    try:
        print("Starting Waitress server on Port 5000...")
        print(f"Databse: {ip}:{port} (DB: {db}, User: {user})")
        serve(app, host="0.0.0.0", port=5000, threads=6)
    except (OSError, ValueError) as e:
        print(f"Error starting server: {e}")
    finally:
        connector = app.config.get("DB_CONNECTOR")
        if connector:
            connector.close()
            print("Database connection closed")
#End-of-file
