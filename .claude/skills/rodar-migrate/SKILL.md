---
name: rodar-migrate
description: Use when the user asks to run or apply Django migrations in the Monitoramento Hidrológico project ("rodar o migrate", "aplicar migrations", "criar as tabelas"), or after the database was recreated by subir-postgres.
---

# Rodar o migrate do Django

## Visão geral

Aplica as migrations do Django no banco configurado no `settings.py`, usando o Python do `venv` do projeto. Antes de aplicar, o script confere se o banco está acessível.

## Como executar

Rode a partir da raiz do projeto:

```bash
bash .claude/skills/rodar-migrate/scripts/rodar-migrate.sh
```

Os argumentos são repassados ao `migrate`. Exemplos:

```bash
bash .claude/skills/rodar-migrate/scripts/rodar-migrate.sh monitoramento        # só um app
bash .claude/skills/rodar-migrate/scripts/rodar-migrate.sh monitoramento zero   # desfaz as migrations do app
```

Depois, informe ao usuário o que foi aplicado e se sobrou alguma migration pendente.

## Erros comuns

- **Não conecta ao banco**: o container do Postgres não está rodando. Use a skill subir-postgres e rode o migrate de novo.
- **Tabelas do app `monitoramento` não foram criadas**: as migrations do app estão no `.gitignore` (`*/migrations/*`), então não vêm no clone. Rode `python manage.py makemigrations` antes do migrate, mas só se o usuário pedir.
- **`ambiente virtual não encontrado`**: crie o `venv` e instale o `requirements.txt` (veja o README).
