# Documentação da API de Monitoramento Hidrológico

API REST em Django + Django REST Framework que guarda estações de monitoramento e as leituras delas: **nível do rio** (`level`, em metros) e **chuva** (`rain`, em mm/h).

Endereço base local: `http://127.0.0.1:8000`. Todas as rotas da API ficam sob `/api/`.

## Mapa de rotas

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/` | Raiz da API, com links para os recursos | Não |
| `GET` | `/api/stations/` | Lista as estações | Não |
| `POST` | `/api/stations/` | Cria uma estação | Sim |
| `GET` | `/api/stations/{id}/` | Detalha uma estação | Não |
| `PUT` | `/api/stations/{id}/` | Substitui uma estação | Sim |
| `PATCH` | `/api/stations/{id}/` | Atualiza campos de uma estação | Sim |
| `DELETE` | `/api/stations/{id}/` | Remove a estação e as observações dela | Sim |
| `GET` | `/api/stations/{id}/summary/` | Última leitura de nível e de chuva | Não |
| `GET` | `/api/stations/{id}/series/` | Histórico de uma métrica, em ordem cronológica | Não |
| `GET` | `/api/observations/` | Lista as observações | Não |
| `POST` | `/api/observations/` | Cria uma observação | Sim |
| `GET` | `/api/observations/{id}/` | Detalha uma observação | Não |
| `PUT` | `/api/observations/{id}/` | Substitui uma observação | Sim |
| `PATCH` | `/api/observations/{id}/` | Atualiza campos de uma observação | Sim |
| `DELETE` | `/api/observations/{id}/` | Remove uma observação | Sim |
| `POST` | `/api/token/` | Gera o token a partir de `username` e `password` | Não |
| `GET` | `/api/schema/` | Schema OpenAPI 3 (YAML) | Não |
| `GET` | `/api/docs/` | Documentação interativa (Swagger UI) | Não |
| `GET` | `/api/redoc/` | Documentação em ReDoc | Não |
| — | `/admin/` | Painel administrativo do Django | Login de staff |

O `{id}` de estação é o código textual (ex.: `EST-01`). O `{id}` de observação é numérico (ex.: `42`).

## Início rápido

Com o ambiente instalado (veja o [README principal](../README.md)):

```bash
python manage.py makemigrations monitoramento   # as migrations não são versionadas
python manage.py migrate
python BancoDeDados.py                          # popula 3 estações e 72 h de leituras
python manage.py runserver
```

Consultas de exemplo:

```bash
# Estações
curl http://127.0.0.1:8000/api/stations/

# Situação atual da EST-01
curl http://127.0.0.1:8000/api/stations/EST-01/summary/

# Chuva das últimas 12 horas na EST-02
curl "http://127.0.0.1:8000/api/stations/EST-02/series/?metric=rain&hours=12"
```

## Formato das respostas

- Todas as respostas são JSON (`application/json`). No navegador, o DRF mostra a versão navegável em HTML.
- As listagens **não têm paginação**: devolvem um array com todos os registros que passam pelos filtros.
- Datas são texto ISO 8601 em UTC, no formato `AAAA-MM-DDTHH:MM:SS.000Z` (ex.: `2026-11-17T10:00:00.000Z`).