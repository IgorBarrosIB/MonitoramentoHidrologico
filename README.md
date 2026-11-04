# Monitoramento Hidrológico

API em Django + Django REST Framework para monitoramento hidrológico.

## Stack

- Python 3.12+
- Django 6.1
- Django REST Framework
- django-filter
- drf-spectacular (documentação OpenAPI)
- SQLite (banco de desenvolvimento)

## Estrutura

```
.
├── manage.py
├── requirements.txt
├── monitoramentohidrologico/   # configuração do projeto (settings, urls, wsgi/asgi)
└── monitoramento/              # app principal
```

## Pré-requisitos

- **Python 3.12 ou superior** (exigido pelo Django 6.1)
- **Git**

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

### 4. Aplicar as migrations

```bash
python manage.py migrate
```

### 5. Criar um superusuário (opcional)

Necessário para acessar o painel administrativo:

```bash
python manage.py createsuperuser
```

### 6. Rodar o servidor

```bash
python manage.py runserver
```

O projeto fica disponível em:

- API: http://127.0.0.1:8000/api/
- Documentação (Swagger): http://127.0.0.1:8000/api/docs/
- Admin: http://127.0.0.1:8000/admin/

## Rotas

Todas as rotas da API ficam sob o prefixo `/api/`. Endereço base local: `http://127.0.0.1:8000`.

### Estações

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/estacoes/` | Lista as estações | Não |
| `POST` | `/api/estacoes/` | Cria uma estação | Sim |
| `GET` | `/api/estacoes/{id}/` | Detalha uma estação (ex.: `EST-01`) | Não |
| `PUT` | `/api/estacoes/{id}/` | Substitui uma estação | Sim |
| `PATCH` | `/api/estacoes/{id}/` | Atualiza campos de uma estação | Sim |
| `DELETE` | `/api/estacoes/{id}/` | Remove uma estação (e as observações dela) | Sim |

### Observações

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/observacoes/` | Lista as observações | Não |
| `POST` | `/api/observacoes/` | Cria uma observação | Sim |
| `GET` | `/api/observacoes/{id}/` | Detalha uma observação | Não |
| `PUT` | `/api/observacoes/{id}/` | Substitui uma observação | Sim |
| `PATCH` | `/api/observacoes/{id}/` | Atualiza campos de uma observação | Sim |
| `DELETE` | `/api/observacoes/{id}/` | Remove uma observação | Sim |

As listagens aceitam filtros pela query string, por exemplo `/api/observacoes/?station=EST-01&metric=level`. A lista completa está em [docs/filtros.md](docs/filtros.md).

### Autenticação e documentação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/token/` | Gera o token de acesso a partir de `username` e `password` |
| `GET` | `/api/` | Raiz navegável da API, com links para os recursos |
| `GET` | `/api/schema/` | Schema OpenAPI (YAML) |
| `GET` | `/api/docs/` | Documentação interativa (Swagger UI) |
| `GET` | `/api/redoc/` | Documentação em ReDoc |
| — | `/admin/` | Painel administrativo do Django |

### Usando o token

A leitura (`GET`) é pública. Para criar, alterar ou remover, é preciso autenticar. Gere o token com um usuário existente (por exemplo, o superusuário):

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
     -d "username=<usuario>" -d "password=<senha>"
# {"token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"}
```

Envie o token no cabeçalho `Authorization` das requisições:

```bash
curl -X POST http://127.0.0.1:8000/api/estacoes/ \
     -H "Authorization: Token <seu-token>" \
     -d "id=EST-04" -d "name=Estação Nova" -d "river=Rio Novo" -d "municipality=Nova Vila"
```

Sem o token, essas requisições retornam `401 Unauthorized`.

## Comandos úteis

| Ação                                | Comando                              |
|-------------------------------------|--------------------------------------|
| Criar migrations após alterar models | `python manage.py makemigrations`    |
| Aplicar migrations                   | `python manage.py migrate`           |
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
