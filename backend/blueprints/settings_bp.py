from flask import Blueprint, request, jsonify
from pathlib import Path
from threading import Lock
import json

settings_bp = Blueprint('settings', __name__)

# Settings file will be stored in the root of the backend folder
SETTINGS_FILE = Path(__file__).parent.parent / 'settings.json'
_lock = Lock()

DEFAULTS = {
    'hackerAktiv':      False,
    'hackerIntervall':  60,      # Minuten
    'hackerAutoStart':  False,
    'spieleAktiv':      True,
    'spieleAutoStart':  True,
}

def load_settings():
    if not SETTINGS_FILE.exists():
        return dict(DEFAULTS)
    try:
        with SETTINGS_FILE.open('r', encoding='utf-8') as f:
            return {**DEFAULTS, **json.load(f)}
    except (OSError, json.JSONDecodeError):
        return dict(DEFAULTS)

def save_settings(data):
    with SETTINGS_FILE.open('w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@settings_bp.route('/settings', methods=["GET"])
def get_settings():
    """
    Retrieve all settings
    """
    with _lock:
        return jsonify(load_settings()), 200


@settings_bp.route('/settings', methods=["PATCH"])
def patch_settings():
    """
    Update existing settings
    """
    payload = request.get_json(silent=True) or {}
    if not payload:
        return jsonify({"error": "No data provided"}), 400

    with _lock:
        current = load_settings()
        # nur erlaubte Keys uebernehmen, Unbekanntes ignorieren
        for key in DEFAULTS:
            if key in payload:
                current[key] = payload[key]
        save_settings(current)
        return jsonify(current), 200
