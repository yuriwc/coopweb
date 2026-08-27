"use client";

import { Table } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { isCadastroCompleto, MotoristaCooperativa } from "../../../../../src/model/motorista";

interface MotoristasTableProps {
  motoristas: MotoristaCooperativa[];
  onVincularVeiculo: (motorista: MotoristaCooperativa) => void;
  onBloquear: (motorista: MotoristaCooperativa) => void;
  onReativar: (motorista: MotoristaCooperativa) => void;
}

export default function MotoristasTable({
  motoristas,
  onVincularVeiculo,
  onBloquear,
  onReativar,
}: MotoristasTableProps) {
  if (motoristas.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:user-cross-linear" className="w-12 h-12 mx-auto text-muted" />
        <h3 className="text-lg font-semibold text-muted mt-4">Nenhum motorista encontrado</h3>
        <p className="text-sm text-muted">
          Cadastre o primeiro motorista da cooperativa em &quot;Novo motorista&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Tabela de motoristas da cooperativa">
            <Table.Header>
              <Table.Column isRowHeader>NOME</Table.Column>
              <Table.Column>CPF</Table.Column>
              <Table.Column>CADASTRO</Table.Column>
              <Table.Column>VEÍCULO</Table.Column>
              <Table.Column>STATUS</Table.Column>
              <Table.Column>AÇÕES</Table.Column>
            </Table.Header>
            <Table.Body items={motoristas}>
              {(motorista) => (
                <Table.Row id={motorista.id}>
                  <Table.Cell>
                    <span className="text-sm font-medium">
                      {motorista.nome ?? <span className="text-muted italic">Não informado</span>}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="text-sm">{motorista.cpf}</span>
                  </Table.Cell>

                  <Table.Cell>
                    <Chip size="sm" variant="secondary">
                      {isCadastroCompleto(motorista) ? "Completo" : "Mínimo"}
                    </Chip>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="text-sm">
                      {motorista.veiculo ? (
                        motorista.veiculo.placa
                      ) : (
                        <span className="text-muted italic">sem veículo</span>
                      )}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <Chip size="sm" color={motorista.ativo ? "success" : "danger"} variant="tertiary">
                      {motorista.ativo ? "Ativo" : "Bloqueado"}
                    </Chip>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="tertiary"
                        aria-label={`${motorista.veiculo ? "Substituir" : "Vincular"} veículo de ${motorista.nome ?? motorista.cpf}`}
                        onPress={() => onVincularVeiculo(motorista)}
                      >
                        {motorista.veiculo ? "Substituir veículo" : "Vincular veículo"}
                      </Button>
                      {motorista.ativo ? (
                        <Button
                          size="sm"
                          variant="danger-soft"
                          aria-label={`Bloquear ${motorista.nome ?? motorista.cpf}`}
                          onPress={() => onBloquear(motorista)}
                        >
                          Bloquear
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="tertiary"
                          className="text-success"
                          aria-label={`Reativar ${motorista.nome ?? motorista.cpf}`}
                          onPress={() => onReativar(motorista)}
                        >
                          Reativar
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
