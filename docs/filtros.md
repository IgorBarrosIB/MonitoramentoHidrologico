# Filtros da API

Os endpoints de listagem aceitam filtros pela query string (`?campo=valor`). Os filtros usam o [django-filter](https://django-filter.readthedocs.io/) e são definidos em `filterset_fields`, no arquivo `monitoramento/views.py`.

> **Rotas:** os caminhos `/stations/` e `/observations/` abaixo supõem que os ViewSets vão ser registrados com esses nomes no `urls.py`. Hoje as rotas ainda não estão registradas.

## Regras gerais

- Todo filtro compara por **igualdade exata**. Maiúsculas e minúsculas fazem diferença, e não há busca parcial.
- Para combinar filtros, use `&`. Só voltam os registros que atendem a todos eles.
- Espaços e caracteres especiais precisam de codificação na URL. Por exemplo, `Vale Verde` vira `Vale%20Verde` e `mm/h` vira `mm%2Fh`. O navegador e a maioria dos clientes HTTP fazem isso sozinhos.
- Um filtro sem resultado devolve uma lista vazia (`[]`) com status `200`.
- Um valor inválido para um campo relacionado (como uma estação que não existe) devolve `400`.

---

## Estações: `/stations/`

| Filtro | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `name` | texto | Nome da estação | `?name=Estação Aurora` |
| `river` | texto | Rio monitorado | `?river=Rio Verde` |
| `municipality` | texto | Município da estação | `?municipality=Vale Verde` |

### Valores existentes

| id | name | river | municipality |
|---|---|---|---|
| EST-01 | Estação Aurora | Rio Aurora | Vila Aurora |
| EST-02 | Estação Vale Verde | Rio Verde | Vale Verde |
| EST-03 | Estação Campo Alto | Rio do Campo | Campo Alto |

### Exemplos

```http
GET /stations/?municipality=Campo Alto
GET /stations/?river=Rio Aurora
```

---

## Observações: `/observations/`

| Filtro | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `station` | código da estação | Observações de uma estação | `?station=EST-01` |
| `station_id` | código da estação | Igual a `station` (mesmo resultado) | `?station_id=EST-01` |
| `metric` | texto | Tipo de medição: `level` (nível) ou `rain` (chuva) | `?metric=rain` |
| `observed_at` | data/hora ISO | Instante exato da observação | `?observed_at=2026-11-04T12:00:00.000Z` |
| `value` | número | Valor medido exato | `?value=0` |
| `unit` | texto | Unidade: `m` (nível) ou `mm/h` (chuva) | `?unit=mm/h` |

### Métricas e unidades

| metric | unit | Significado |
|---|---|---|
| `level` | `m` | Nível do rio, em metros |
| `rain` | `mm/h` | Chuva, em milímetros por hora |

### Exemplos

```http
# Todas as observações da estação EST-01
GET /observations/?station=EST-01

# Só o nível do rio na estação EST-02
GET /observations/?station=EST-02&metric=level

# Horas sem chuva na estação EST-03
GET /observations/?station=EST-03&metric=rain&value=0

# Leitura de um horário específico
GET /observations/?observed_at=2026-11-04T12:00:00.000Z
```

---

## Limitações atuais

- **Sem intervalo de datas:** `observed_at` só aceita o instante exato. Não dá para pedir "das 08h às 12h".
- **Sem comparação de valores:** `value` só aceita igualdade. Não dá para pedir "nível acima de 1.5 m".
- **Sem busca parcial:** `?municipality=Vale` não encontra `Vale Verde`.

Para suportar esses casos, é preciso definir um `FilterSet` com lookups como `gte`, `lte` e `icontains`.
