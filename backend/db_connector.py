"""MySQL connector with connection pooling for ~5 concurrent users + Wartezeit-Handling"""
import time
import logging
from mysql.connector import pooling, Error, errors

log = logging.getLogger(__name__)

class AcquireTimeout(RuntimeError):
    """wait time to long"""

class DbConnector:
    """Class for connecting to the database using a connection pool."""

    def __init__(self):
        self.pool = None

    def connect(
        self,
        host: str,
        user: str,
        password: str,
        database: str,
        port: int = 3306,
        *,
        pool_name: str = "stutengarten_pool",
        pool_size: int = 5,
        connection_timeout: int = 5,
        autocommit: bool = False,
        charset: str = "utf8mb4",
    ):
        """Initialize a connection pool (call once at app startup)."""
        self.pool = pooling.MySQLConnectionPool(
            pool_name=pool_name,
            pool_size=pool_size,
            pool_reset_session=True,
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            connection_timeout=connection_timeout,
            autocommit=autocommit,
            charset=charset,
        )
        log.info("Connection pool '%s' initialized (size=%s)", pool_name, pool_size)

    def get_connection(
        self,
        *,
        max_wait_s: float | None = None,
        warn_threshold_s: float = 0.5,
        retry_sleep_s: float = 0.05,
    ):
        """
        Leiht eine Verbindung aus dem Pool.
        - max_wait_s: maximale Wartezeit auf eine freie Verbindung (None = sofort/ohne Retry)
        - warn_threshold_s: ab welcher Wartezeit ein Warning geloggt wird
        - retry_sleep_s: Pause zwischen erneuten Versuchen (nur bei max_wait_s gesetzt)
        """
        if not self.pool:
            raise RuntimeError("Database pool is not initialized. Call connect() first.")

        t0 = time.perf_counter()
        deadline = (t0 + max_wait_s) if max_wait_s is not None else None

        while True:
            try:
                conn = self.pool.get_connection()
                # Pre-ping to avoid 'gone away'
                try:
                    conn.ping(reconnect=True, attempts=1, delay=0)
                except Exception:
                    conn.close()
                    conn = self.pool.get_connection()
                    conn.ping(reconnect=True, attempts=1, delay=0)
                # Wartezeit messen
                waited = time.perf_counter() - t0
                if waited >= warn_threshold_s:
                    log.warning("Waited %.0f ms for DB connection", waited * 1000)
                # Zusatzinfo am Objekt (optional für Response/Logging)
                try:
                    setattr(conn, "_wait_time_s", waited)
                except Exception:
                    pass
                return conn
            except errors.PoolError as e:
                # Pool erschöpft: optional retry bis deadline
                if deadline is None or time.perf_counter() >= deadline:
                    raise AcquireTimeout(f"DB busy: waited too long for connection ({max_wait_s}s)") from e
                time.sleep(retry_sleep_s)

    def close(self):
        self.pool = None