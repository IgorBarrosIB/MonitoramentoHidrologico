---
name: popular-banco
description: Use when the user asks to populate, seed or load sample data into the Monitoramento Hidrológico database ("popular o banco", "carregar dados de exemplo", "rodar o BancoDeDados.py"), or after the database was recreated by subir-postgres.
---

# Popular o banco com dados simulados

## Visão geral

Roda o `BancoDeDados.py`, que cria as tabelas `stations` e `observations` no Postgres (se não existirem) e insere uma amostra simulada: 3 estações e 73 leituras horárias (as últimas 72 horas) de nível (`level`, em m) e chuva (`rain`, em mm/h), totalizando 438 observações.

É seguro rodar várias vezes: registros que já existem são ignorados (`ON CONFLICT DO NOTHING`), e só entram as horas novas desde a última execução.

## Como executar

Rode a partir da raiz do projeto:

```bash
bash .claude/skills/popular-banco/scripts/popular-banco.sh
```

O script usa as mesmas variáveis `PG_DB`, `PG_USER`, `PG_PASSWORD`, `PG_HOST` e `PG_PORT` da skill subir-postgres e do `settings.py`. Os padrões apontam para o container local na porta 5433.

Depois, informe ao usuário quantas observações o banco tem.

## Erros comuns

- **Não conecta ao banco**: o container do Postgres não está rodando. Use a skill subir-postgres e rode de novo.
- **`ModuleNotFoundError: No module named 'psycopg'`**: rode `pip install -r requirements.txt` com o `venv` ativo.
- **Dados sumiram**: a subir-postgres recria o banco do zero. Depois dela, rode esta skill de novo.
