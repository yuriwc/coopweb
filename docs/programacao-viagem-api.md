# API de Programação de Viagem — Novos Exemplos de Requisição

## POST /api/v1/programacao/criar

### O que mudou
| Antes | Depois |
|-------|--------|
| `origens: [LocalDTO]` | `origin: OriginDTO` _(opcional)_ |
| `destinos: [LocalDTO]` | `destination: DestinationDTO` _(opcional)_ |
| _(sem suporte)_ | `intermediateCoordinates: [IntermediateCoordinatesDTO]` _(opcional)_ |
| _(sem suporte)_ | `centroCustoId: Long` _(opcional)_ |

> **Comportamento de `origin`/`destination`:**
> - Se fornecidos → armazenados como JSON na programação e usados diretamente na criação da viagem
> - Se omitidos → ao criar a viagem (`/{id}/criar-viagem`), o sistema usa o endereço cadastrado dos passageiros e da empresa, baseado no tipo de viagem (Apanha: passageiro → empresa; Retorno: empresa → passageiro)

---

### Exemplo — Apanha simples
```json
{
  "empresaID": "uuid-da-empresa",
  "cooperativaID": "uuid-da-cooperativa",
  "tipoViagem": "Apanha",
  "passageiros": ["uuid-passageiro-1"],
  "dataInicial": { "year": 2026, "month": 3, "day": 10 },
  "dataFinal":   { "year": 2026, "month": 6, "day": 30 },
  "horaViagem":  { "hour": 7, "minute": 30, "second": 0, "millisecond": 0 },
  "origin": {
    "lat": -23.5505,
    "lng": -46.6333,
    "name": "Casa do Passageiro",
    "address": "Rua das Flores, 123, São Paulo"
  },
  "destination": {
    "lat": -23.5615,
    "lng": -46.6560,
    "name": "Empresa ABC",
    "address": "Av. Paulista, 1000, São Paulo"
  }
}
```

---

### Exemplo — Retorno com centro de custo
```json
{
  "empresaID": "uuid-da-empresa",
  "cooperativaID": "uuid-da-cooperativa",
  "tipoViagem": "Retorno",
  "passageiros": ["uuid-passageiro-1", "uuid-passageiro-2"],
  "dataInicial": { "year": 2026, "month": 3, "day": 10 },
  "horaViagem":  { "hour": 18, "minute": 0, "second": 0, "millisecond": 0 },
  "origin": {
    "lat": -23.5615,
    "lng": -46.6560,
    "name": "Empresa ABC",
    "address": "Av. Paulista, 1000, São Paulo"
  },
  "destination": {
    "lat": -23.5505,
    "lng": -46.6333,
    "name": "Residência",
    "address": "Rua das Flores, 123, São Paulo"
  },
  "centroCustoId": 42
}
```

---

### Exemplo — APANHA_E_RETORNO com parada intermediária
```json
{
  "empresaID": "uuid-da-empresa",
  "cooperativaID": "uuid-da-cooperativa",
  "tipoViagem": "APANHA_E_RETORNO",
  "passageiros": ["uuid-passageiro-1"],
  "dataInicial": { "year": 2026, "month": 3, "day": 10 },
  "dataFinal":   { "year": 2026, "month": 12, "day": 31 },
  "horaViagem":  { "hour": 8, "minute": 0, "second": 0, "millisecond": 0 },
  "horaRetorno": { "hour": 17, "minute": 30, "second": 0, "millisecond": 0 },
  "origin": {
    "lat": -23.5505,
    "lng": -46.6333,
    "name": "Casa do Passageiro",
    "address": "Rua das Flores, 123, São Paulo"
  },
  "destination": {
    "lat": -23.5615,
    "lng": -46.6560,
    "name": "Empresa ABC",
    "address": "Av. Paulista, 1000, São Paulo"
  },
  "intermediateCoordinates": [
    {
      "lat": -23.5550,
      "lng": -46.6400,
      "name": "Ponto de Parada",
      "address": "Rua Intermediária, 50, São Paulo"
    }
  ],
  "centroCustoId": 42
}
```

---

## POST /api/v1/programacao/{id}/criar-viagem?tipoViagem=Apanha

Sem mudança no request (mesmos parâmetros). O endpoint agora:
- Lê `origin`/`destination`/`intermediateCoordinates` diretamente do JSON salvo na programação
- Calcula o preço pela mesma lógica do `createViagem`
- Define `StatusViagem.Iniciada` (motorista já executando)

### Resposta (mudou)
```json
{
  "id": "uuid-da-viagem-criada",
  "origin": "{ ... json original ... }",
  "destination": "{ ... json original ... }"
}
```

---

## Campos de OriginDTO / DestinationDTO / IntermediateCoordinatesDTO

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `lat` | Double | Sim |
| `lng` | Double | Sim |
| `name` | String | Sim |
| `address` | String | Sim |
| `placeId` | String | Não |
| `nome` | String | Não |
| `whatsapp` | String | Não |
| `email` | String | Não |
| `observacoes` | String | Não |
