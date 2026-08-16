"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { isCadastroCompleto, MotoristaCooperativa } from "../../../../../src/model/motorista";

const columns = [
  { key: "nome", label: "NOME" },
  { key: "cpf", label: "CPF" },
  { key: "cadastro", label: "CADASTRO" },
  { key: "veiculo", label: "VEÍCULO" },
  { key: "status", label: "STATUS" },
  { key: "acoes", label: "AÇÕES" },
];

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
        <Icon icon="solar:user-cross-linear" className="w-12 h-12 mx-auto text-default-300" />
        <h3 className="text-lg font-semibold text-default-700 mt-4">Nenhum motorista encontrado</h3>
        <p className="text-sm text-default-500">
          Cadastre o primeiro motorista da cooperativa em &quot;Novo motorista&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table aria-label="Tabela de motoristas da cooperativa">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={motoristas}>
          {(motorista) => (
            <TableRow key={motorista.id}>
              {(columnKey) => (
                <TableCell>
                  {columnKey === "nome" && (
                    <span className="text-sm font-medium">
                      {motorista.nome ?? <span className="text-default-400 italic">Não informado</span>}
                    </span>
                  )}

                  {columnKey === "cpf" && <span className="text-sm">{motorista.cpf}</span>}

                  {columnKey === "cadastro" && (
                    <Chip size="sm" variant="bordered">
                      {isCadastroCompleto(motorista) ? "Completo" : "Mínimo"}
                    </Chip>
                  )}

                  {columnKey === "veiculo" && (
                    <span className="text-sm">
                      {motorista.veiculo ? (
                        motorista.veiculo.placa
                      ) : (
                        <span className="text-default-400 italic">sem veículo</span>
                      )}
                    </span>
                  )}

                  {columnKey === "status" && (
                    <Chip size="sm" color={motorista.ativo ? "success" : "danger"} variant="flat">
                      {motorista.ativo ? "Ativo" : "Bloqueado"}
                    </Chip>
                  )}

                  {columnKey === "acoes" && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="flat"
                        aria-label={`${motorista.veiculo ? "Substituir" : "Vincular"} veículo de ${motorista.nome ?? motorista.cpf}`}
                        onPress={() => onVincularVeiculo(motorista)}
                      >
                        {motorista.veiculo ? "Substituir veículo" : "Vincular veículo"}
                      </Button>
                      {motorista.ativo ? (
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          aria-label={`Bloquear ${motorista.nome ?? motorista.cpf}`}
                          onPress={() => onBloquear(motorista)}
                        >
                          Bloquear
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="flat"
                          color="success"
                          aria-label={`Reativar ${motorista.nome ?? motorista.cpf}`}
                          onPress={() => onReativar(motorista)}
                        >
                          Reativar
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
