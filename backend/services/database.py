import os
import sqlite3
import threading
from typing import List, Optional
from .log import logger
from .config import DB_DIR

DB_PATH = os.path.join(DB_DIR, "app.db")
_lock = threading.Lock()
_conn: Optional[sqlite3.Connection] = None

_SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    uuid TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    permission INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'remote',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    json_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS draw_logs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    workflow_id TEXT,
    prompt TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result_image_url TEXT,
    error_reason TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    time_taken_ms INTEGER
);

-- Note: In a real system you'd also want to track auth types for nodes if adding authentication
-- ALTER TABLE nodes ADD COLUMN auth_type TEXT DEFAULT 'none';
-- ALTER TABLE nodes ADD COLUMN auth_credentials TEXT;
"""


def _get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(
            DB_PATH,
            timeout=30,
            check_same_thread=False,
            isolation_level=None,
        )
        _conn.execute("PRAGMA journal_mode=WAL")
        _conn.execute("PRAGMA foreign_keys=ON")
        _conn.execute("PRAGMA busy_timeout=10000")
        _conn.row_factory = sqlite3.Row
    return _conn


def init_db():
    with _lock:
        conn = _get_conn()
        conn.executescript(_SCHEMA)
    logger.info(f"SQLite 数据库已就绪: {DB_PATH}")


def execute(query: str, params: tuple = ()) -> int:
    with _lock:
        cursor = _get_conn().execute(query, params)
        return cursor.rowcount


def fetchone(query: str, params: tuple = ()) -> Optional[sqlite3.Row]:
    with _lock:
        cursor = _get_conn().execute(query, params)
        return cursor.fetchone()


def fetchall(query: str, params: tuple = ()) -> List[sqlite3.Row]:
    with _lock:
        cursor = _get_conn().execute(query, params)
        return cursor.fetchall()
