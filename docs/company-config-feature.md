# Company Configuration Feature

Esta nova funcionalidade permite gerenciar as configurações específicas de cada empresa no sistema CoopWeb.

## Arquivos Criados

### 1. Model (`src/model/company-config.ts`)

- Define as interfaces `CompanyConfig` e `CompanyConfigsUpdateDto`
- Estrutura os dados das configurações da empresa

### 2. Service (`src/services/company-config.ts`)

- `getCompanyConfigs(empresaId)`: Busca configurações da empresa
- `updateCompanyConfigs(empresaId, data)`: Atualiza configurações da empresa
- Implementa autenticação via Bearer token
- Tratamento de erros e logs

### 3. Páginas e Componentes

- **Página Principal** (`app/(private)/[id]/configuracoes/page.tsx`): Server-side component que recebe os parâmetros da rota
- **Formulário Interativo** (`app/(private)/[id]/configuracoes/company-config-form.tsx`): Client component com toda a lógica interativa
- Formulário reativo com validação
- Toast notifications para feedback
- Carregamento automático das configurações atuais
- Atualização em tempo real após modificações

## Funcionalidades

### Configurações Disponíveis

1. **Data de Fechamento**: Dia do mês para fechamento (1-31)
2. **Cálculo Automático**: Ativação/desativação do cálculo por quilômetro (agora com HeroUI Switch)
3. **Preço por Km**: Valor cobrado por quilômetro rodado

### Navegação

- Adicionado item "Configurações" no menu dropdown
- Acesso via: `/[empresaId]/configuracoes`

## Endpoints da API

### GET `/api/company-configs/empresa/{empresaId}`

Busca as configurações atuais da empresa ou cria configurações padrão.

### PUT `/api/company-configs/empresa/{empresaId}`

Atualiza as configurações da empresa com validação.

#### Exemplo de Request Body:

```json
{
  "dataFechamento": 15,
  "calcularPrecoAutomatico": true,
  "precoPorKm": 2.5
}
```

#### Exemplo de Response:

```json
{
  "id": "uuid-config",
  "dataFechamento": 15,
  "calcularPrecoAutomatico": true,
  "precoPorKm": 2.5,
  "empresaId": "uuid-empresa",
  "empresaNome": "Nome da Empresa"
}
```

## Validações

- **dataFechamento**: Entre 1 e 31 (opcional)
- **calcularPrecoAutomatico**: true/false (opcional)
- **precoPorKm**: Maior que zero (opcional)

Todos os campos são opcionais - você pode enviar apenas os que deseja atualizar.

## Como Usar

1. **Navegar**: Entre em uma empresa e clique no menu > Configurações
2. **Visualizar**: Veja as configurações atuais na seção inferior
3. **Editar**: Modifique os campos desejados no formulário
4. **Salvar**: Clique em "Salvar Configurações"
5. **Feedback**: Receba confirmação via toast notification

## Tecnologias Utilizadas

- **Next.js 15**: App Router com server e client components separados
- **HeroUI**: Componentes de interface (incluindo Switch)
- **TypeScript**: Tipagem estática
- **React Hooks**: useState, useEffect, useActionState
- **Fetch API**: Comunicação com backend
- **Toast Notifications**: Feedback visual

## Estrutura de Pastas

```
src/
├── model/
│   └── company-config.ts
└── services/
    └── company-config.ts

app/(private)/[id]/
├── configuracoes/
│   ├── page.tsx (server component)
│   └── company-config-form.tsx (client component)
└── menu.tsx (modificado)
```

## Melhorias Futuras

- [ ] Histórico de mudanças nas configurações
- [ ] Configurações avançadas (cores, logos, etc.)
- [ ] Validação de permissões por usuário
- [ ] Backup/restore de configurações
- [ ] Configurações por módulo/funcionalidade
