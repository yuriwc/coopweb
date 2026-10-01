"use client";

import { Button, Chip, Table } from "@heroui/react";
import { PARES_VALORES, RotaTabelaPreco, rotaIncompleta } from "@/src/model/tabela-preco";

interface TabelaPrecosTableProps {
  rotas: RotaTabelaPreco[];
  onEditar: (rota: RotaTabelaPreco) => void;
  onDesativar: (rota: RotaTabelaPreco) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function Valor({ valor, sufixo }: { valor: number | null; sufixo?: string }) {
  if (valor == null) {
    return <span className="italic text-warning">não definido</span>;
  }
  return (
    <span className="tabular-nums">
      {formatCurrency(valor)}
      {sufixo ? <span className="text-muted">{sufixo}</span> : null}
    </span>
  );
}

/** Lado da empresa em cima, da cooperativa embaixo — mesma ordem das colunas do formulário. */
function ParValores({
  empresa,
  cooperativa,
  sufixo,
}: {
  empresa: number | null;
  cooperativa: number | null;
  sufixo?: string;
}) {
  return (
    <dl className="grid grid-cols-[auto_auto] gap-x-2 gap-y-0.5 text-sm w-max">
      <dt className="text-xs text-muted self-center">Empresa</dt>
      <dd>
        <Valor valor={empresa} sufixo={sufixo} />
      </dd>
      <dt className="text-xs text-muted self-center">Cooperativa</dt>
      <dd>
        <Valor valor={cooperativa} sufixo={sufixo} />
      </dd>
    </dl>
  );
}

export default function TabelaPrecosTable({ rotas, onEditar, onDesativar }: TabelaPrecosTableProps) {
  const [valorRota, extremo, horaParada] = PARES_VALORES;

  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Rotas com preço fixo da empresa">
            <Table.Header>
              <Table.Column isRowHeader>ROTA</Table.Column>
              <Table.Column>VALOR DA ROTA</Table.Column>
              <Table.Column>ROTEIRO EXTREMO</Table.Column>
              <Table.Column>HORA PARADA</Table.Column>
              <Table.Column>AÇÕES</Table.Column>
            </Table.Header>
            <Table.Body items={rotas}>
              {(item) => {
                const nome = `${item.cidadeOrigem} ↔ ${item.cidadeDestino}`;
                return (
                  <Table.Row id={item.id}>
                    <Table.Cell>
                      <div className="flex flex-col items-start gap-1">
                        {/* Sem quebra: a tabela já rola na horizontal, e o nome partido em três linhas fica ilegível */}
                        <span className="text-sm font-medium whitespace-nowrap">{nome}</span>
                        {item.observacoes ? (
                          <span className="text-xs text-muted">{item.observacoes}</span>
                        ) : null}
                        {rotaIncompleta(item) ? (
                          <Chip size="sm" color="warning" variant="soft" className="whitespace-nowrap">
                            Atualizar valores
                          </Chip>
                        ) : null}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <ParValores empresa={item[valorRota.empresa]} cooperativa={item[valorRota.cooperativa]} />
                    </Table.Cell>
                    <Table.Cell>
                      <ParValores
                        empresa={item[extremo.empresa]}
                        cooperativa={item[extremo.cooperativa]}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <ParValores
                        empresa={item[horaParada.empresa]}
                        cooperativa={item[horaParada.cooperativa]}
                        sufixo="/h"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="tertiary"
                          aria-label={`Editar ${nome}`}
                          onPress={() => onEditar(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger-soft"
                          aria-label={`Desativar ${nome}`}
                          onPress={() => onDesativar(item)}
                        >
                          Desativar
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
