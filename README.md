# Monitoramento Hidrológico

API em Django + Django REST Framework para monitoramento hidrológico, com um frontend em Angular que exibe o resumo e os gráficos de nível e chuva de cada estação.

## Stack

**Backend**

- Python 3.12+
- Django 6.1
- Django REST Framework
- django-filter
- drf-spectacular (documentação OpenAPI)
- SQLite (banco de desenvolvimento)

**Frontend**

- Node.js 22.22+ / 24.15+ / 26+
- Angular 22 (com SSR via `@angular/ssr` + Express)
- Chart.js + ng2-charts (gráficos)
- Vitest (testes)

## Estrutura

```
.
├── manage.py
├── requirements.txt
├── monitoramentohidrologico/   # configuração do projeto (settings, urls, wsgi/asgi)
├── monitoramento/              # app principal
└── frontend/                   # aplicação Angular
    ├── proxy.conf.json         # redireciona /api para o Django em desenvolvimento
    └── src/app/
        ├── services/           # chamadas à API (stations, summary, series)
        └── components/         # componentes (hydro-charts)
```

## Pré-requisitos

- **Python 3.12 ou superior** (exigido pelo Django 6.1)
- **Node.js 22.22+, 24.15+ ou 26+** e **npm** (exigidos pelo Angular CLI 22) — só para o frontend
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

### 5. Popular o banco com dados simulados

As tabelas `stations` e `observations` são criadas e populadas pelo script `BancoDeDados.py`, e não pelas migrations. Sem esse passo, a API retorna `no such table: stations` e o frontend fica sem dados:

```bash
python BancoDeDados.py   # cria 3 estações e 72 h de leituras
```

### 6. Criar um superusuário (opcional)

Necessário para acessar o painel administrativo:

```bash
python manage.py createsuperuser
```

### 7. Rodar o servidor

```bash
python manage.py runserver
```

O projeto fica disponível em:

- API: http://127.0.0.1:8000/api/
- Documentação (Swagger): http://127.0.0.1:8000/api/docs/
- Admin: http://127.0.0.1:8000/admin/

## Subindo o frontend

O frontend fica na pasta `frontend/` e consome a API do Django. **Deixe o backend rodando** (passo 7 acima) em outro terminal antes de iniciar o frontend.

### 1. Instalar o Node.js

Confira a versão instalada:

```bash
node --version
npm --version
```

Se não tiver o Node.js (ou a versão for antiga):

- **Linux / macOS:** recomendado usar o [nvm](https://github.com/nvm-sh/nvm):
  ```bash
  nvm install --lts
  nvm use --lts
  ```
- **Windows:** baixe o instalador LTS em [nodejs.org](https://nodejs.org/).

### 2. Instalar as dependências

```bash
cd frontend
npm install
```

> Use `npm ci` para instalar exatamente as versões do `package-lock.json`.

### 3. Rodar o servidor de desenvolvimento

```bash
npm start
```

Esse comando executa `ng serve --proxy-config proxy.conf.json`. O frontend fica disponível em:

- Frontend: http://localhost:4200/

Em desenvolvimento, as requisições para `/api/...` feitas pelo Angular são encaminhadas pelo proxy ([frontend/proxy.conf.json](frontend/proxy.conf.json)) para `http://localhost:8000`, onde o Django está rodando. Por isso não é preciso configurar CORS. Se o Django estiver em outra porta, ajuste o `target` nesse arquivo.

> Rode `npm start` e não `ng serve` direto: sem a opção `--proxy-config`, as chamadas à API não chegam ao Django.

### 4. Build de produção (opcional)

O projeto usa SSR (renderização no servidor) com Express:

```bash
npm run build              # gera dist/frontend/browser e dist/frontend/server
npm run serve:ssr:frontend # sobe o servidor Node em http://localhost:4000
```

A porta pode ser alterada pela variável `PORT` (ex.: `PORT=8080 npm run serve:ssr:frontend`).

> ⚠️ **Limitação atual:** o `npm run build` falha com `An error occurred while prerendering route '/'` (timeout). A rota `/` está configurada como `RenderMode.Prerender` em [frontend/src/app/app.routes.server.ts](frontend/src/app/app.routes.server.ts), e durante o build o Angular tenta chamar `/api/...`, que não existe nesse momento. Enquanto isso não for corrigido (por exemplo, trocando para `RenderMode.Client` ou `RenderMode.Server`), use o `npm start` para rodar o frontend.

> O servidor Express de produção não tem o proxy para `/api`. Para usar o build fora do ambiente de desenvolvimento, é preciso servir frontend e API no mesmo domínio (por exemplo, atrás de um Nginx que encaminhe `/api` para o Django).

### Comandos do frontend

Execute dentro da pasta `frontend/`:

| Ação                                   | Comando                       |
|----------------------------------------|-------------------------------|
| Servidor de desenvolvimento (com proxy) | `npm start`                   |
| Build de produção                      | `npm run build`               |
| Build contínuo (modo desenvolvimento)  | `npm run watch`               |
| Rodar os testes (Vitest)               | `npm test`                    |
| Servir o build SSR                     | `npm run serve:ssr:frontend`  |

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
