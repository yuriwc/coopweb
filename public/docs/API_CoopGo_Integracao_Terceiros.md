# API CoopGo - Guia de Integração para Terceiros

## Visão Geral

Esta documentação descreve as APIs públicas do sistema CoopGo para integração com plataformas de mobilidade urbana e aplicativos de transporte. A API permite o cadastro de empresas, autenticação, cotação de preços, solicitação e gerenciamento de corridas.

## URL Base

```
https://api.coopgo.bygoapps.com
```

## Autenticação

O sistema utiliza um modelo de autenticação em duas etapas:

1. **API Key do Provider**: Chave única fornecida para cada parceiro integrador
2. **Token JWT**: Token temporário gerado para cada empresa cadastrada

### Obtenção da API Key

Entre em contato com nossa equipe comercial para obter sua API Key de integração:
- **Email**: integracao@coopgo.com.br
- **Telefone**: (11) 3000-0000

---

## 1. Cadastro de Empresas

Endpoint para cadastrar empresas parceiras no sistema CoopGo.

### Endpoint
```http
POST /api/mobicity/empresas
```

### Headers
```http
Content-Type: application/json
X-Provider-API-Key: sua_api_key_aqui
```

### Campos do Request

#### **Dados Básicos da Empresa** *(obrigatórios)*

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `nome` | `string` | ✅ | max 100 chars | Nome fantasia da empresa |
| `cnpj` | `string` | ✅ | 14 dígitos | CNPJ apenas números |
| `razaoSocial` | `string` | ✅ | max 150 chars | Razão social completa |
| `inscricaoEstadual` | `string` | ✅ | max 20 chars | Inscrição estadual |
| `inscricaoMunicipal` | `string` | ❌ | max 20 chars | Inscrição municipal |
| `dataFechamento` | `integer` | ✅ | 1-31 | Dia do fechamento mensal |

#### **Dados de Contato** *(obrigatórios)*

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `contato.telefone` | `string` | ✅ | 10-11 dígitos | Telefone fixo |
| `contato.celular` | `string` | ❌ | max 15 chars | Celular/WhatsApp |
| `contato.email` | `string` | ❌ | formato email | Email corporativo |

#### **Endereço** *(obrigatório)*

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `contato.logradouro` | `string` | ✅ | max 100 chars | Rua/Avenida |
| `contato.numero` | `string` | ✅ | max 10 chars | Número |
| `contato.complemento` | `string` | ❌ | max 50 chars | Complemento |
| `contato.bairro` | `string` | ✅ | max 50 chars | Bairro |
| `contato.cidade` | `string` | ✅ | max 50 chars | Cidade |
| `contato.uf` | `string` | ✅ | 2 letras | Estado (SP, RJ, etc) |
| `contato.cep` | `string` | ✅ | 8 dígitos | CEP apenas números |
| `contato.latitude` | `number` | ❌ | -90 a 90 | Coordenada geográfica |
| `contato.longitude` | `number` | ❌ | -180 a 180 | Coordenada geográfica |

### Response

#### Sucesso (201 Created)
```json
{
  "success": true,
  "message": "Empresa cadastrada com sucesso",
  "timestamp": "2024-01-15T10:30:00",
  "empresaId": "123e4567-e89b-12d3-a456-426614174000",
  "nome": "Empresa Exemplo Ltda",
  "cnpj": "12345678000100",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 36000,
  "apiKey": "empresa_1234567890abcdef",
  "statusIntegracao": "ATIVA"
}
```

### Exemplo de Request

```json
{
  "nome": "TransPorte Rápido Ltda",
  "cnpj": "12345678000195",
  "razaoSocial": "TransPorte Rápido Transporte e Logística Ltda ME",
  "inscricaoEstadual": "123456789",
  "dataFechamento": 15,
  "contato": {
    "telefone": "1133334444",
    "celular": "11999887766",
    "email": "contato@transporterapido.com.br",
    "logradouro": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "uf": "SP",
    "cep": "01234567"
  }
}
```

---

## 2. Autenticação JWT

Endpoint para gerar tokens JWT para autenticação nas APIs. Este token é necessário para acessar os demais endpoints.

### Endpoint
```http
POST /api/mobicity/auth/token
```

### Headers
```http
Content-Type: application/json
```

### Campos do Request

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `empresaId` | `UUID` | ✅ | formato UUID | ID da empresa no sistema |
| `apiKey` | `string` | ✅ | string válida | API Key da empresa |

### Response

#### Sucesso (200 OK)
```json
{
  "success": true,
  "message": "Token gerado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "empresaId": "123e4567-e89b-12d3-a456-426614174000",
  "empresaNome": "TransPorte Rápido Ltda",
  "expiresIn": 36000,
  "tokenType": "Bearer",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Exemplo de Request

```json
{
  "empresaId": "123e4567-e89b-12d3-a456-426614174000",
  "apiKey": "empresa_1234567890abcdef"
}
```

---

## 3. Cotação de Preços

Endpoint para calcular preços de corridas e verificar disponibilidade de veículos.

### Endpoint
```http
POST /api/quote
```

### Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token_da_empresa>
```

### Campos do Request

#### **Coordenadas de Origem** *(obrigatório)*

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `origin.lat` | `number` | ✅ | -90 a 90 | Latitude do ponto de origem |
| `origin.lng` | `number` | ✅ | -180 a 180 | Longitude do ponto de origem |
| `origin.cidade` | `string` | ❌ | texto livre | Nome da cidade de origem |

#### **Coordenadas de Destino** *(obrigatório)*

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `destination.lat` | `number` | ✅ | -90 a 90 | Latitude do ponto de destino |
| `destination.lng` | `number` | ✅ | -180 a 180 | Longitude do ponto de destino |
| `destination.cidade` | `string` | ❌ | texto livre | Nome da cidade de destino |

#### **Coordenadas Intermediárias** *(opcional)*

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `intermediateCoordinates` | `array` | ❌ | lista coordenadas | Paradas durante a rota |
| `intermediateCoordinates[].lat` | `number` | ✅ (se informado) | -90 a 90 | Latitude da parada |
| `intermediateCoordinates[].lng` | `number` | ✅ (se informado) | -180 a 180 | Longitude da parada |
| `intermediateCoordinates[].cidade` | `string` | ❌ | texto livre | Nome da cidade da parada |

#### **Campos Opcionais**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `providerId` | `UUID` | ❌ | formato UUID | ID de cooperativa específica |
| `scheduleDate` | `datetime` | ❌ | ISO 8601 | Data/hora agendada |

### Response

#### Sucesso (200 OK)
```json
{
  "success": true,
  "message": "Orçamento calculado com sucesso",
  "timestamp": "2024-01-15T10:30:00",
  "categories": [
    {
      "name": "Básico",
      "code": "BASICO",
      "price": 15.50,
      "eta": 8,
      "description": "Veículo econômico padrão",
      "available": true,
      "availableCars": 12,
      "currency": "BRL"
    },
    {
      "name": "Premium",
      "code": "PREMIUM", 
      "price": 22.80,
      "eta": 5,
      "description": "Veículo executivo com ar condicionado",
      "available": true,
      "availableCars": 6,
      "currency": "BRL"
    }
  ]
}
```

### Exemplo de Request

```json
{
  "origin": {
    "lat": -23.5505,
    "lng": -46.6333,
    "cidade": "São Paulo"
  },
  "destination": {
    "lat": -23.5489,
    "lng": -46.6388,
    "cidade": "São Paulo"
  },
  "intermediateCoordinates": [
    {
      "lat": -23.5495,
      "lng": -46.6360,
      "cidade": "São Paulo"
    }
  ]
}
```

---

## 4. Solicitação de Corridas

Endpoint para solicitar corridas no sistema. Cria uma nova viagem com status PENDENTE.

### Endpoint
```http
POST /api/v1/rides/{idCooperativa}
```

### Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token_da_empresa>
```

### Parâmetros da URL

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `idCooperativa` | `UUID` | ✅ | ID da cooperativa para atender a corrida |

### Campos do Request

#### **Dados Obrigatórios**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `scheduleDate` | `datetime` | ✅ | ISO 8601 | Data e hora para execução |
| `origin.lat` | `number` | ✅ | -90 a 90 | Latitude da origem |
| `origin.lng` | `number` | ✅ | -180 a 180 | Longitude da origem |
| `destination.lat` | `number` | ✅ | -90 a 90 | Latitude do destino |
| `destination.lng` | `number` | ✅ | -180 a 180 | Longitude do destino |
| `category` | `string` | ✅ | max 20 chars | Categoria do veículo |
| `user` | `string` | ✅ | string válida | ID do usuário solicitante |

#### **Dados Opcionais do Passageiro**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `origin.nome` | `string` | ❌ | max 100 chars | Nome do passageiro |
| `origin.whatsapp` | `string` | ❌ | max 20 chars | WhatsApp do passageiro |
| `origin.email` | `string` | ❌ | max 100 chars | Email do passageiro |
| `origin.observacoes` | `string` | ❌ | max 200 chars | Observações sobre origem |
| `externalId` | `string` | ❌ | max 100 chars | ID externo para rastreamento |
| `observations` | `string` | ❌ | max 500 chars | Observações gerais |

### Response

#### Sucesso (201 Created)
```json
{
  "success": true,
  "message": "Corrida criada com sucesso",
  "timestamp": "2024-01-15T10:30:00",
  "rideId": "123e4567-e89b-12d3-a456-426614174000",
  "externalId": "EXT_001234",
  "status": "PENDENTE",
  "scheduleDate": "2024-01-15T14:30:00",
  "empresaId": "987fcdeb-51a2-43d8-b123-456789abcdef",
  "empresaNome": "TransPorte Rápido Ltda",
  "passengerName": "João Silva",
  "passengerWhatsapp": "11999887766",
  "estimatedPrice": 15.50,
  "currency": "BRL",
  "category": "BASICO"
}
```

### Exemplo de Request

```json
{
  "scheduleDate": "2024-01-15T14:30:00",
  "origin": {
    "lat": -23.5505,
    "lng": -46.6333,
    "nome": "João Silva",
    "whatsapp": "11999887766",
    "observacoes": "Portão azul, interfone 123"
  },
  "destination": {
    "lat": -23.5489,
    "lng": -46.6388
  },
  "category": "BASICO",
  "user": "user_001",
  "externalId": "EXT_001234"
}
```

---

## 5. Cancelamento de Corridas

Endpoint para cancelar corridas. Altera o status para CANCELADA.

### Endpoint
```http
POST /api/v1/rides/cancel
```

### Headers
```http
Content-Type: application/json
Authorization: Bearer <jwt_token_da_empresa>
```

### Campos do Request

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------| 
| `rideId` | `string` | ✅ | formato UUID | ID da corrida a ser cancelada |

### Response

#### Sucesso (200 OK)
```json
{
  "success": true,
  "message": "Viagem cancelada com sucesso",
  "timestamp": "2024-01-15T10:30:00",
  "rideId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "CANCELADA",
  "canceledAt": "2024-01-15T10:30:00"
}
```

### Exemplo de Request

```json
{
  "rideId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Regras de Cancelamento

- ✅ **Podem ser canceladas**: PENDENTE, INICIADA, EM_ANDAMENTO
- ❌ **Não podem ser canceladas**: CANCELADA, FINALIZADA, ASSINADA

---

## 6. Consulta de Status

Endpoint para consultar status atual das corridas, incluindo localização do motorista.

### Endpoint
```http
GET /api/v1/rides/{rideId}/status
```

### Headers
```http
Authorization: Bearer <jwt_token_da_empresa>
```

### Parâmetros da URL

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `rideId` | `UUID` | ✅ | ID da corrida para consulta |

### Response

#### Sucesso (200 OK)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "category": "BASICO",
  "externalId": "EXT_001234",
  "status": "driver_assigned",
  "origin": {
    "lat": -23.5505,
    "lng": -46.6333
  },
  "destination": {
    "lat": -23.5489,
    "lng": -46.6388
  },
  "driver": {
    "name": "Carlos Silva",
    "contact": "11999887766",
    "car": {
      "plate": "ABC-1234",
      "color": "Branco",
      "model": "Toyota Corolla"
    }
  },
  "supplier": {
    "name": "TransPorte Rápido Ltda"
  },
  "eta": 300,
  "updatedLocation": {
    "lat": -23.5495,
    "lng": -46.6360
  }
}
```

### Status da Viagem

| Status | Descrição |
|--------|-----------|
| `waiting_driver` | Aguardando aceite de motorista |
| `driver_assigned` | Motorista aceitou a corrida |
| `driver_waiting_passenger` | Motorista aguardando passageiro |
| `completed` | Corrida concluída |
| `cancelled` | Corrida cancelada |

---

## 7. Notificações Webhook

O sistema envia notificações automáticas sobre mudanças de status das viagens para um endpoint webhook configurado.

### Configuração do Webhook

Para receber notificações, informe a URL do seu webhook durante o cadastro da empresa ou através do suporte técnico.

### Estrutura das Notificações

#### **Headers Recebidos**

```http
POST https://sua-api.com/webhooks/coopgo
Content-Type: application/json
Authorization: Bearer <jwt_token_empresa>
```

#### **Payload da Notificação**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "category": "BASICO",
  "externalId": "EXT_001234",
  "status": "driver_assigned",
  "origin": {
    "lat": -23.5505,
    "lng": -46.6333
  },
  "destination": {
    "lat": -23.5489,
    "lng": -46.6388
  },
  "driver": {
    "name": "Carlos Silva",
    "contact": "11999887766",
    "car": {
      "plate": "ABC-1234",
      "color": "Branco",
      "model": "Toyota Corolla"
    }
  },
  "supplier": {
    "name": "TransPorte Rápido Ltda"
  },
  "eta": 300,
  "updatedLocation": {
    "lat": -23.5495,
    "lng": -46.6360
  }
}
```

### Eventos que Geram Notificações

| Evento | Status | Descrição |
|--------|--------|-----------|
| Motorista aceita | `driver_assigned` | Motorista aceitou a corrida |
| Motorista aguarda | `driver_waiting_passenger` | Motorista chegou no local |
| Corrida finalizada | `completed` | Corrida foi concluída |
| Corrida cancelada | `cancelled` | Corrida foi cancelada |
| Atualização localização | (mesmo status) | Posição do motorista atualizada |

### Implementação do Webhook

Seu endpoint deve:

1. **Responder com HTTP 200** para confirmar recebimento
2. **Processar rapidamente** (timeout de 5 segundos)
3. **Validar o token JWT** no header Authorization
4. **Usar HTTPS** obrigatoriamente

#### Exemplo de Implementação

```javascript
// Node.js + Express
app.post('/webhooks/coopgo', (req, res) => {
  const { id, status, driver, updatedLocation } = req.body;
  
  // Processar atualização
  console.log(`Viagem ${id}: ${status}`);
  
  // Responder rapidamente
  res.status(200).json({ success: true });
});
```

---

## Códigos de Erro

### Códigos HTTP

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso |
| `201` | Recurso criado com sucesso |
| `400` | Dados inválidos |
| `401` | Não autorizado |
| `403` | Acesso negado |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: CNPJ já existe) |
| `500` | Erro interno do servidor |

### Códigos de Erro Específicos

| Código | Descrição |
|--------|-----------|
| `INVALID_API_KEY` | API Key inválida |
| `INVALID_TOKEN` | Token JWT inválido |
| `EXPIRED_TOKEN` | Token JWT expirado |
| `CNPJ_JA_EXISTS` | CNPJ já cadastrado |
| `EMPRESA_NOT_FOUND` | Empresa não encontrada |
| `RIDE_NOT_FOUND` | Viagem não encontrada |
| `RIDE_ALREADY_CANCELED` | Viagem já cancelada |
| `RIDE_CANNOT_BE_CANCELED` | Viagem não pode ser cancelada |
| `INVALID_COORDINATES` | Coordenadas inválidas |
| `NO_CARS_AVAILABLE` | Nenhum carro disponível |

---

## Ambientes

### Produção
```
https://api.coopgo.com.br
```

### Homologação
```
https://api-staging.coopgo.com.br
```

---

## Suporte Técnico

Para dúvidas técnicas ou problemas de integração:

- **Email**: suporte-api@coopgo.com.br
- **WhatsApp**: (11) 99999-0000
- **Horário**: Segunda a Sexta, 8h às 18h

### Documentação Adicional

- **Postman Collection**: Disponível mediante solicitação
- **SDKs**: Node.js, PHP, Java (em desenvolvimento)
- **Webhooks Tester**: Ferramenta online para testar notificações

---

## Changelog

### v1.2.0 (Atual)
- Adicionado suporte a coordenadas intermediárias
- Melhorado sistema de webhooks
- Novos códigos de erro específicos

### v1.1.0 
- Adicionado endpoint de consulta de status
- Implementado sistema de notificações webhook
- Melhorias na autenticação JWT

### v1.0.0
- Lançamento inicial da API
- Endpoints básicos de CRUD
- Autenticação via API Key

---

*Última atualização: Janeiro 2024*