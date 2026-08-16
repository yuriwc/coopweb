# PRD-T04: Atribuição Manual de Motorista a Viagem

> Tela de produto do módulo Cooperativa — CoopWeb. **Esta é uma extensão de tela já implementada**, não uma tela nova.
> Localização: seção "Viagens Pendentes" do painel da cooperativa — componente `src/components/PendingRides/index.tsx`, renderizado em `app/(private)/cooperativa/[cooperativa]/page.tsx`. Sem rota própria.
> Pré-condição: operador autenticado (role `COOPERATIVA`), vinculado a uma cooperativa.
> Pré-requisitos técnicos: modo **produção** — sem PRD-T00/T99. Backend real `taxi-back`, endpoint `POST /api/v1/cooperativa/{idCooperativa}/viagem/{idViagem}/motorista/{idMotorista}` (já consumido por `src/services/motorista.ts#assignMotoristaToRide`). Tempo real via Firebase (`rides/{cooperativaId}`, status `aguardando_motorista`).
> Card/tarefa: — · Validação: pendente

## 1. Objetivo

O operador da cooperativa atribui manualmente um motorista específico a uma viagem pendente, por fora do fluxo normal de aceite (onde o motorista aceita a corrida oferecida pela fila). Uso de exceção — por exemplo, quando a distribuição automática falha ou o operador quer garantir que um motorista específico atenda.

**O que já existe:** a seção "Viagens Pendentes" já lista as viagens sem motorista em tempo real (Firebase) e já permite selecionar um motorista e confirmar a atribuição (`assignMotoristaToRide`, que chama o endpoint correto de RF-04). **O que falta:** o componente não dá nenhum feedback quando o backend recusa a atribuição — hoje, uma recusa (viagem não encontrada, viagem já encerrada, motorista ocupado) falha silenciosamente: o card da viagem simplesmente continua na tela sem nenhuma mensagem, e o operador não sabe por quê.

## 2. Layout

### 2.1 Referência

```
┌──────────────────────────────────────────────────────────────┐
│  🚗 Viagens Pendentes                    3 viagens pendentes  │
├──────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌───────────────────┐ ┌──────────────┐│
│  │ ID: A1B2C3D4       │ │ ID: E5F6G7H8       │ │ ...          ││
│  │ Empresa: TechCorp  │ │ Empresa: AcmeCo    │ │              ││
│  │ Origem: ...        │ │ Origem: ...        │ │              ││
│  │ Destino: ...       │ │ Destino: ...       │ │              ││
│  │ Passageiro: ...    │ │ Passageiro: ...    │ │              ││
│  │ Agendada: ...      │ │ Agendada: ...      │ │              ││
│  ├───────────────────┤ ├───────────────────┤ │              ││
│  │ [Buscar motorista▾]│ │ [Buscar motorista▾]│ │              ││
│  │ [Atribuir Motorista]│ │ [Atribuir Motorista]│ │              ││
│  └───────────────────┘ └───────────────────┘ └──────────────┘│
└──────────────────────────────────────────────────────────────┘

Ao falhar (novo — toast, hoje inexistente):
┌─────────────────────────────────────┐
│ ⚠ Motorista já está executando outra │
│   viagem no momento                   │
└─────────────────────────────────────┘
```

### 2.2 Variantes

Não aplicável — UC-COO-06 §7 confirma que não há variação por dimensão. A tela já cobre implicitamente a atribuição a viagem sem motorista e a sobrescrita de viagem com motorista já atribuído (mesma ação, mesmo endpoint) — ver §8 FR-T04-002.

## 2.5 Glossário UI ↔ código

| Termo do domínio (código) | Termo na UI | O que é (1-2 frases — só se ambíguo) | Observação |
|---|---|---|---|
| `vincularMotoristaViagem` | "Atribuir Motorista" | — | UC-COO-06 §2 |
| `Iniciada` / `AGUARDANDO_PASSAGEIRO` (statusViagem) | "Em andamento" (nas mensagens de erro) | — | Usado só na mensagem de erro E4, não como rótulo persistente na tela |

### 2.5.1 Wording por regime/contexto

`Não aplicável — domínio opera em contexto único (EF Macro Cadastros e Frota §12.1).`

## 3. Componentes (mapping pré-validado contra o DS)

| Elemento da tela | Componente do DS | Status | Observação |
|---|---|---|---|
| Card de viagem pendente | `<div>` estilizado (já implementado) | OK | Sem mudança de layout necessária |
| Autocomplete de motorista | `<Autocomplete>`/`<AutocompleteItem>` (`@heroui/autocomplete`) — já implementado | OK | Ver FR-T04-003 sobre não filtrar motoristas bloqueados |
| Botão "Atribuir Motorista" | `<Button>` (`@heroui/button`) — já implementado | OK | — |
| **Toast de erro na recusa (novo)** | `ShowToast` (`src/components/Toast`, envolve `@heroui/toast`) | gap → OK após esta mudança | Componente já existe e já é usado em `ActionButton` (programadas); só falta importar e chamar aqui |
| **Toast de sucesso (novo)** | `ShowToast` | gap → OK após esta mudança | Hoje o sucesso só remove o card, sem confirmação textual |

## 4. Interações (INT-T04-NNN)

- **INT-T04-001** Quando o operador seleciona um motorista no Autocomplete e clica em "Atribuir Motorista", o sistema deve chamar `assignMotoristaToRide` e desabilitar o botão com estado de carregamento durante a chamada. _(já implementado)_
- **INT-T04-002** Quando a atribuição é bem-sucedida, o sistema deve remover o card da viagem da lista e exibir um toast de sucesso "Motorista atribuído com sucesso". _(remoção já implementada; toast é a extensão desta rodada)_
- **INT-T04-003** Se a atribuição for recusada pelo backend, então o sistema deve manter o card na lista e exibir um toast de erro com a mensagem de negócio correspondente (viagem não encontrada / viagem já encerrada / motorista ocupado), em vez de falhar silenciosamente. _(extensão desta rodada — gap corrigido)_
- **INT-T04-004** Enquanto a chamada está em andamento, o sistema deve desabilitar o Autocomplete e o botão da viagem específica, sem bloquear a interação com os demais cards. _(já implementado — `assigning[ride.id]` é por viagem)_

## 5. Estados (default, loading, vazio, erro, variantes)

- **Default** — grade de viagens pendentes, atualizada em tempo real (Firebase).
- **Vazio** — nenhuma viagem pendente ("Nenhuma viagem pendente"), já implementado.
- **Motorista selecionado** — Autocomplete preenchido, botão habilitado.
- **Atribuindo** — botão em `isLoading`, Autocomplete desabilitado (por card).
- **Sucesso** — card removido da lista + toast de sucesso _(toast é novo)_.
- **Erro — viagem não encontrada** — card permanece, toast de erro _(novo)_.
- **Erro — viagem já encerrada** — card permanece, toast de erro _(novo)_.
- **Erro — motorista ocupado** — card permanece, toast de erro _(novo)_.

Sem FSM — estados lineares por card, sem transições cruzadas entre cards.

## 6. Side-effects (entre telas)

| Origem | Efeito nesta tela |
|---|---|
| **PRD-T03 (Gestão de Motoristas)** — motorista é bloqueado | O motorista bloqueado continua aparecendo no Autocomplete desta tela hoje (`getMotoristas` não filtra por `ativo`) — a atribuição só é recusada no momento da submissão. Ver FR-T04-003 e Achados. |
| Motorista aceita outra corrida pelo fluxo normal (fora desta rodada) | Se o operador tentar atribuí-lo manualmente enquanto ele já está em outra viagem, a atribuição é recusada (E4) — comportamento já existente no backend desde 2026-08-15 |
| Viagem é finalizada/cancelada por outro caminho enquanto o card está aberto | Card é removido da lista automaticamente pelo listener Firebase (`rides/{cooperativaId}` deixa de conter a viagem) antes mesmo de o operador tentar atribuir — reduz, mas não elimina, a chance de E3 |

## 7. Dados Mockados (TS literal — exemplo de payload/resposta real)

```ts
// Resposta de erro do backend (assignMotoristaToRide hoje só retorna boolean —
// extensão necessária: capturar o corpo da resposta de erro para exibir no toast)
type AssignMotoristaErrorBody = {
  status: number;
  message: string; // ex.: "Viagem não encontrada", "Viagem já finalizada", "Motorista já está executando outra viagem"
};

const erroViagemNaoEncontrada: AssignMotoristaErrorBody = { status: 404, message: "Viagem não encontrada" };
const erroViagemEncerrada: AssignMotoristaErrorBody = { status: 400, message: "Viagem já finalizada, assinada ou cancelada" };
const erroMotoristaOcupado: AssignMotoristaErrorBody = { status: 400, message: "Motorista já está executando outra viagem" };
```

## 8. Regras de Negócio aplicadas no front (FR-T04-NNN)

- **FR-T04-001** Se a viagem-alvo já estiver `Finalizada`, `Assinada` ou `Cancelada`, então o sistema deve recusar a atribuição e informar o operador via toast — o front não decide isso, apenas repassa a recusa do backend. _(EF Macro Cadastros e Frota §5 RF-04, regra R1, corrigido em 2026-08-15)_
- **FR-T04-002** Quando a viagem-alvo já tiver outro motorista atribuído, o sistema deve permitir a atribuição mesmo assim, sobrescrevendo o motorista anterior sem aviso adicional — comportamento intencional, mantido como ferramenta de "forçar" atribuição em exceção (decisão de produto de 2026-08-15). O front não precisa (e não deve) adicionar uma confirmação extra aqui, pois não haveria como o front sequer saber, hoje, que a viagem já tinha motorista — este UC não valida esse estado. _(EF Macro §7.2 RN-05)_
- **FR-T04-003** Se o motorista escolhido já estiver executando outra viagem (`Iniciada`/`AGUARDANDO_PASSAGEIRO`), então o sistema deve recusar a atribuição e informar o operador via toast — a lista de motoristas do Autocomplete não pré-filtra por disponibilidade (o backend não expõe essa informação na listagem), então essa recusa só pode ser detectada no momento da submissão. _(EF Macro §5 RF-04, regra R3, feature de 2026-08-15; UC-COO-06 §6 E4)_

## 9. Notas de Implementação

- Estender `src/services/motorista.ts#assignMotoristaToRide` para retornar o corpo do erro (`{success: boolean, message?: string}`) em vez de só `boolean` — hoje a função descarta a resposta de erro do backend.
- Em `src/components/PendingRides/index.tsx#handleAssignMotorista`, importar `ShowToast` (`src/components/Toast`, já usado em `ActionButton` de `programadas/action/button.tsx`) e chamar com `color="success"`/`color="danger"` conforme o resultado.
- Sem mudança de rota — a extensão é isolada ao componente e ao serviço.
- Casca visual: nenhuma mudança — a seção já usa a casca limpa (HeroUI simples, `bg-gray-50 dark:bg-gray-900`) da home da cooperativa. Com a decisão revisada em PRD-T01 §9, esse deixou de ser um caso à parte: agora é o mesmo padrão adotado em T01/T02/T03 — a única tela que ainda foge dele é T05 (Faturas), já implementada com "Liquid Glass", fora do escopo desta rodada revisitar (ver Achados).
- **Hierarquia de botões:** sem mudança — "Atribuir Motorista" continua como único CTA por card, no rodapé do card, abaixo do seletor de motorista.

## 10. Critérios de Aceite (AC-T04-NNN + NFR-T04-NNN)

### AC-T04-001 — Atribuir motorista a viagem sem motorista

**Cenário 1 (happy):**
> Dado que a viagem "V-2026-0815-042" existe no sistema de tempo real, sem motorista atribuído
> E o motorista "João Silva" está vinculado à cooperativa
> Quando o operador seleciona "João Silva" no card da viagem e clica em "Atribuir Motorista"
> Então a viagem passa a ter "João Silva" atribuído, com status "Em andamento"
> E o card da viagem some da lista de pendentes
> E um toast de sucesso "Motorista atribuído com sucesso" é exibido

**Cenário 2 (borda — sobrescrita permitida):**
> Dado que a viagem "V-2026-0815-042" já está atribuída ao motorista "Carlos Lima" (pelo fluxo normal de aceite)
> Quando o operador atribui manualmente o motorista "João Silva" à mesma viagem
> Então a viagem passa a ter "João Silva" atribuído, substituindo "Carlos Lima", sem aviso adicional do sistema _(EF Macro §7.2 RN-05)_

**Cenário 3 (erro):**
> Dado que a viagem "V-2026-0815-999" não existe mais no sistema de tempo real (foi cancelada por outro caminho)
> Quando o operador tenta atribuir um motorista a essa viagem
> Então o sistema exibe um toast de erro "Viagem não encontrada", mantendo o card visível até o próximo update do Firebase

_(↔ US-COO-06.1, US-COO-06.2, US-COO-06.3)_

### AC-T04-002 — Recusar atribuição para viagem encerrada ou motorista ocupado

**Cenário 1 (erro — viagem encerrada):**
> Dado que a viagem "V-2026-0815-042" está "Finalizada"
> Quando o operador tenta atribuir o motorista "João Silva" a essa viagem
> Então o sistema exibe um toast de erro "Viagem já finalizada, assinada ou cancelada"
> E o card permanece na lista

**Cenário 2 (erro — motorista ocupado):**
> Dado que o motorista "João Silva" está executando a corrida "V-2026-0815-050" ("Em andamento")
> E a viagem "V-2026-0815-042" está sem motorista atribuído
> Quando o operador tenta atribuir "João Silva" à viagem "V-2026-0815-042"
> Então o sistema exibe um toast de erro "Motorista já está executando outra viagem"
> E o card permanece na lista, permitindo escolher outro motorista

_(↔ US-COO-06.4, US-COO-06.5, cenários de erro)_

### Âncoras visuais

- **AC-T04-003 (variabilidade)** — Cada card de viagem pendente mostra dados reais da viagem em tempo real; nenhum card estático.
- **AC-T04-004 (CTA insubstituível)** — Um único botão "Atribuir Motorista" por card; nenhuma ação duplicada.
- **AC-T04-005 (paleta canônica)** — Toast de sucesso usa `color="success"`, toast de erro usa `color="danger"` — mesma convenção de `ActionButton` (programadas).
- **AC-T04-006 (defaults do DS)** — Nenhuma mudança de espaçamento/contraste nesta extensão — o layout existente já segue os defaults do DS.

### NFRs quantificados

- **NFR-T04-001 Acessibilidade** — WCAG 2.1 AA; toast anunciado para leitores de tela (`@heroui/toast` já cobre isso nativamente).
- **NFR-T04-002 Reatividade** — Recusa exibida em até 2s após a resposta do backend (sem loading adicional além do já existente).
- **NFR-T04-003 Sem falha silenciosa** — Toda chamada a `assignMotoristaToRide` que retornar `success: false` deve resultar em exatamente um toast de erro visível — critério de regressão para o gap corrigido nesta rodada.

## 11. Referências

- UC-COO-06 (Vincular motorista manualmente a uma viagem) — §5, §6 (E1-E4), §8, §10, §11.
- EF Macro Cadastros e Frota — §5 RF-04, §6; EF Macro Núcleo de Viagens §7.2 (RN-05, cross-ref).
- PRDs vizinhos: **PRD-T03 (Gestão de Motoristas)** — motoristas bloqueados lá continuam selecionáveis aqui até a submissão (ver Achados).
- **Dependência de feature externa**: o fluxo normal de aceite de corrida (UC-MOT-01) e a listagem de disponibilidade de motorista por status não são cobertos por nenhum UC desta rodada — ver Achados para revisar.
