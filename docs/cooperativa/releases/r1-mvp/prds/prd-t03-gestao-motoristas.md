# PRD-T03: Gestão de Motoristas

> Tela de produto do módulo Cooperativa — CoopWeb.
> Localização da rota: `app/(private)/cooperativa/[cooperativa]/motoristas/page.tsx` (rota nova).
> Pré-condição: operador autenticado (role `COOPERATIVA`), vinculado a uma cooperativa.
> Pré-requisitos técnicos: modo **produção** — sem PRD-T00/T99. Backend real `taxi-back`, endpoints `GET /api/v1/cooperativa/{id}/motoristas`, `POST /api/v1/motorista/{cpf}`, `POST /api/v1/motorista/import/{cooperativaCode}`, `POST /api/v1/motorista/{id}/veiculo`, `PATCH /api/v1/motorista/{id}/bloquear`, `PATCH /api/v1/motorista/{id}/reativar`.
> Card/tarefa: — · Validação: pendente

## 1. Objetivo

O operador da cooperativa gerencia o ciclo de vida cadastral dos motoristas em um único lugar: cadastra motoristas novos (manualmente ou em massa via planilha), vincula/substitui o veículo de um motorista, e bloqueia/reativa motoristas problemáticos. Hoje não existe nenhuma tela de listagem de motoristas na cooperativa — esta tela consolida 4 UCs porque todos operam sobre a mesma entidade (`Motorista`) e o mesmo ponto de entrada natural (uma lista de motoristas).

## 2. Layout

### 2.1 Referência

```
┌──────────────────────────────────────────────────────────────────┐
│ [← Voltar]   Gestão de Motoristas          42 motoristas          │
│              Cadastro, veículos e bloqueio                        │
│  [Buscar por nome ou CPF...............]        [+ Novo motorista]│
├──────────────────────────────────────────────────────────────────┤
│  NOME             CPF            CADASTRO    VEÍCULO      STATUS  │ AÇÕES
│  João Silva       123.456.789-00 Completo     ABC1D23      Ativo  │ [Veículo] [Bloquear]
│  Maria Santos     987.654.321-00 Mínimo        sem veículo  Ativo  │ [Veículo] [Bloquear]
│  Carlos Lima      111.222.333-44 Completo     XYZ9E88      Bloqueado│ [Veículo] [Reativar]
└──────────────────────────────────────────────────────────────────┘

Modal "Novo motorista" (abas):
┌─────────────────────────────────────────┐
│  [ Manual ]  [ Importar planilha ]        │
│  ────────────────────────────────────    │
│  (aba Manual)                             │
│  CPF *            [___________________]  │
│  CNH *             [___________________]  │
│  Rua * [__________________] Número * [__] │
│  Bairro * [______] Cidade * [_____] ...   │
│                                            │
│              [Cancelar]  [Cadastrar]      │
└─────────────────────────────────────────┘

Modal "Vincular veículo":
┌─────────────────────────────────────────┐
│ Vincular veículo — João Silva             │
│ ⚠ Este motorista já tem o veículo ABC1D23 │
│   vinculado. Ao continuar, esse veículo   │
│   ficará sem motorista.                   │
│                                            │
│  Marca * [______] Modelo * [___________]  │
│  Placa * [_______] Cor * [____________]   │
│  Capacidade * [__] Categoria * [Básico ▾] │
│  Ano * [____] Chassi * [________________] │
│                                            │
│              [Cancelar]  [Vincular]       │
└─────────────────────────────────────────┘

Modal "Bloquear motorista":
┌─────────────────────────────────────────┐
│ Bloquear João Silva                       │
│  Motivo * [______________________________]│
│              [Cancelar]  [Bloquear]       │
└─────────────────────────────────────────┘
```

### 2.2 Variantes

- **Modal "Novo motorista" — aba Manual** (UC-COO-03): CPF + CNH + endereço; cria cadastro **mínimo**.
- **Modal "Novo motorista" — aba Importar planilha** (UC-COO-04): upload de arquivo `.xlsx`/`.xls`; cria cadastro **completo** em massa, com resumo de processamento ao final.
- **Modal "Vincular veículo"** (UC-COO-05): mesmo modal para vincular pela primeira vez ou substituir — o aviso de substituição (linha ⚠) só aparece quando o motorista já tem veículo.
- **Ação "Bloquear" / "Reativar"** (UC-COO-09): botão de linha alterna entre os dois rótulos conforme `motorista.ativo`; "Bloquear" abre modal (exige motivo), "Reativar" executa direto após confirmação simples (sem campo adicional).

## 2.5 Glossário UI ↔ código

| Termo do domínio (código) | Termo na UI | O que é (1-2 frases — só se ambíguo) | Observação |
|---|---|---|---|
| `Motorista` | "Motorista" | — | — |
| `cnhNumero` | "CNH" | — | UC-COO-03 §2 |
| `cooperativaCode` | (não exibido — resolvido pelo login do operador) | — | UC-COO-03 §2 |
| Cadastro "completo" (via importação) vs "mínimo" (via manual) | Coluna "Cadastro": "Completo" / "Mínimo" | Completo = todos os ~50 campos (documentos, validades, saúde, financeiro), populados só pela importação em planilha; Mínimo = só CNH + endereço, populados pelo cadastro manual | EF Macro Cadastros e Frota §12 — glossário sinaliza explicitamente que a UI deveria deixar isso claro (RN-07); ver FR-T03-006 |
| `Veiculo` | "Veículo" | — | UC-COO-05 §2 |
| `CategoriaVeiculo` | "Categoria" | Básico, Premium, Executivo, Van, Micro-ônibus ou Adaptado | UC-COO-05 §2 |
| `bloquearMotorista` (`ativo = false`) | "Bloquear" | Tira o motorista de operação sem apagar o cadastro | UC-COO-09 §2 |
| `reativarMotorista` (`ativo = true`) | "Reativar" | — | UC-COO-09 §2 |
| `motivoBloqueio` | "Motivo" | — | UC-COO-09 §2 |
| Tabela `Status` (ATIVO/BLOQUEADO/SUSPENSO/PENDENTE) | (não exibida) | Tabela vestigial, nunca alterada na prática — a coluna "Status" da UI reflete o campo `ativo`, não esta tabela | EF Macro §4.2, §12 — evitar confundir com `ativo`; ver Achados |

### 2.5.1 Wording por regime/contexto

`Não aplicável — domínio opera em contexto único (EF Macro Cadastros e Frota §12.1).`

## 3. Componentes (mapping pré-validado contra o DS)

| Elemento da tela | Componente do DS | Status | Observação |
|---|---|---|---|
| Casca visual da página | `<div className="bg-gray-50 dark:bg-gray-900">` — mesmo padrão "clean" do dashboard da cooperativa, sem blur/gradiente decorativo | OK | Decisão revisada — ver §9 (era "Liquid Glass" na primeira rodada) |
| Busca por nome/CPF | `<Input>` com ícone de busca (`@heroui/input`) | OK | Filtragem client-side, mesmo padrão de `programadas-client.tsx` |
| Tabela de motoristas | `<Table>`/`<TableHeader>`/`<TableColumn>`/`<TableBody>`/`<TableRow>`/`<TableCell>` (`@heroui/table`) | OK | Mesmo padrão de `vouchers-cooperativa-table.tsx` |
| Chip de status (Ativo/Bloqueado) | `<Chip>` (`@heroui/chip`) | OK | — |
| Chip de tipo de cadastro (Completo/Mínimo) | `<Chip variant="bordered">` | OK | — |
| Botão "Novo motorista" | `<Button color="primary">` | OK | — |
| Modal com abas (Manual / Importar planilha) | `<Modal>` + `<Tabs>`/`<Tab>` (`@heroui/tabs`) | OK | — |
| Upload de planilha | `<input type="file" accept=".xlsx,.xls">` estilizado, sem componente HeroUI dedicado a upload | gap | Implementar local com estilo consistente (label customizado + `Input` visualmente escondido), padrão comum em apps HeroUI |
| Resumo de importação (processados/sucesso/erro) | `<Card>` + `<Chip>` por contagem | OK | — |
| Select de categoria de veículo | `<Select>`/`<SelectItem>` (`@heroui/select`) | OK | — |
| Campos de texto/numéricos (veículo, endereço, motivo) | `<Input>`/`<Textarea>` — **`@heroui/input` não expõe `Textarea` dedicado** | gap | Usar `<Input>` multilinha não é nativo; usar `<textarea>` HTML estilizado com classes Tailwind consistentes com o restante do formulário, ou `@heroui/input` em modo padrão para "Motivo" (texto curto, sem quebra de linha, já que UC não exige multilinha) |
| Botões de ação por linha (Veículo, Bloquear/Reativar) | `<Button size="sm" variant="flat">` | OK | — |
| Toast de sucesso/erro | `ShowToast` (`src/components/Toast`) | OK | — |
| Modal de confirmação (reativar) | `<Modal>` simples, mesmo padrão de `programadas/modal/confirm.tsx` | OK | — |

## 4. Interações (INT-T03-NNN)

- **INT-T03-001** Quando o operador clica em "Novo motorista", o sistema deve abrir o modal com a aba "Manual" ativa por padrão.
- **INT-T03-002** Quando o operador preenche CPF, CNH e endereço na aba Manual e confirma, o sistema deve enviar `POST /motorista/{cpf}` e, em caso de sucesso, fechar o modal, exibir toast de sucesso e adicionar o motorista à lista com o rótulo "Mínimo" na coluna Cadastro.
- **INT-T03-003** Quando o operador seleciona um arquivo `.xlsx`/`.xls` na aba "Importar planilha" e confirma o envio, o sistema deve enviar `POST /motorista/import/{cooperativaCode}` e, ao final, exibir um resumo com quantas linhas foram processadas, quantas tiveram sucesso e quantas deram erro.
- **INT-T03-004** Quando o operador clica em "Vincular veículo" (ou "Substituir veículo", se já houver um) em uma linha, o sistema deve abrir o modal pré-avisando sobre a substituição quando aplicável, e ao confirmar, enviar `POST /motorista/{id}/veiculo`.
- **INT-T03-005** Quando o operador clica em "Bloquear" em uma linha, o sistema deve abrir o modal exigindo o motivo; ao confirmar, enviar `PATCH /motorista/{id}/bloquear` com o motivo no corpo.
- **INT-T03-006** Quando o operador clica em "Reativar" em uma linha, o sistema deve pedir confirmação simples (sem campo adicional) e, ao confirmar, enviar `PATCH /motorista/{id}/reativar`.
- **INT-T03-007** Se qualquer uma das chamadas acima falhar, então o sistema deve exibir um toast de erro com a mensagem de negócio retornada pelo backend (ou uma mensagem genérica quando o backend não fornecer uma), preservando o estado anterior da tela.

## 5. Estados (default, loading, vazio, erro, variantes)

- **Default** — tabela carregada com todos os motoristas da cooperativa.
- **Vazio** — nenhum motorista cadastrado ainda (cooperativa recém-criada).
- **Buscando** — filtro de nome/CPF aplicado, tabela reduzida.
- **Modal Novo Motorista (Manual) — preenchendo / enviando / sucesso / erro de negócio (CPF sem conta de usuário; CPF já cadastrado) / erro técnico**.
- **Modal Novo Motorista (Importar planilha) — arquivo selecionado / enviando / resumo exibido (com contagem de erro > 0 destacada) / erro técnico (arquivo vazio ou formato errado)**.
- **Modal Vincular Veículo — preenchendo / com aviso de substituição / enviando / sucesso / erro (placa duplicada — mensagem genérica, ver FR-T03-005) / erro técnico**.
- **Modal Bloquear — preenchendo motivo / enviando / sucesso / erro (motorista não encontrado)**.
- **Confirmação Reativar — aberta / enviando / sucesso / erro**.

Sem FSM formal do motorista (`ativo`/`bloqueado` são só 2 estados, transição direta em ambos os sentidos) — a lista de estados de tela acima já cobre a complexidade real, que está nos **múltiplos pontos de entrada**, não em transições não-óbvias.

## 6. Side-effects (entre telas)

| Origem | Efeito nesta tela / em outras telas |
|---|---|
| Cadastro manual ou importação bem-sucedidos | Motorista passa a existir e fica disponível para: vincular veículo (ação nesta mesma tela); entrar na fila de atendimento (**PRD-T02**, ação do próprio motorista, fora desta rodada); ser atribuído a uma viagem (**PRD-T04**) |
| Bloqueio de motorista | Motorista deixa de aparecer como opção selecionável em **PRD-T04 (Atribuição Manual de Motorista)** — o backend já recusa o disparo direto para motorista bloqueado; a lista de autocomplete de T04 deve refletir isso assim que recarregada |
| Vínculo de veículo | Se o motorista já tinha veículo, o veículo anterior aparece "sem motorista vinculado" em qualquer tela futura de gestão de veículos (fora do escopo desta rodada — nenhum UC de listagem de veículos foi redigido ainda) |

## 7. Dados Mockados (TS literal — exemplo de payload/resposta real)

```ts
// Item da lista (GET /cooperativa/{id}/motoristas)
type MotoristaListItem = {
  id: string;
  nome: string | null; // null quando cadastro é "mínimo" (não preenchido pela via manual)
  cpf: string;
  cnhNumero: string;
  ativo: boolean;
  motivoBloqueio: string | null;
  veiculo: { id: string; placa: string; modelo: string } | null;
  cadastroCompleto: boolean; // derivado no front: true se nome/documentos preenchidos (via importação)
};

const motoristasExemplo: MotoristaListItem[] = [
  { id: "mot-001", nome: "João Silva", cpf: "123.456.789-00", cnhNumero: "01234567890", ativo: true, motivoBloqueio: null, veiculo: { id: "vei-001", placa: "ABC1D23", modelo: "Corolla" }, cadastroCompleto: true },
  { id: "mot-002", nome: null, cpf: "987.654.321-00", cnhNumero: "09876543210", ativo: true, motivoBloqueio: null, veiculo: null, cadastroCompleto: false },
  { id: "mot-003", nome: "Carlos Lima", cpf: "111.222.333-44", cnhNumero: "01122233344", ativo: false, motivoBloqueio: "Reclamação grave de passageiro", veiculo: { id: "vei-002", placa: "XYZ9E88", modelo: "Etios" }, cadastroCompleto: true },
];

// Payload cadastro manual (POST /motorista/{cpf})
const cadastroManualPayload = {
  cnh: "01234567890",
  cooperativaCode: "COOP-SSA-01",
  rua: "Rua das Flores", numero: "100", bairro: "Barra", cidade: "Salvador", cep: "40140-110", estado: "BA",
  telefone: "(71) 98888-0000",
};

// Payload vincular veículo (POST /motorista/{id}/veiculo)
const veiculoPayload = {
  marca: "Toyota", modelo: "Corolla", placa: "ABC1D23", cor: "Prata",
  capacidade: 4, categoria: "BASICO", ano: 2022, chassi: "9BWZZZ377VT004251",
};

// Payload bloqueio (PATCH /motorista/{id}/bloquear)
const bloqueioPayload = { motivo: "CNH vencida desde 01/08/2026" };

// Resumo de importação (resposta de POST /motorista/import/{cooperativaCode})
const resumoImportacao = { totalLinhas: 4, sucesso: 2, erro: 2 };
```

## 8. Regras de Negócio aplicadas no front (FR-T03-NNN)

- **FR-T03-001** Se não existir conta de usuário com `username = CPF` para o CPF informado na aba Manual, então o sistema deve recusar o cadastro. _(EF Macro Cadastros e Frota §5 RF-07, regra R3; UC-COO-03 §6 E1)_
- **FR-T03-002** Se já existir um motorista cadastrado para o CPF informado, então o sistema deve recusar o cadastro e sinalizar que o caminho correto é usar "Vincular veículo" para complementar o cadastro existente. _(EF Macro §5 RF-07, regra R2; UC-COO-03 §6 E2)_
- **FR-T03-003** Quando a importação processa a planilha, o sistema deve continuar processando as demais linhas mesmo que uma linha específica falhe, e ao final exibir quantas foram processadas, quantas tiveram sucesso e quantas deram erro. _(EF Macro §5 RF-08, regra R3)_
- **FR-T03-004** Onde a linha da planilha vier com campos de endereço ou de veículo em branco, o sistema deve aceitar e informar no resumo que valores padrão foram aplicados pelo backend (endereço "Não informado"/CEP "00000-000"; veículo categoria Básico, capacidade 4, ano 2020) — o front não precisa recalcular esses defaults, apenas exibi-los quando vierem na resposta. _(EF Macro §6 RN-08)_
- **FR-T03-005** Se a placa informada ao vincular veículo já pertencer a outro veículo, então o sistema deve exibir uma mensagem de erro best-effort ("Não foi possível cadastrar o veículo — verifique se a placa já está em uso"), já que o backend hoje devolve um erro técnico de banco em vez de uma mensagem de negócio amigável. _(EF Macro §6 RN-10; UC-COO-05 §6 E2, decisão pendente nº 2 — ver Achados)_
- **FR-T03-006** Quando um motorista tiver `nome`/documentos nulos (cadastro via manual), o sistema deve exibir "Mínimo" na coluna Cadastro; quando os campos estiverem preenchidos (via importação), exibir "Completo" — distinção pedida explicitamente pelo glossário da EF Macro. _(EF Macro §12, RN-07)_
- **FR-T03-007** Quando o motorista já tiver um veículo vinculado, o sistema deve avisar, antes de confirmar um novo vínculo, que o veículo atual ficará sem motorista — sem impedir a ação (comportamento atual do backend permite a substituição). _(EF Macro §6 RN-06 corrigido; UC-COO-05 §6 E1, decisão pendente nº 1 — ver Achados)_
- **FR-T03-008** Quando o operador bloqueia um motorista com uma corrida em andamento, o sistema deve informar que a corrida atual não será interrompida — o bloqueio só impede novas atribuições. _(EF Macro §5 RF-10, regra R6; UC-COO-09 §6 A1)_

## 9. Notas de Implementação

- Rota nova: `app/(private)/cooperativa/[cooperativa]/motoristas/page.tsx` — Server Component busca a lista inicial (`GET /cooperativa/{id}/motoristas`) e passa para um client component com os 4 fluxos.
- Cada ação (cadastro manual, importação, veículo, bloqueio, reativação) é uma Server Action `"use server"` própria, seguindo o padrão de `assign-motorista.ts`/`encerrar-programacao.ts` (retorno `{success, message}` + `revalidateTag("motoristas-cooperativa")`).
- Importação de planilha usa `FormData`/multipart — Server Action recebe o arquivo e repassa via `fetch` com `Content-Type: multipart/form-data` (não usar JSON.stringify no corpo).
- **Casca visual — decisão revisada (2026-08-15):** ver PRD-T01 §9 — casca limpa (`bg-gray-50 dark:bg-gray-900` + `<Card>` com borda sutil), mesma convenção de T01/T02.
- **Hierarquia de botões:** "Novo motorista" fica no cabeçalho, à direita, ao lado da busca. Ações por linha (Vincular veículo, Bloquear/Reativar) ficam sempre na última coluna da tabela, alinhadas à direita, na mesma ordem em todas as linhas — nunca reordenar conforme o estado do motorista (só trocar o rótulo Bloquear↔Reativar), para o operador não precisar reaprender a posição do botão a cada linha.
- Adicionar `ActionButton` ("Gestão de Motoristas") em "Ações Rápidas" de `app/(private)/cooperativa/[cooperativa]/page.tsx`.

## 10. Critérios de Aceite (AC-T03-NNN + NFR-T03-NNN)

### AC-T03-001 — Cadastrar motorista manualmente

**Cenário 1 (happy):**
> Dado que existe uma conta de usuário com nome de usuário "12345678900" (CPF)
> E não existe nenhum motorista cadastrado para o CPF "123.456.789-00"
> Quando o operador abre "Novo motorista", preenche a aba Manual com CPF "123.456.789-00", CNH e endereço, e confirma
> Então o motorista é criado, vinculado à cooperativa, com CNH e endereço preenchidos
> E aparece na tabela com "Mínimo" na coluna Cadastro
> E um toast de sucesso é exibido

**Cenário 2 (borda):**
> Dado que o operador preenche a aba Manual mas deixa o campo "Endereço - Rua" vazio
> Quando ele tenta confirmar
> Então o sistema bloqueia o envio e sinaliza o campo obrigatório, sem chamar o backend

**Cenário 3 (erro):**
> Dado que não existe conta de usuário com nome de usuário "98765432100" (CPF)
> Quando o operador tenta cadastrar o motorista com CPF "987.654.321-00"
> Então o sistema recusa o cadastro e exibe um toast de erro com a mensagem retornada pelo backend

_(↔ US-COO-03.1, US-COO-03.2)_

### AC-T03-002 — Recusar CPF já cadastrado

**Cenário 1 (erro):**
> Dado que já existe um motorista cadastrado para o CPF "123.456.789-00"
> Quando o operador tenta cadastrar um novo motorista com o mesmo CPF na aba Manual
> Então o sistema recusa o cadastro
> E exibe uma mensagem indicando que o caminho correto é usar "Vincular veículo" para complementar o motorista já existente

_(↔ US-COO-03.3, cenário de erro)_

### AC-T03-003 — Importar planilha com motoristas válidos e inválidos

**Cenário 1 (happy):**
> Dado que o operador seleciona uma planilha com 3 linhas (CPFs "111.111.111-11", "222.222.222-22" com endereço em branco, "333.333.333-33" com dados de veículo em branco)
> Quando ele confirma o envio na aba "Importar planilha"
> Então os 3 motoristas são criados com "Completo" na coluna Cadastro
> E o resumo exibido mostra "3 processadas, 3 com sucesso, 0 com erro"
> E o motorista do CPF "222.222.222-22" aparece com endereço padrão, e o do CPF "333.333.333-33" com veículo padrão

**Cenário 2 (borda):**
> Dado que a planilha tem 4 linhas, sendo 1 com CPF vazio e 1 com CPF já cadastrado
> Quando o operador confirma o envio
> Então os 2 motoristas válidos são criados
> E o resumo mostra "4 processadas, 2 com sucesso, 2 com erro", sem interromper o processamento das linhas válidas

**Cenário 3 (erro):**
> Dado que o operador seleciona um arquivo vazio ou em formato inválido
> Quando ele confirma o envio
> Então o sistema exibe um toast de erro e nenhum motorista é criado

_(↔ US-COO-04.1, US-COO-04.2)_

### AC-T03-004 — Vincular veículo a motorista sem veículo

**Cenário 1 (happy):**
> Dado que o motorista "João Silva" está cadastrado e sem veículo vinculado
> Quando o operador abre "Vincular veículo" na linha dele, preenche marca, modelo, placa, cor, capacidade, categoria, ano e chassi, e confirma
> Então o veículo é criado e vinculado a "João Silva", sem alterar nenhum outro dado dele
> E a coluna Veículo passa a mostrar a placa cadastrada

**Cenário 2 (borda — substituição):**
> Dado que o motorista "João Silva" já tem o veículo de placa "ABC1D23" vinculado
> Quando o operador abre "Vincular veículo" nessa linha
> Então o modal exibe o aviso de que o veículo atual ficará sem motorista ao continuar
> E, ao confirmar com a nova placa "XYZ9E88", a coluna Veículo passa a mostrar "XYZ9E88"

**Cenário 3 (erro):**
> Dado que já existe um veículo cadastrado com a placa "ABC1D23"
> Quando o operador tenta vincular um novo veículo com a mesma placa a outro motorista
> Então o sistema exibe o toast de erro best-effort "Não foi possível cadastrar o veículo — verifique se a placa já está em uso"

_(↔ US-COO-05.1, US-COO-05.2, US-COO-05.3)_

### AC-T03-005 — Bloquear e reativar motorista

**Cenário 1 (happy — bloquear):**
> Dado que o motorista "João Silva" está ativo e sem corrida em andamento
> Quando o operador clica em "Bloquear", informa o motivo "CNH vencida desde 01/08/2026" e confirma
> Então "João Silva" passa a "Bloqueado" na coluna Status, com o motivo registrado
> E o botão da linha passa a mostrar "Reativar"

**Cenário 2 (happy — reativar):**
> Dado que o motorista "João Silva" está bloqueado com motivo "CNH vencida desde 01/08/2026"
> Quando o operador clica em "Reativar" e confirma
> Então "João Silva" volta a "Ativo", com o motivo de bloqueio limpo
> E o botão da linha volta a mostrar "Bloquear"

**Cenário 3 (borda — corrida em andamento):**
> Dado que o motorista "João Silva" está executando a corrida "V-2026-0815-042"
> Quando o operador o bloqueia com o motivo "Reclamação grave de passageiro"
> Então "João Silva" fica bloqueado
> E o sistema informa, no toast de sucesso, que a corrida em andamento não é interrompida pelo bloqueio

_(↔ US-COO-09.1, US-COO-09.2, US-COO-09.3)_

### Âncoras visuais

- **AC-T03-006 (variabilidade)** — Cada linha da tabela reflete dados reais do motorista (nome, CPF, veículo, status); nenhuma linha decorativa ou contagem estática.
- **AC-T03-007 (CTA insubstituível)** — Cada motorista tem no máximo um botão "Bloquear" **ou** "Reativar" visível por vez (nunca os dois simultâneos), e um único "Vincular/Substituir veículo".
- **AC-T03-008 (paleta canônica)** — Chip de status usa `color="success"` para Ativo e `color="danger"` para Bloqueado; chip de cadastro usa `variant="bordered"` neutro — sem tom inventado.
- **AC-T03-009 (defaults do DS)** — Espaçamento da tabela e dos modais segue os defaults do `@heroui/table`/`@heroui/modal`.

### NFRs quantificados

- **NFR-T03-001 Acessibilidade** — WCAG 2.1 AA; tabela navegável por teclado; todo botão de ação por linha tem `aria-label` incluindo o nome do motorista (ex.: "Bloquear João Silva").
- **NFR-T03-002 Reatividade cross-tela** — Motorista bloqueado deixa de ser oferecido em **PRD-T04** no próximo carregamento da lista de motoristas disponíveis.
- **NFR-T03-003 Tratamento de falha de rede** — Toda falha de rede/timeout exibe toast de erro em até 10s percebidos, sem fechar modais nem perder dados preenchidos.
- **NFR-T03-004 Importação de planilha** — Feedback do resumo de importação exibido em até 3s após o upload completar (percepção de processamento, não SLA de servidor).

## 11. Referências

- UC-COO-03 (Cadastrar motorista manualmente), UC-COO-04 (Importar motoristas via planilha), UC-COO-05 (Cadastrar veículo para motorista), UC-COO-09 (Bloquear e reativar motorista) — §5, §6, §8, §10, §11 de cada.
- EF Macro Cadastros e Frota — §4.2 (Motorista, Veiculo, Status), §5 RF-07/RF-08/RF-09/RF-10, §6 (RN-06, RN-07, RN-08, RN-09, RN-10), §12 (glossário "cadastro completo" vs "mínimo").
- PRDs vizinhos: **PRD-T02 (Gestão de Filas)**, **PRD-T04 (Atribuição Manual de Motorista)** — consomem motoristas cadastrados/desbloqueados aqui.
- **Dependência de feature externa**: a criação da conta de usuário (`User`, `username = CPF`) que é pré-requisito do cadastro manual não é coberta por nenhum UC desta rodada — ver Achados para revisar (UC-COO-03 §14, decisão pendente nº 1, P-09 na EF Macro).
