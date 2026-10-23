#!/usr/bin/env bash
# Popula o Postgres com a amostra simulada de estações e observações (BancoDeDados.py).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT"

if [ -x venv/bin/python ]; then
  PYTHON=venv/bin/python
elif [ -x .venv/bin/python ]; then
  PYTHON=.venv/bin/python
else
  echo "Erro: ambiente virtual não encontrado (venv/ ou .venv/). Crie com 'python3 -m venv venv' e instale o requirements.txt." >&2
  exit 1
fi

echo "Verificando a conexão com o banco..."
if ! "$PYTHON" manage.py shell -c "from django.db import connection; connection.ensure_connection()" >/dev/null 2>&1; then
  echo "Erro: não foi possível conectar ao banco. Se for o Postgres no Docker, suba-o com:" >&2
  echo "  bash .claude/skills/subir-postgres/scripts/subir-postgres.sh" >&2
  exit 1
fi

echo "Populando o banco..."
"$PYTHON" BancoDeDados.py
