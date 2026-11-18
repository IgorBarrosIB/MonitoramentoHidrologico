# Autenticação

## Regra de acesso

A API usa a permissão `IsAuthenticatedOrReadOnly`:

| Métodos | Quem pode |
|---|---|
| `GET`, `HEAD`, `OPTIONS` | Qualquer pessoa, sem autenticação |
| `POST`, `PUT`, `PATCH`, `DELETE` | Só usuários autenticados |

Não há diferença de permissão entre usuários: qualquer usuário autenticado pode criar, alterar e remover estações e observações.

Dois métodos de autenticação são aceitos, nesta ordem:

1. **Token** (`TokenAuthentication`): para clientes HTTP, scripts e integrações.
2. **Sessão** (`SessionAuthentication`): para quem fez login no `/admin/` e usa a API navegável no mesmo navegador.

## Criando um usuário

Os usuários são os do Django. Para criar um:

```bash
python manage.py createsuperuser
```

Também é possível criar usuários comuns pelo `/admin/` em **Users**.

## Gerando o token

`POST /api/token/`

| Campo | Tipo | Obrigatório |
|---|---|---|
| `username` | texto | Sim |
| `password` | texto | Sim |

Aceita formulário ou JSON:

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
     -d "username=admin" -d "password=senha"
```

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "senha"}'
```

Resposta `200`:

```json
{"token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"}
```

Cada usuário tem **um único token**. Chamar a rota de novo devolve o mesmo token. Ele não expira.

### Erros

| Situação | Status | Corpo |
|---|---|---|
| Usuário ou senha errados | `400` | `{"non_field_errors": ["Unable to log in with provided credentials."]}` |
| Campo faltando | `400` | `{"password": ["This field is required."]}` |
| Método diferente de `POST` | `405` | `{"detail": "Method \"GET\" not allowed."}` |

## Usando o token

Envie o token no cabeçalho `Authorization`, com o prefixo `Token` e um espaço:

```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

```bash
curl -X POST http://127.0.0.1:8000/api/stations/ \
     -H "Authorization: Token <seu-token>" \
     -d "id=EST-04" -d "name=Estação Nova" -d "river=Rio Novo" -d "municipality=Nova Vila"
```

Em JavaScript:

```js
await fetch('http://127.0.0.1:8000/api/stations/', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ id: 'EST-04', name: 'Estação Nova', river: 'Rio Novo', municipality: 'Nova Vila' }),
});
```

No Swagger (`/api/docs/`), clique em **Authorize** e informe `Token <seu-token>` no campo `tokenAuth`.

### Erros de autenticação

| Situação | Status | Corpo |
|---|---|---|
| Escrita sem cabeçalho `Authorization` | `401` | `{"detail": "Authentication credentials were not provided."}` |
| Token inexistente | `401` | `{"detail": "Invalid token."}` |
| Usuário do token desativado | `401` | `{"detail": "User inactive or deleted."}` |

## Revogando um token

Pelo `/admin/`, em **Auth Token > Tokens**, apague o token do usuário. Na próxima chamada a `/api/token/`, um token novo é gerado.

Pelo shell:

```bash
python manage.py shell -c "from rest_framework.authtoken.models import Token; Token.objects.filter(user__username='admin').delete()"
```

## Sessão e CSRF

Quem está logado no `/admin/` pode usar os formulários da API navegável (abrindo `/api/stations/` no navegador). Nesse modo, o Django exige o token CSRF em requisições de escrita; os formulários da API navegável já o enviam. Para clientes fora do navegador, use o token.