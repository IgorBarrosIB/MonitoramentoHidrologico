"""Popula o banco com uma amostra simulada de estações e observações hidrológicas."""

import math
import os
from datetime import datetime, timezone

import psycopg

conninfo = psycopg.conninfo.make_conninfo(
    dbname=os.environ.get('PG_DB', 'monitoramento'),
    user=os.environ.get('PG_USER', 'monitoramento'),
    password=os.environ.get('PG_PASSWORD', 'monitoramento'),
    host=os.environ.get('PG_HOST', '127.0.0.1'),
    port=os.environ.get('PG_PORT', '5433'),
)

stations = [
    {'id': 'EST-01', 'name': 'Estação Aurora', 'river': 'Rio Aurora', 'municipality': 'Vila Aurora'},
    {'id': 'EST-02', 'name': 'Estação Vale Verde', 'river': 'Rio Verde', 'municipality': 'Vale Verde'},
    {'id': 'EST-03', 'name': 'Estação Campo Alto', 'river': 'Rio do Campo', 'municipality': 'Campo Alto'},
]

CREATE_TABLES = [
    """
    CREATE TABLE IF NOT EXISTS stations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        river TEXT NOT NULL,
        municipality TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS observations (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        station_id TEXT NOT NULL REFERENCES stations (id),
        metric TEXT NOT NULL,
        observed_at TEXT NOT NULL,
        value DOUBLE PRECISION NOT NULL,
        unit TEXT NOT NULL,
        source TEXT NOT NULL,
        UNIQUE (station_id, metric, observed_at)
    )
    """,
]

INSERT_STATION = (
    'INSERT INTO stations (id, name, river, municipality) '
    'VALUES (%(id)s, %(name)s, %(river)s, %(municipality)s) '
    'ON CONFLICT DO NOTHING'
)
INSERT_OBSERVATION = (
    'INSERT INTO observations (station_id, metric, observed_at, value, unit, source) '
    "VALUES (%(station_id)s, %(metric)s, %(observed_at)s, %(value)s, %(unit)s, 'synthetic') "
    'ON CONFLICT DO NOTHING'
)

HOUR_MS = 3600000


def to_iso(ms):
    """Formata um timestamp em milissegundos igual ao Date.toISOString() do JavaScript."""
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')


def seed(db):
    for station in stations:
        db.execute(INSERT_STATION, station)

    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    end_hour = now_ms // HOUR_MS * HOUR_MS
    for index in range(73):
        timestamp = to_iso(end_hour - (72 - index) * HOUR_MS)

        for station_index, station in enumerate(stations):
            level = 1.05 + station_index * 0.24 + 0.08 * math.sin(index / 5 + station_index)
            rain = (
                0.4 + ((index + station_index) % 4) * 0.35
                if (index + station_index * 7) % 17 < 3
                else 0
            )

            db.execute(INSERT_OBSERVATION, {
                'station_id': station['id'],
                'metric': 'level',
                'observed_at': timestamp,
                'value': round(level, 2),
                'unit': 'm',
            })
            db.execute(INSERT_OBSERVATION, {
                'station_id': station['id'],
                'metric': 'rain',
                'observed_at': timestamp,
                'value': round(rain, 2),
                'unit': 'mm/h',
            })


if __name__ == '__main__':
    with psycopg.connect(conninfo) as db:
        for statement in CREATE_TABLES:
            db.execute(statement)
        seed(db)
        count = db.execute('SELECT COUNT(*) AS count FROM observations').fetchone()[0]
        dbname = db.info.dbname
    print(f'Amostra simulada pronta em {dbname} ({count} observações).')
