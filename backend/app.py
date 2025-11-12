"""
    import of configparser neccessary for connection to server
"""

import configparser
from flask import Flask

from blueprints.health_bp import health_bp  # pylint: disable=import-error
from blueprints.imports_bp import imports_bp  # pylint: disable=import-error
from blueprints.customers_bp import customers_bp  # pylint: disable=import-error
from blueprints.companies_bp import companies_bp  # pylint: disable=import-error
from db_connector import DbConnector
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

config = configparser.ConfigParser()
config.read("server.config")

ip = config["server"]["IPAddress"]
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

if __name__ == "__main__":
    try:
        app.run(host="127.0.0.1", port=5000)
    finally:
        connector = app.config.get("DB_CONNECTOR")
        if connector:
            connector.close()
            print("Database connection closed")
#End-of-file
