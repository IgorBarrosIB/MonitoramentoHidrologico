#!/usr/bin/env bash
# Recria o container PostgreSQL de desenvolvimento do Monitoramento Hidrológico.
# A cada execução o container anterior é removido e um novo é criado do zero.
set -euo pipefail

CONTAINER="${PG_CONTAINER:-monitoramento-postgres}"
IMAGE="${PG_IMAGE:-postgres:17.11-trixie}"
PORT="${PG_PORT:-5433}"
DB="${PG_DB:-monitoramento}"
USER="${PG_USER:-monitoramento}"
PASSWORD="${PG_PASSWORD:-monitoramento}"

if ! docker info >/dev/null 2>&1; then
  echo "Erro: o Docker não está rodando ou não está acessível." >&2
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Removendo o container anterior '$CONTAINER'..."
  docker rm -f -v "$CONTAINER" >/dev/null
fi

echo "Subindo um novo container '$CONTAINER' ($IMAGE) na porta $PORT..."
docker run -d \
  --name "$CONTAINER" \
  -e POSTGRES_DB="$DB" \
  -e POSTGRES_USER="$USER" \
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -p "127.0.0.1:$PORT:5432" \
  "$IMAGE" >/dev/null

echo -n "Aguardando o PostgreSQL aceitar conexões"
for _ in $(seq 1 30); do
  if docker exec "$CONTAINER" pg_isready -U "$USER" -d "$DB" -h 127.0.0.1 >/dev/null 2>&1; then
    echo " pronto."
    echo
    echo "Host:    127.0.0.1"
    echo "Porta:   $PORT"
    echo "Banco:   $DB"
    echo "Usuário: $USER"
    echo "Senha:   $PASSWORD"
    echo "URL:     postgresql://$USER:$PASSWORD@127.0.0.1:$PORT/$DB"
    exit 0
  fi
  echo -n "."
  sleep 1
done

echo
echo "Erro: o PostgreSQL não ficou pronto em 30 segundos. Logs:" >&2
docker logs --tail 30 "$CONTAINER" >&2
exit 1
