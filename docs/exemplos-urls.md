# Exemplos de URLs por função

Exemplos prontos de chamada para cada função da API, com `curl`. A descrição completa das rotas está em [api-documentacao.md](api-documentacao.md), e as regras de acesso em [regra-acesso.md](regra-acesso.md).

Endereço base local: `http://127.0.0.1:8000`. Os exemplos usam os dados populados pelo `BancoDeDados.py` (estações `EST-01` e `EST-02`, observação `1`).

## Token

Token do usuário `igorbarrosib` no banco local:

```
ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e
```

Ele é enviado no cabeçalho `Authorization` nas rotas de escrita (`POST`, `PUT`, `PATCH`, `DELETE`). As rotas `GET` não precisam dele.

> O token tem 40 caracteres. Se faltar algum, a API responde `401` com `{"detail": "Invalid token."}`.

Para gerar ou recuperar o token a partir do usuário e senha:

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -d "username=igorbarrosib" -d "password=SUA_SENHA"
```

Para ler o token direto do banco:

```bash
python3 -c "import sqlite3;print(sqlite3.connect('db.sqlite3').execute('select key from authtoken_token').fetchone()[0])"
```

## Estações (`StationViewSet`)

O `{id}` da estação é o código textual, ex.: `EST-01`.

### `list` — listar estações

```bash
curl http://127.0.0.1:8000/api/stations/
```

Filtros aceitos: `name`, `river`, `municipality` (valor exato).

```bash
curl "http://127.0.0.1:8000/api/stations/?municipality=Vale%20Verde"
curl "http://127.0.0.1:8000/api/stations/?river=Rio%20Aurora"
curl "http://127.0.0.1:8000/api/stations/?name=Esta%C3%A7%C3%A3o%20Aurora"
```

### `retrieve` — detalhar uma estação

```bash
curl http://127.0.0.1:8000/api/stations/EST-01/
```

### `create` — criar estação

```bash
curl -X POST http://127.0.0.1:8000/api/stations/ \
  -H "Authorization: Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e" \
  -H "Content-Type: application/json" \
  -d '{"id":"EST-99","name":"Estação Teste","river":"Rio Teste","municipality":"Cidade Teste"}'
```

### `update` — substituir estação (todos os campos)

```bash
curl -X PUT http://127.0.0.1:8000/api/stations/EST-99/ \
  -H "Authorization: Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e" \
  -H "Content-Type: application/json" \
  -d '{"id":"EST-99","name":"Estação Teste 2","river":"Rio Teste","municipality":"Cidade Teste"}'
```

### `partial_update` — alterar só alguns campos

```bash
curl -X PATCH http://127.0.0.1:8000/api/stations/EST-99/ \
  -H "Authorization: Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e" \
  -H "Content-Type: application/json" \
  -d '{"name":"Estação Teste Renomeada"}'
```

### `destroy` — remover estação

Remove também todas as observações da estação (`on_delete=CASCADE`).

```bash
curl -X DELETE http://127.0.0.1:8000/api/stations/EST-99/ \
  -H "Authorization: Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e"
```

### `summary` — última leitura de nível e chuva

```bash
curl http://127.0.0.1:8000/api/stations/EST-01/summary/
```

### `series` — histórico de uma métrica

| Parâmetro | Valores | Padrão |
|---|---|---|
| `metric` | `level` ou `rain` | `level` |
| `hours` | número inteiro | `24` |

```bash
curl http://127.0.0.1:8000/api/stations/EST-01/series/
curl "http://127.0.0.1:8000/api/stations/EST-01/series/?metric=level&hours=48"
curl "http://127.0.0.1:8000/api/stations/EST-02/series/?metric=rain&hours=6"
```

`hours` não numérico retorna `400`. Estação sem leituras na métrica retorna `points: []`.

## Observações (`ObservationViewSet`)

O `{id}` da observação é numérico, ex.: `1`.

### `list` — listar observações

```bash
curl http://127.0.0.1:8000/api/observations/
```

Filtros aceitos: `station_id`, `metric`, `observed_at`, `value`, `unit` (valor exato).

```bash
curl "http://127.0.0.1:8000/api/observations/?station_id=EST-01"
curl "http://127.0.0.1:8000/api/observations/?station_id=EST-01&metric=level"
curl "http://127.0.0.1:8000/api/observations/?metric=rain&unit=mm/h"
curl "http://127.0.0.1:8000/api/observations/?observed_at=2026-11-21T13:00:00.000Z"
```

### `retrieve` — detalhar uma observação

```bash
curl http://127.0.0.1:8000/api/observations/1/
```

### `create` — criar observação

A combinação `station` + `metric` + `observed_at` não pode se repetir; se repetir, retorna `400`.

```bash
curl -X POST http://127.0.0.1:8000/api/observations/ \
  -H "Authorization: Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e" \
  -H "Content-Type: application/json" \
  -d '{"station":"EST-01","metric":"level","observed_at":"2026-11-24T10:00:00.000Z","value":1.20,"unit":"m","source":"manual"}'
```

### `update` — substituir observação (todos os campos)

```bash
curl -X PUT http://127.0.0.1:8000/api/observations/1/ \
  -H "Authorization: Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e" \
  -H "Content-Type: application/json" \
  -d '{"station":"EST-01","metric":"level","observed_at":"2026-11-21T13:00:00.000Z","value":1.10,"unit":"m","source":"manual"}'
```

### `partial_update` — alterar só alguns campos

```bash
curl -X PATCH http://127.0.0.1:8000/api/observations/1/ \
  -H "Authorization: Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e" \
  -H "Content-Type: application/json" \
  -d '{"value":1.10}'
```

### `destroy` — remover observação

```bash
curl -X DELETE http://127.0.0.1:8000/api/observations/1/ \
  -H "Authorization: Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e"
```

## Documentação e admin

| URL | O que é |
|---|---|
| `http://127.0.0.1:8000/api/` | Raiz da API, com links para `stations` e `observations` |
| `http://127.0.0.1:8000/api/docs/` | Swagger UI — em **Authorize**, informe `Token ea1bc81a9ff3cf2d4ddf214aec99751e80a8885e` |
| `http://127.0.0.1:8000/api/redoc/` | Documentação em ReDoc |
| `http://127.0.0.1:8000/api/schema/` | Schema OpenAPI 3 (YAML) |
| `http://127.0.0.1:8000/admin/` | Painel administrativo do Django |
