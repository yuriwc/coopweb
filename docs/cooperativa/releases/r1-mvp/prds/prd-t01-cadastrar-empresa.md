# PRD-T01: Cadastrar Empresa

> Tela de produto do módulo Cooperativa — CoopWeb.
> Localização da rota: `app/(private)/cooperativa/[cooperativa]/empresas/nova/page.tsx` (rota nova).
> Pré-condição: operador autenticado (role `COOPERATIVA`), vinculado a uma cooperativa.
> Pré-requisitos técnicos: modo **produção** (não é protótipo) — sem PRD-T00/T99. Backend real `taxi-back` (Spring Boot), endpoint `POST /api/v1/empresa`. Autenticação via cookie `token` (JWT), lido com `getToken()`.
> Card/tarefa: — · Validação: pendente

## 1. Objetivo

O operador da cooperativa cadastra uma empresa cliente nova — primeiro passo do relacionamento comercial com cada cliente novo, uso esporádico (onboarding). A empresa criada é automaticamente vinculada à cooperativa do operador logado.

## 2. Layout

### 2.1 Referência

```
┌──────────────────────────────────────────────────────────────┐
│ [← Voltar]   Cadastrar Empresa                                │
│              Nova empresa cliente da cooperativa              │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Dados da empresa                                        │  │
│  │                                                          │  │
│  │  Nome da empresa *        [_________________________]   │  │
│  │  CNPJ *                   [___.___.___/____-__]         │  │
│  │  Dia de fechamento *      [10]  (1-31)                  │  │
│  │                                                          │  │
│  │  Endereço                                                │  │
│  │  Rua *              [____________________]  Número * [__]│  │
│  │  Bairro *           [____________________]              │  │
│  │  Cidade *  [______________]  Estado * [__]  CEP * [_____]│  │
│  │  Telefone *        [_______________]                     │  │
│  │  E-mail (opcional) [_______________]                     │  │
│  │  Referência (opcional) [__________________________]      │  │
│  │                                                          │  │
│  │                        [ Cancelar ]  [ Cadastrar empresa]│  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Variantes

Não aplicável — UC-COO-01 §7 confirma que não há variação por dimensão.

## 2.5 Glossário UI ↔ código

| Termo do domínio (código) | Termo na UI | O que é (1-2 frases — só se ambíguo) | Observação |
|---|---|---|---|
| `Empresa` | "Empresa" | — | UC-COO-01 §2 |
| `dataFechamento` | "Dia de fechamento do período" | Dia do mês em que o ciclo de faturamento da empresa fecha | UC-COO-01 §2; default 10 (EF Macro Cadastros e Frota §4.2) |
| `Contato` (rua/numero/bairro/cidade/cep/estado/telefone/email/referencia) | "Endereço" (campos abertos, sem rótulo de entidade própria) | — | EF Macro §4.2 Empresa |

### 2.5.1 Wording por regime/contexto

`Não aplicável — domínio opera em contexto único (EF Macro Cadastros e Frota §12.1).`

## 3. Componentes (mapping pré-validado contra o DS)

| Elemento da tela | Componente do DS | Status | Observação |
|---|---|---|---|
| Casca visual da página | `<div className="bg-gray-50 dark:bg-gray-900">` — mesmo padrão "clean" do dashboard da cooperativa (`app/(private)/cooperativa/[cooperativa]/page.tsx`), sem blur/gradiente decorativo | OK | Ver §9 — decisão revisada (era "Liquid Glass" na primeira rodada, revertida) |
| Cabeçalho com botão Voltar | `<Button variant="bordered">` (`@heroui/button`) dentro do bloco header glass | OK | — |
| Cartão do formulário | `<Card>` / `<CardHeader>` / `<CardBody>` (`@heroui/card`) | OK | — |
| Formulário | `<Form action={action}>` (`@heroui/form`) + `useActionState` | OK | Mesmo padrão de `app/(private)/[id]/configuracoes/company-config-form.tsx` |
| Campos de texto (nome, CNPJ, rua, número, bairro, cidade, estado, CEP, telefone, e-mail, referência) | `<Input>` (`@heroui/input`) | OK | — |
| Campo numérico (dia de fechamento) | `<Input type="number" min={1} max={31}>` | OK | — |
| Botões Cancelar / Cadastrar empresa | `<Button>` (`@heroui/button`) | OK | `isLoading` no botão de submit durante o envio |
| Toast de sucesso/erro | `ShowToast` (`src/components/Toast`, envolve `@heroui/toast`) | OK | — |
| Ícones | `@iconify/react` (`solar:*`) | OK | — |

## 4. Interações (INT-T01-NNN)

- **INT-T01-001** Quando o operador preenche os campos obrigatórios e clica em "Cadastrar empresa", o sistema deve enviar os dados ao backend (`POST /api/v1/empresa`) e, em caso de sucesso, exibir um toast de confirmação e limpar o formulário para permitir um novo cadastro.
- **INT-T01-002** Quando o backend recusa a criação por CNPJ duplicado, o sistema deve exibir um toast de erro com a mensagem de negócio "CNPJ já cadastrado", preservando os dados já preenchidos no formulário.
- **INT-T01-003** Se o operador tenta submeter com um campo obrigatório vazio, então o sistema deve bloquear o envio antes de chamar o backend e sinalizar visualmente o campo pendente (`isRequired`/`isInvalid` nativos do `Input`).
- **INT-T01-004** Enquanto a submissão está em andamento, o sistema deve desabilitar o botão "Cadastrar empresa" e exibir estado de carregamento (`isLoading`).
- **INT-T01-005** Quando o operador clica em "Cancelar" ou "Voltar", o sistema deve navegar de volta ao painel da cooperativa sem enviar dados.

## 5. Estados (default, loading, vazio, erro, variantes)

- **Default** — formulário vazio, "Dia de fechamento" pré-preenchido com 10.
- **Preenchendo** — validação inline de campos obrigatórios.
- **Enviando** — botão em `isLoading`, campos desabilitados.
- **Sucesso** — toast de sucesso, formulário limpo.
- **Erro de negócio (CNPJ duplicado)** — toast de erro, dados preservados.
- **Erro técnico/rede** — toast de erro genérico, dados preservados.

Sem FSM — 6 estados lineares, sem transições cruzadas ou bifurcação de decisão; a lista acima é suficiente (ver template §5, dispensa de diagrama para telas sem transições não-óbvias).

## 6. Side-effects (entre telas)

| Origem | Efeito nesta tela / em outras telas |
|---|---|
| Submissão bem-sucedida deste formulário | Empresa passa a existir no backend, disponível para: (a) cadastro de passageiros (UC-OPE-02, fora do escopo desta rodada); (b) filtro "Empresa" em **PRD-T05 (Faturas da Cooperativa)**, que consome `GET /empresa/cooperativa/{id}/label-value` — a nova empresa aparece no próximo carregamento dessa tela, sem necessidade de ação adicional aqui |

## 7. Dados Mockados (TS literal — exemplo de payload real)

```ts
// Payload enviado em POST /api/v1/empresa
const novaEmpresaPayload = {
  cooperativaID: "550e8400-e29b-41d4-a716-446655440000",
  nome: "TechCorp",
  cnpj: "12.345.678/0001-90",
  dataFechamento: 5,
  rua: "Av. Tancredo Neves",
  numero: "1632",
  bairro: "Caminho das Árvores",
  cidade: "Salvador",
  cep: "41820-021",
  estado: "BA",
  telefone: "(71) 99999-0000",
  email: "financeiro@techcorp.com.br", // opcional
  referencia: "Ao lado do shopping", // opcional
};

// Resposta de erro de negócio (CNPJ duplicado) — 400
const erroCnpjDuplicado = {
  status: 400,
  message: "CNPJ já cadastrado",
};
```

## 8. Regras de Negócio aplicadas no front (FR-T01-NNN)

- **FR-T01-001** Quando o operador submete o formulário com sucesso, o sistema deve vincular a empresa criada à cooperativa do operador autenticado, sem exigir seleção manual de cooperativa. _(EF Macro Cadastros e Frota §5 RF-05, regra R1)_
- **FR-T01-002** Se o CNPJ informado já pertencer a outra empresa cadastrada, então o sistema deve recusar a criação e exibir a mensagem de negócio "CNPJ já cadastrado". _(EF Macro §5 RF-05, regra R2; corrigido em 2026-08-15, P-07)_
- **FR-T01-003** Onde o CNPJ informado não seguir o formato padrão, o sistema deve aceitar o cadastro do mesmo jeito — não há validação de formato de CNPJ hoje, comportamento atual aceito pela EF Macro. O campo usa máscara de exibição só para legibilidade, sem bloquear submissão. _(UC-COO-01 §6 E2; EF Macro §8, premissa)_
- **FR-T01-004** Onde o operador não informar o dia de fechamento, o sistema deve usar 10 como valor padrão. _(EF Macro §4.2, Empresa.dataFechamento)_

## 9. Notas de Implementação

- Rota nova: `app/(private)/cooperativa/[cooperativa]/empresas/nova/page.tsx` (Server Component, lê `params.cooperativa` e `getToken()`) + client component `empresa-form.tsx` espelhando o padrão de `app/(private)/[id]/configuracoes/company-config-form.tsx` (`useActionState` + Server Action `"use server"`).
- Server Action chama `POST ${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa` com `Authorization: Bearer <token>` e `cooperativaID: params.cooperativa` no corpo.
- **Casca visual — decisão revisada (2026-08-15):** a primeira rodada deste PRD adotava o padrão "Liquid Glass" (fundo gradiente + blur + partículas) de `faturas-client.tsx`/`ride/realtime/viagem-list.tsx`. Revertido a pedido do PO: esse padrão é minoritário no código real (só 3 telas o usam) e "não fica legal" para o tipo de tela operacional que esta rodada cobre (formulários e tabelas de gestão, uso diário). Convenção adotada: casca limpa `bg-gray-50 dark:bg-gray-900` (mesmo fundo do dashboard da cooperativa), `<Card>` HeroUI padrão com borda sutil (`border border-transparent dark:border-default-100`, mesmo tom de `vouchers-cooperativa-table.tsx`), sem gradiente nem blur decorativo — mesma linha de `company-config-form.tsx`, `PendingRides` e `FilasDisplay`, que são hoje a maioria do app.
- **Hierarquia de botões:** ação primária da tela (aqui, "Cadastrar empresa") sempre no rodapé do formulário, à direita, com "Cancelar" à esquerda dela — nunca no cabeçalho. Cabeçalho reservado só para navegação (Voltar) e título.
- Sem relógio simulado — é produção; nenhuma lógica desta tela depende de data/hora atual.
- Adicionar um novo `ActionButton` ("Cadastrar Empresa") na seção "Ações Rápidas" de `app/(private)/cooperativa/[cooperativa]/page.tsx`, apontando para a rota nova.
- Dark mode: seguir classes `dark:` já usadas nos componentes HeroUI da cooperativa (tratamento automático de tema).

## 10. Critérios de Aceite (AC-T01-NNN + NFR-T01-NNN)

### AC-T01-001 — Cadastrar empresa cliente com sucesso

**Cenário 1 (happy):**
> Dado que o operador está autenticado e vinculado à "Cooperativa Taxi Salvador"
> E o formulário de cadastro de empresa está aberto
> Quando o operador informa nome "TechCorp", CNPJ "12.345.678/0001-90", dia de fechamento 5 e o endereço completo
> Então o sistema cria a empresa "TechCorp" vinculada à "Cooperativa Taxi Salvador"
> E exibe um toast de sucesso "Empresa cadastrada com sucesso"
> E limpa o formulário, pronto para um novo cadastro

**Cenário 2 (borda):**
> Dado que o operador deixa o campo "Dia de fechamento" em branco
> Quando ele preenche os demais campos obrigatórios e submete
> Então o sistema usa 10 como dia de fechamento padrão _(EF Macro §4.2)_

**Cenário 3 (erro):**
> Dado que o operador não preencheu o campo "Nome da empresa"
> Quando ele clica em "Cadastrar empresa"
> Então o sistema bloqueia o envio, sinaliza o campo obrigatório e não chama o backend

_(↔ US-COO-01.1)_

### AC-T01-002 — Recusar CNPJ duplicado

**Cenário 1 (happy — recusa correta):**
> Dado que já existe uma empresa cadastrada com o CNPJ "12.345.678/0001-90"
> Quando o operador tenta cadastrar uma nova empresa com o mesmo CNPJ "12.345.678/0001-90"
> Então o sistema recusa a criação e exibe o toast de erro "CNPJ já cadastrado" _(corrigido em 2026-08-15)_
> E os dados preenchidos permanecem no formulário para correção

**Cenário 2 (borda):**
> Dado que o operador corrige o CNPJ para um valor ainda não utilizado
> Quando ele submete novamente
> Então o sistema cria a empresa normalmente

**Cenário 3 (erro/fallback):**
> Dado que o servidor retorna um erro inesperado (500)
> Quando o operador submete o formulário
> Então o sistema exibe um toast de erro genérico ("Erro ao cadastrar empresa. Tente novamente.") e preserva os dados preenchidos

_(↔ US-COO-01.2, cenário de erro)_

### Âncoras visuais

- **AC-T01-003 (variabilidade)** — Cada campo do formulário reflete o dado real digitado pelo operador; não há placeholder decorativo tratado como valor nem KPI estático na tela.
- **AC-T01-004 (CTA insubstituível)** — Existe um único caminho para cadastrar empresa ("Cadastrar empresa"); não há botão duplicado com o mesmo efeito.
- **AC-T01-005 (paleta canônica)** — Toast de sucesso usa `color="success"`; toast de erro usa `color="danger"` — cores nativas do `@heroui/toast`, sem tom inventado.
- **AC-T01-006 (defaults do DS)** — Espaçamento entre campos e contraste de rótulos seguem os defaults do `@heroui/form`/`@heroui/input`; nenhum valor de padding/contraste é sobrescrito sem necessidade.

### NFRs quantificados

- **NFR-T01-001 Acessibilidade** — WCAG 2.1 AA; navegação por teclado completa no formulário; contraste ≥ 4.5:1 (texto normal); todo campo tem `label` associado (nativo do `@heroui/input`).
- **NFR-T01-002 Reatividade cross-tela** — A empresa criada aparece no filtro "Empresa" de **PRD-T05 (Faturas da Cooperativa)** no próximo carregamento dessa tela (sem exigir ação manual além de reabrir/atualizar a tela de faturas).
- **NFR-T01-003 Tratamento de falha de rede** — Toda falha de rede/timeout exibe toast de erro em até 10s percebidos, sem travar a tela nem perder os dados preenchidos.

## 11. Referências

- UC-COO-01 (Cadastrar empresa) — §5 (cenário principal), §6 (E1/E2), §8 (regras), §10 (fora de escopo), §11 (Gherkin).
- EF Macro Cadastros e Frota — §4.2 (modelo Empresa), §5 RF-05 (cadastro de empresa), §6 (P-07, duplicidade de CNPJ).
- PRDs vizinhos: **PRD-T05 (Faturas da Cooperativa)** — consome a lista de empresas criada aqui via `GET /empresa/cooperativa/{id}/label-value`.
- **Dependência de feature externa**: este UC não cobre consulta/edição/listagem de empresas (RF-06, fora do escopo desta rodada — nenhum UC de listagem de empresas foi redigido ainda). Ver Achados para revisar.
