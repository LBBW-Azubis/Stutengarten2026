"""
    Health checks for DB and app
"""
import time
import logging
from flask import Blueprint, jsonify, current_app, request

health_bp = Blueprint("health", __name__)
log = logging.getLogger(__name__)

# wert in Millisekunden ab dem eine Warnung geloggt wird
WARN_WAIT_MS = 200

def _run_select_1(conn):
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1")
        cur.fetchone()
    finally:
        cur.close()

@health_bp.route("/ping", methods=["GET"])
def ping():
    """
    Sehr schneller Ping-Endpunkt ohne DB-Zugriff
    """
    return jsonify({"ok": True}), 200


@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    - misst Wartezeit beim Ausleihen der Verbindung
    - führt SELECT 1 aus
    """
    connector = current_app.config["DB_CONNECTOR"]
    conn = None
    waited_ms = None
    try:
        t0 = time.perf_counter()
        conn = connector.get_connection()
        waited_ms = int((time.perf_counter() - t0) * 1000)
        if waited_ms >= WARN_WAIT_MS:
            log.warning("Health: waited %d ms for DB connection (threshold=%d ms)", waited_ms, WARN_WAIT_MS)

        _run_select_1(conn)

        resp = jsonify({
            "status": "healthy",
            "database": "connected",
            "wait_ms": waited_ms,
            "warn_threshold_ms": WARN_WAIT_MS
        })
        # Health-Antwort nicht cachen
        resp.headers["Cache-Control"] = "no-store"
        return resp, 200
    except Exception as exc:  # pylint: disable=broad-except
        return jsonify({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(exc),
            "wait_ms": waited_ms,
            "warn_threshold_ms": WARN_WAIT_MS
        }), 503
    finally:
        if conn:
            conn.close()

@health_bp.route("/health/pool", methods=["GET"])
def health_pool():
    """
    Testet das Ausleihen mehrerer Verbindungen nacheinander
    Optionaler Query-Parameter n (Default 5)
    Beispiel: GET /health/pool?n=5
    Gibt zusätzlich min/avg/max der Wartezeiten zurück!!!
    """
    n_param = request.args.get("n", default="5")
    try:
        n = max(1, min(500, int(n_param)))
    except Exception:  # pylint: disable=broad-except
        n = 5

    connector = current_app.config["DB_CONNECTOR"]
    ok = 0
    errors = []
    waits = []

    for i in range(n):
        conn = None
        try:
            t0 = time.perf_counter()
            conn = connector.get_connection()
            waited_ms = int((time.perf_counter() - t0) * 1000)
            waits.append(waited_ms)
            if waited_ms >= WARN_WAIT_MS:
                log.warning("Health/pool: waited %d ms for probe %d (threshold=%d ms)", waited_ms, i, WARN_WAIT_MS)

            _run_select_1(conn)
            ok += 1
        except Exception as exc:  # pylint: disable=broad-except
            errors.append(f"probe_{i}: {exc}")
        finally:
            if conn:
                conn.close()

    status = "healthy" if ok == n and not errors else ("degraded" if ok > 0 else "unhealthy")
    code = 200 if status == "healthy" else (206 if status == "degraded" else 503)

    waits_info = {
        "samples": waits,
        "min_ms": min(waits) if waits else None,
        "max_ms": max(waits) if waits else None,
        "avg_ms": int(sum(waits) / len(waits)) if waits else None,
        "warn_threshold_ms": WARN_WAIT_MS
    }

    resp = jsonify({
        "status": status,
        "requested": n,
        "successful": ok,
        "waits": waits_info,
        "errors": errors
    })
    resp.headers["Cache-Control"] = "no-store"
    return resp, code