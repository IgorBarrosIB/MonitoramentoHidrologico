# Monitoramento Hidrológico

API em Django + Django REST Framework para monitoramento hidrológico.

## Stack

- Python 3.12+
- Django 6.1
- Django REST Framework
- django-filter
- drf-spectacular (documentação OpenAPI)
- PostgreSQL 17 (em Docker)

## Estrutura

```
.
├── manage.py
├── requirements.txt
├── BancoDeDados.py             # popula o banco com dados simulados
├── docker-compose.yml          # sobe o PostgreSQL
├── docker/postgres/Dockerfile  # imagem do PostgreSQL
├── monitoramentohidrologico/   # configuração do projeto (settings, urls, wsgi/asgi)
└── monitoramento/              # app principal
```

## Pré-requisitos

- **Python 3.12 ou superior** (exigido pelo Django 6.1)
- **Git**
- **Docker** com o plugin **Docker Compose** (para o banco de dados)

Confira a versão instalada:

| Sistema       | Comando             |
|---------------|---------------------|
| Linux / macOS | `python3 --version` |
| Windows       | `py --version`      |

### Instalando o Python

- **Linux (Debian/Ubuntu):**
  ```bash
  sudo apt update
  sudo apt install python3 python3-venv python3-pip
  ```
- **macOS:** instale pelo [Homebrew](https://brew.sh/):
  ```bash
  brew install python@3.12
  ```
- **Windows:** baixe o instalador em [python.org](https://www.python.org/downloads/) e marque a opção **"Add python.exe to PATH"** durante a instalação.

## Subindo o ambiente de desenvolvimento

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd MonitoramentoHidrologico
```

### 2. Criar e ativar o ambiente virtual

**Linux / macOS**

```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows (PowerShell)**

```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
```

> Se o PowerShell bloquear a execução do script, rode uma vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

**Windows (Prompt de Comando - cmd)**

```bat
py -m venv venv
venv\Scripts\activate.bat
```

Com o ambiente ativo, o terminal mostra `(venv)` no início da linha. A partir daqui, os comandos `python` e `pip` são os mesmos em todos os sistemas.

### 3. Instalar as dependências

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Subir o banco de dados

```bash
docker compose up -d --build --wait
```

O PostgreSQL fica disponível em `127.0.0.1:5433` (banco, usuário e senha `monitoramento`). Veja mais em [Banco de dados (Docker)](#banco-de-dados-docker).

### 5. Aplicar as migrations

```bash
python manage.py migrate
```

### 6. Importar os dados simulados

```bash
python BancoDeDados.py
```

Cria as tabelas `stations` e `observations` e insere 3 estações com leituras de nível e chuva das últimas 72 horas. Pode ser rodado mais de uma vez: registros que já existem são ignorados.

### 7. Criar um superusuário (opcional)

Necessário para acessar o painel administrativo:

```bash
python manage.py createsuperuser
```

### 8. Rodar o servidor

```bash
python manage.py runserver
```

O projeto fica disponível em:

- Aplicação: http://127.0.0.1:8000/
- Admin: http://127.0.0.1:8000/admin/

## Banco de dados (Docker)

Os dados de conexão são lidos de variáveis de ambiente, iguais no `docker-compose.yml`, no `settings.py` e no `BancoDeDados.py`:

| Variável      | Padrão          |
|---------------|-----------------|
| `PG_HOST`     | `127.0.0.1`     |
| `PG_PORT`     | `5433`          |
| `PG_DB`       | `monitoramento` |
| `PG_USER`     | `monitoramento` |
| `PG_PASSWORD` | `monitoramento` |

Para trocar um valor, defina a variável antes dos comandos (ex.: `export PG_PORT=5440`) ou crie um arquivo `.env` na raiz com `PG_PORT=5440`. O Docker Compose lê o `.env` automaticamente; o Django e o `BancoDeDados.py` não, então nesse caso exporte a variável também no terminal.

### Subir e parar

| Ação                                     | Comando                               |
|------------------------------------------|---------------------------------------|
| Subir o banco                            | `docker compose up -d --build --wait` |
| Ver o status                             | `docker compose ps`                   |
| Ver os logs                              | `docker compose logs -f db`           |
| Abrir o `psql` dentro do container       | `docker compose exec db psql -U monitoramento -d monitoramento` |
| Parar (mantém os dados)                  | `docker compose stop`                 |
| Remover o container (mantém os dados)    | `docker compose down`                 |

Os dados ficam no volume `pgdata` e continuam lá depois de `stop` ou `down`.

### Apagar tudo do projeto no Docker

Remove o container, a rede, o volume com os dados e a imagem construída:

```bash
docker compose down -v --rmi local
```

### Recriar o banco do zero

```bash
docker compose down -v
docker compose up -d --build --wait
python manage.py migrate
python BancoDeDados.py
```

### Limpar o Docker inteiro (todos os projetos)

> **Cuidado:** isso apaga containers parados, imagens sem uso, redes, volumes e cache de build de **todos** os projetos da máquina, não só deste. Os dados de outros bancos guardados em volumes serão perdidos.

```bash
docker compose down -v --rmi local   # remove o deste projeto
docker system prune -a --volumes     # remove todo o resto que não está em uso
```

Containers que estiverem rodando de outros projetos não são removidos. Para conferir o que sobrou: `docker ps -a`, `docker images` e `docker volume ls`.

## Comandos úteis

| Ação                                | Comando                              |
|-------------------------------------|--------------------------------------|
| Criar migrations após alterar models | `python manage.py makemigrations`    |
| Aplicar migrations                   | `python manage.py migrate`           |
| Importar os dados simulados          | `python BancoDeDados.py`             |
| Rodar os testes                      | `python manage.py test`              |
| Abrir o shell do Django              | `python manage.py shell`             |
| Desativar o ambiente virtual         | `deactivate`                         |

## Adicionando dependências

Ao instalar um pacote novo, fixe a versão no `requirements.txt`:

```bash
pip install <pacote>
pip freeze | grep -i <pacote>   # Linux/macOS
pip freeze | findstr /i <pacote> # Windows
```

Copie a linha retornada (ex.: `pacote==1.2.3`) para o `requirements.txt`.
