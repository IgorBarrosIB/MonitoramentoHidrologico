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

- Aplicação: http://127.0.0.1:8000/
- Admin: http://127.0.0.1:8000/admin/

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
