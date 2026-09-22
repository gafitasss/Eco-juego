import sqlite3
import threading
from pathlib import Path


DB_PATH = Path("eco.db")

_lock = threading.Lock()


def connection():
    conn = sqlite3.connect(
        DB_PATH,
        check_same_thread=False
    )

    conn.row_factory = sqlite3.Row

    return conn


def init_db():

    with _lock:

        conn = connection()

        conn.execute("""
        CREATE TABLE IF NOT EXISTS players (
            user_id INTEGER PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            points INTEGER DEFAULT 0,
            rounds INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT DEFAULT 'waiting',
            round INTEGER DEFAULT 1,
            energy INTEGER DEFAULT 64,
            trust INTEGER DEFAULT 52,
            chaos INTEGER DEFAULT 31,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS choices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER NOT NULL,
            round INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            choice INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(game_id, round, user_id)
        )
        """)

        conn.commit()
        conn.close()


def register_player(
    user_id,
    username,
    first_name
):

    with _lock:

        conn = connection()

        conn.execute("""
        INSERT INTO players
        (user_id, username, first_name)
        VALUES (?, ?, ?)

        ON CONFLICT(user_id)
        DO UPDATE SET
            username=excluded.username,
            first_name=excluded.first_name
        """, (
            user_id,
            username,
            first_name
        ))

        conn.commit()
        conn.close()


def get_player(user_id):

    conn = connection()

    player = conn.execute("""
        SELECT *
        FROM players
        WHERE user_id=?
    """, (user_id,)).fetchone()

    conn.close()

    return player


def create_game():

    with _lock:

        conn = connection()

        cursor = conn.execute("""
        INSERT INTO games
        (status, round, energy, trust, chaos)
        VALUES ('active', 1, 64, 52, 31)
        """)

        game_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return game_id


def get_game(game_id):

    conn = connection()

    game = conn.execute("""
        SELECT *
        FROM games
        WHERE id=?
    """, (game_id,)).fetchone()

    conn.close()

    return game


def save_choice(
    game_id,
    round_number,
    user_id,
    choice
):

    with _lock:

        conn = connection()

        conn.execute("""
        INSERT OR REPLACE INTO choices
        (game_id, round, user_id, choice)
        VALUES (?, ?, ?, ?)
        """, (
            game_id,
            round_number,
            user_id,
            choice
        ))

        conn.commit()
        conn.close()


def count_choices(
    game_id,
    round_number
):

    conn = connection()

    rows = conn.execute("""
        SELECT
            choice,
            COUNT(*) AS total
        FROM choices
        WHERE game_id=?
        AND round=?
        GROUP BY choice
        ORDER BY choice
    """, (
        game_id,
        round_number
    )).fetchall()

    conn.close()

    return {
        row["choice"]: row["total"]
        for row in rows
      }
