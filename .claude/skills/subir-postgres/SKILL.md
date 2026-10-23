---
name: subir-postgres
description: Use when the user asks to start, restart, reset or recreate the PostgreSQL database of the Monitoramento Hidrológico project in Docker ("subir o banco", "subir postgres", "recriar o banco", "resetar o banco").
---

# Subir PostgreSQL no Docker

## Visão geral

Sobe o banco PostgreSQL de desenvolvimento em um container Docker. **Toda execução apaga o container anterior (junto com os dados) e cria um novo, limpo.**

## Como executar

Rode a partir da raiz do projeto:

```bash
bash .claude/skills/subir-postgres/scripts/subir-postgres.sh
```

Depois, repasse ao usuário os dados de conexão que o script imprime.

## Configuração (variáveis de ambiente opcionais)

| Variável      | Padrão                   |
|---------------|--------------------------|
| `PG_CONTAINER`| `monitoramento-postgres` |
| `PG_IMAGE`    | `postgres:17.11-trixie`  |
| `PG_PORT`     | `5433`                   |
| `PG_DB`       | `monitoramento`          |
| `PG_USER`     | `monitoramento`          |
| `PG_PASSWORD` | `monitoramento`          |

Exemplo: `PG_PORT=5440 bash .claude/skills/subir-postgres/scripts/subir-postgres.sh`

## Erros comuns

- **`port is already allocated`**: a porta está em uso por outro container ou serviço. Rode de novo com outra porta em `PG_PORT`.
- **`Docker não está rodando`**: inicie o Docker Desktop ou o serviço `docker` e tente de novo.
- **Dados sumiram**: é o comportamento esperado, porque o container é recriado do zero. Depois de subir, rode `python manage.py migrate` de novo.
