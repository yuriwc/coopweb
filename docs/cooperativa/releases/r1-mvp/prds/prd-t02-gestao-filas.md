# PRD-T02: Gestão de Filas

> Tela de produto do módulo Cooperativa — CoopWeb.
> Localização da rota: `app/(private)/cooperativa/[cooperativa]/filas/page.tsx` (rota nova).
> Pré-condição: operador autenticado (role `COOPERATIVA`), vinculado a uma cooperativa.
> Pré-requisitos técnicos: modo **produção** — sem PRD-T00/T99. Backend real `taxi-back`, endpoints `POST /api/v1/cooperativa/{idCooperativa}/fila` e `GET /api/v1/cooperativa/{idCooperativa}/fila?latitude=&longitude=`; tempo real via Firebase (`cooperativas/{id}/filas`), reaproveitando `useFirebaseQueues` (`src/services/firebase-queue.ts`).
> Card/tarefa: — · Validação: pendente

## 1. Objetivo

O operador da cooperativa cria pontos de fila (locais físicos onde motoristas se concentram aguardando corrida) e acompanha quais existem e quantos motoristas aguardam em cada uma. Uso esporádico — normalmente definido uma vez por região de atuação da cooperativa.

> ⚠ **Fora de escopo, explícito (correção de 2026-08-15):** esta tela **não** deve ter nenhuma ação de adicionar/remover um motorista de uma fila. Entrar e sair de uma fila é ação exclusiva do próprio motorista, feita pelo app do motorista (UC-MOT-03) — a visão web da cooperativa é só leitura em relação à composição de cada fila. Ver FR-T02-005.

## 2. Layout

### 2.1 Referência

```
┌──────────────────────────────────────────────────────────────┐
│ [← Voltar]   Gestão de Filas               3 de 5 filas       │
│              Pontos de atendimento da cooperativa             │
│                                          [+ Nova fila]         │
├──────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │
│  │ Shopping Barra │  │ Aeroporto     │  │ Rodoviária    │     │
│  │ 4 motoristas   │  │ 2 motoristas  │  │ 0 motoristas  │     │
│  │ ─ João (12min) │  │ ─ Maria (3min)│  │ (vazio)       │     │
│  │ ─ Carlos ...   │  │ ─ Pedro ...   │  │               │     │
│  └───────────────┘  └───────────────┘  └───────────────┘     │
└──────────────────────────────────────────────────────────────┘

Modal "Nova fila":
┌────────────────────────────────────┐
│ Nova fila de atendimento             │
│                                       │
│ Nome do ponto *   [________________] │
│ Endereço *        [________________] │
│                                       │
│           [Cancelar]  [Criar fila]   │
└────────────────────────────────────┘
```

### 2.2 Variantes

Não aplicável — UC-COO-02 §7 confirma que não há variação por dimensão.

## 2.5 Glossário UI ↔ código

| Termo do domínio (código) | Termo na UI | O que é (1-2 frases — só se ambíguo) | Observação |
|---|---|---|---|
| `FilaCooperativa` | "Ponto de atendimento" | — | UC-COO-02 §2 |

### 2.5.1 Wording por regime/contexto

`Não aplicável — domínio opera em contexto único (EF Macro Cadastros e Frota §12.1).`

## 3. Componentes (mapping pré-validado contra o DS)

| Elemento da tela | Componente do DS | Status | Observação |
|---|---|---|---|
| Casca visual da página | `<div className="bg-gray-50 dark:bg-gray-900">` — mesmo padrão "clean" do dashboard da cooperativa, sem blur/gradiente decorativo | OK | Decisão revisada — ver §9 (era "Liquid Glass" na primeira rodada) |
| Contador "X de 5 filas" | `<Chip>` (`@heroui/chip`) | OK | — |
| Botão "Nova fila" | `<Button color="primary">` (`@heroui/button`) | OK | Desabilitado (`isDisabled`) quando `total >= 5` |
| Grid de filas | Reaproveita `FilasDisplay` (`src/components/FilasDisplay`) | OK | Componente já existe — ver §6 sobre extensão necessária (nome/endereço) |
| Card por fila | `<Card>`/`<CardHeader>`/`<CardBody>` já usados internamente por `FilasDisplay` | OK | — |
| Lista de motoristas na fila | `<ScrollShadow>` (`@heroui/scroll-shadow`) — já usado em `FilasDisplay` | OK | — |
| Modal "Nova fila" | `<Modal>`/`<ModalContent>`/`<ModalHeader>`/`<ModalBody>`/`<ModalFooter>` (`@heroui/modal`) + `useDisclosure` | OK | Mesmo padrão do modal de relatório em `faturas-client.tsx` |
| Campos do formulário (nome, endereço) | `<Input>` (`@heroui/input`) dentro de `<Form>` (`@heroui/form`) | OK | — |
| Toast de sucesso/erro | `ShowToast` (`src/components/Toast`) | OK | — |

## 4. Interações (INT-T02-NNN)

- **INT-T02-001** Quando o operador clica em "Nova fila", o sistema deve abrir o modal de criação com os campos "Nome do ponto" e "Endereço" vazios.
- **INT-T02-002** Quando o operador preenche nome e endereço e confirma, o sistema deve enviar a criação ao backend (`POST /cooperativa/{id}/fila`) e, em caso de sucesso, fechar o modal, exibir toast de sucesso e atualizar a grade de filas.
- **INT-T02-003** Se a cooperativa já tem 5 filas cadastradas, então o sistema deve desabilitar o botão "Nova fila" e, ao passar o mouse/focar, indicar o motivo ("Limite de 5 filas atingido").
- **INT-T02-004** Se o backend não conseguir localizar o endereço informado, então o sistema deve exibir um toast de erro informando que o endereço não pôde ser localizado, sem opção de correção manual — o operador precisa tentar novamente com outro endereço. _(UC-COO-02 §6 E2)_
- **INT-T02-005** Enquanto a criação está em andamento, o sistema deve desabilitar o botão "Criar fila" e mostrar estado de carregamento.

## 5. Estados (default, loading, vazio, erro, variantes)

- **Default** — grade de filas carregada, com contadores em tempo real de motoristas.
- **Vazio** — nenhuma fila cadastrada (herdado de `FilasDisplay`, estado "Nenhuma fila ativa" já implementado).
- **Modal aberto / preenchendo** — campos vazios ou parcialmente preenchidos.
- **Enviando** — botão "Criar fila" em `isLoading`.
- **Sucesso** — toast de sucesso, modal fecha, grade atualizada.
- **Erro — limite atingido** — botão "Nova fila" desabilitado (bloqueio preventivo, não é erro de submissão).
- **Erro — endereço não localizável** — toast de erro, modal permanece aberto com os dados preenchidos.
- **Erro técnico/rede** — toast de erro genérico.

Sem FSM — estados lineares, sem bifurcação de decisão cruzada.

## 6. Side-effects (entre telas)

| Origem | Efeito nesta tela |
|---|---|
| Criação de fila bem-sucedida | Nova fila passa a existir no backend e é escutada em tempo real via `useFirebaseQueues` assim que o primeiro motorista entrar nela; a lista "administrativa" (nome/endereço/id) precisa ser buscada via REST — ver nota abaixo |
| Motorista entra/sai da fila (UC-MOT-03, fora desta rodada) | Contador de motoristas por fila atualiza em tempo real nesta tela, sem reload (comportamento já existente de `FilasDisplay`) |

> **Nota de integração:** `FilasDisplay` hoje (`src/components/FilasDisplay/index.tsx`) só expõe `{id, motoristas}` via Firebase — não tem `nome`/`endereço` da fila (a UI atual mostra apenas "Fila 1", "Fila 2" por índice). Esta tela precisa complementar com uma leitura REST (`GET /cooperativa/{id}/fila?latitude=&longitude=`) para obter nome/endereço reais e casar por `id` com os dados em tempo real do Firebase. Ver Achados para revisar sobre a ausência de um endpoint de listagem sem filtro geográfico.

## 7. Dados Mockados (TS literal — exemplo de payload/resposta real)

```ts
// Payload enviado em POST /api/v1/cooperativa/{idCooperativa}/fila
const novaFilaPayload = {
  nome: "Shopping Barra",
  rua: "Av. Centenário",
  numero: "2992",
  bairro: "Chame-Chame",
  cidade: "Salvador",
  cep: "40155-150",
  estado: "BA",
};

// Resposta esperada de GET /cooperativa/{id}/fila?latitude=&longitude= (complementa o Firebase)
type FilaAdministrativa = {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
};

const filasAdministrativas: FilaAdministrativa[] = [
  { id: "fila-001", nome: "Shopping Barra", endereco: "Av. Centenário, 2992", latitude: -13.0089, longitude: -38.5108 },
  { id: "fila-002", nome: "Aeroporto", endereco: "Praça Gago Coutinho, s/n", latitude: -12.9086, longitude: -38.3225 },
];

// Erro de negócio — limite de filas (400)
const erroLimiteFilas = { status: 400, message: "Cooperativa já atingiu o limite de 5 filas" };

// Erro de negócio — endereço não localizável (400)
const erroEnderecoInvalido = { status: 400, message: "Não foi possível localizar o endereço informado" };
```

## 8. Regras de Negócio aplicadas no front (FR-T02-NNN)

- **FR-T02-001** Enquanto a cooperativa já tem 5 filas cadastradas, o sistema deve desabilitar o botão "Nova fila" na tela, evitando uma chamada ao backend que sempre seria recusada. _(EF Macro Cadastros e Frota §6 RN-02)_
- **FR-T02-002** Quando o operador confirma a criação de uma fila, o sistema deve enviar nome e endereço ao backend para geocodificação; a fila só é criada se a geocodificação for bem-sucedida. _(EF Macro §6 RN-03)_
- **FR-T02-003** Se o endereço informado não puder ser geocodificado, então o sistema deve recusar a criação sem oferecer edição manual do ponto no mapa — diferente do fallback de validação manual usado no cadastro de empresa/motorista. _(EF Macro §6 RN-03; UC-COO-02 §6 E2)_
- **FR-T02-004** O sistema deve atualizar a contagem de motoristas por fila em tempo real, sem exigir reload da página. _(Firebase Realtime Database, já implementado em `FilasDisplay`)_
- **FR-T02-005** O sistema não deve oferecer nenhum controle (botão, drag-and-drop, seleção) para adicionar ou remover um motorista de uma fila a partir desta tela — a lista de motoristas por fila é somente leitura na visão web da cooperativa. _(UC-COO-02 §10; UC-MOT-03 é o único caminho válido, fora do escopo desta rodada)_

## 9. Notas de Implementação

- Rota nova: `app/(private)/cooperativa/[cooperativa]/filas/page.tsx` — Server Component que busca a lista administrativa de filas (REST) e passa para um client component que também assina o Firebase via `useFirebaseQueues` (reaproveitando `src/services/firebase-queue.ts`), casando os dois por `id`.
- Extrair uma variante de `src/components/FilasDisplay/index.tsx` que aceite `nome`/`endereco` opcionais por fila (hoje o componente só recebe `{id, motoristas}` do Firebase) — mudança pequena, não quebra o uso atual no dashboard (`app/(private)/cooperativa/[cooperativa]/page.tsx`).
- Criação via Server Action `"use server"` chamando `POST /api/v1/cooperativa/{idCooperativa}/fila`, seguindo o padrão de `assign-motorista.ts`/`encerrar-programacao.ts` (retorno `{success, message}`, `revalidateTag`).
- **Casca visual — decisão revisada (2026-08-15):** ver PRD-T01 §9 — mesma reversão de "Liquid Glass" para casca limpa (`bg-gray-50 dark:bg-gray-900` + `<Card>` com borda sutil), aplicada de forma consistente a T01/T02/T03.
- **Hierarquia de botões:** ação primária "Nova fila" fica no cabeçalho da tela, alinhada à direita do título (padrão de tela com ação única de criação no topo, diferente de formulário longo como T01) — mantém 1 zona previsível para a ação de escrita da tela.
- Adicionar `ActionButton` ("Gestão de Filas") em "Ações Rápidas" de `app/(private)/cooperativa/[cooperativa]/page.tsx`.
- **Atenção ao codar:** é tentador adicionar um botão "+ Adicionar motorista" dentro de cada card de fila (parece natural ao lado da lista de motoristas). Não fazer — ver §1 e FR-T02-005. A única ação de escrita desta tela é criar uma fila nova.

## 10. Critérios de Aceite (AC-T02-NNN + NFR-T02-NNN)

### AC-T02-001 — Criar fila de atendimento

**Cenário 1 (happy):**
> Dado que a "Cooperativa Taxi Salvador" tem 3 filas cadastradas (limite de 5)
> Quando o operador informa o nome "Shopping Barra" e o endereço do novo ponto de fila e confirma
> Então o sistema localiza as coordenadas do endereço informado
> E a fila "Shopping Barra" é criada e vinculada à cooperativa
> E o modal fecha, exibindo um toast de sucesso
> E a grade de filas passa a mostrar 4 de 5

**Cenário 2 (borda):**
> Dado que a "Cooperativa Taxi Salvador" tem 4 filas cadastradas
> Quando o operador cria a 5ª fila com sucesso
> Então o botão "Nova fila" fica desabilitado, com dica "Limite de 5 filas atingido"

**Cenário 3 (erro):**
> Dado que o operador deixa o campo "Nome do ponto" vazio
> Quando ele tenta confirmar a criação
> Então o sistema bloqueia o envio e sinaliza o campo obrigatório, sem chamar o backend

_(↔ US-COO-02.1)_

### AC-T02-002 — Recusar criação além do limite

**Cenário 1 (happy — recusa correta):**
> Dado que a "Cooperativa Taxi Salvador" já tem 5 filas cadastradas
> Quando a tela carrega
> Então o botão "Nova fila" já aparece desabilitado, sem exigir tentativa de submissão

_(↔ US-COO-02.2, cenário de erro — bloqueio preventivo na UI evita a chamada que o backend recusaria)_

### AC-T02-003 — Endereço da fila não localizável

**Cenário 1 (erro):**
> Dado que a "Cooperativa Taxi Salvador" tem 2 filas cadastradas
> Quando o operador informa um endereço que o sistema não consegue localizar e confirma
> Então o sistema recusa a criação da fila
> E exibe um toast de erro "Não foi possível localizar o endereço informado"
> E o modal permanece aberto com os dados preenchidos, sem opção de corrigir o ponto manualmente no mapa

**Cenário 2 (borda):**
> Dado que o operador corrige o endereço para um valor localizável
> Quando ele confirma novamente
> Então a fila é criada normalmente

_(↔ US-COO-02.3, cenário de erro)_

### Âncoras visuais

- **AC-T02-004 (variabilidade)** — Cada card de fila mostra a contagem real de motoristas em tempo real; nenhum card estático nem contador decorativo.
- **AC-T02-005 (CTA insubstituível)** — Existe um único botão "Nova fila"; nenhuma ação duplicada de criação.
- **AC-T02-006 (paleta canônica)** — Chip de contagem "X de 5" usa `color="warning"` quando `total === 5`, `color="default"` caso contrário — sem tom inventado.
- **AC-T02-007 (defaults do DS)** — Espaçamento do grid de cards segue os defaults do `@heroui/card`; nenhum padding customizado sem necessidade.

### NFRs quantificados

- **NFR-T02-001 Acessibilidade** — WCAG 2.1 AA; modal navegável por teclado (`Esc` fecha, foco preso no modal); contraste ≥ 4.5:1.
- **NFR-T02-002 Reatividade** — Contagem de motoristas por fila atualiza em tempo real (Firebase), testável abrindo 2 abas.
- **NFR-T02-003 Tratamento de falha de rede** — Falha de rede/timeout na criação exibe toast de erro em até 10s percebidos, sem fechar o modal nem perder os dados preenchidos.

## 11. Referências

- UC-COO-02 (Criar e gerenciar filas de atendimento) — §5, §6 (E1/E2), §8, §10, §11.
- EF Macro Cadastros e Frota — §5 RF-03 (gestão de fila), §6 (RN-02 limite de 5, RN-03 geocodificação obrigatória).
- PRDs vizinhos: nenhum nesta rodada consome dados desta tela diretamente.
- **Dependência de feature externa**: entrada/saída de motorista na fila é ação do motorista (UC-MOT-03), fora do escopo desta tela e desta rodada — ver UC-COO-02 §10.
