"""DbConnector MariaDB Connection-Pool"""
import logging
import time
from mysql.connector import pooling, Error, errors

log = logging.getLogger(__name__)

#-----------------------------------------------------------------------------------------------------
# Feste Defaults (hier anpassen, wenn ihr andere Werte braucht)
POOL_NAME = "stutengarten_pool"
POOL_SIZE = 5               # Anzahl Verbindungen im Pool (pro App-Instanz)
CONNECTION_TIMEOUT = 5       # Sekunden für Verbindungsaufbau (nicht Pool-Wartezeit)
AUTOCOMMIT = False
CHARSET = "utf8mb4"

# Ausleihen aus dem Pool: feste Warte-/Logging-Parameter
GET_CONN_MAX_WAIT_S = 2.0   # max. Wartezeit auf eine freie Verbindung; None = kein Retry
WARN_THRESHOLD_S = 0.3       # ab dieser Wartezeit wird gewarnt (Logging)
RETRY_SLEEP_S = 0.05         # Pause zwischen Retries, falls Pool voll
#-----------------------------------------------------------------------------------------------------

class AcquireTimeout(RuntimeError):
    """Wird geworfen, wenn zu lange auf eine DB-Verbindung gewartet wurde"""

class DbConnector:
    """Verbindet die Anwendung via Connection-Pool mit der Datenbank"""

    def __init__(self):
        self.pool = None
        log.info("DbConnector-Instance created")

    def connect(
        self,
        host: str,
        user: str,
        password: str,
        database: str,
        port: int = 3306,
    ):
        """Initialisiert den Connection-Pool. Einmalig beim App-Start aufrufen"""
        try:
            self.pool = pooling.MySQLConnectionPool(
                pool_name=POOL_NAME,
                pool_size=POOL_SIZE,
                pool_reset_session=True,
                host=host,
                user=user,
                password=password,
                database=database,
                port=port,
                connection_timeout=CONNECTION_TIMEOUT,
                autocommit=AUTOCOMMIT,
                charset=CHARSET,
            )
            log.info("DB pool '%s' initialized (size=%s)", POOL_NAME, POOL_SIZE)
        except Error as e:
            log.exception("Error creating connection pool")
            raise

    def get_connection(self):
        """
        Leiht eine Verbindung aus dem Pool mit fester Maximal-Wartezeit und Pre-Ping
        """
        if not self.pool:
            raise RuntimeError("Database pool is not initialized. Call connect() first.")

        t0 = time.perf_counter()
        deadline = (t0 + GET_CONN_MAX_WAIT_S) if GET_CONN_MAX_WAIT_S is not None else None

        while True:
            try:
                conn = self.pool.get_connection()
                # Pre-Ping vermeidet 'MySQL server has gone away' bei Idle-Verbindungen
                try:
                    conn.ping(reconnect=True, attempts=1, delay=0)
                except Exception:
                    conn.close()
                    conn = self.pool.get_connection()
                    conn.ping(reconnect=True, attempts=1, delay=0)

                waited = time.perf_counter() - t0
                if waited >= WARN_THRESHOLD_S:
                    log.warning("Waited %.0f ms for DB connection (pool_size=%d)", waited * 1000, POOL_SIZE)
                try:
                    setattr(conn, "_wait_time_s", waited)
                except Exception:
                    pass
                return conn

            except errors.PoolError as e:
                if deadline is None or time.perf_counter() >= deadline:
                    raise AcquireTimeout(f"DB busy: waited too long for connection ({GET_CONN_MAX_WAIT_S}s)") from e
                time.sleep(RETRY_SLEEP_S)

    def close(self):
        """
        Closes the connection pool. Called once on app shutdown.
        """
        # Diese Methode existiert für mysql.connector.pooling nicht direkt.
        # Den Pool auf None zu setzen oder 'del self.pool' zu verwenden,
        # signalisiert Python, die Ressourcen freizugeben.
        if self.pool:
            log.info("Closing DB pool '%s'", POOL_NAME)
            # Der Pool selbst hat keine 'closeall()'-Methode.
            # Das Löschen der Referenz ist der vorgesehene Weg.
            self.pool = None
        log.info("DbConnector closed.")
# End of file
