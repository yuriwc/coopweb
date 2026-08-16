"use client";

import { Funcionario } from "@/src/model/funcionario";
import { Table, Checkbox } from "@heroui/react";
import type { Selection } from "react-aria-components";
import { Chip } from "@heroui/react";
import { Tooltip } from "@heroui/react";
import React, { useState, useCallback } from "react";
import { Button } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/src/components/icon";
import FormViagemProgramada from "./modal/form-viagem-programada";
import FormViagem from "./modal/form-viagem";
import VincularCentroCustoModal from "./modal/form-vincular-centro-custo";
import CentroCustoModal from "./modal/form-centro-custo";

interface TablePassegersProps {
  funcionarios: Funcionario[];
  empresa: string;
  token: string;
}

const TablePassegers = ({
  funcionarios,
  empresa,
  token,
}: TablePassegersProps) => {
  const router = useRouter();
  const currentPath = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalProgramadaOpen, setIsModalProgramadaOpen] = useState(false);
  const [isVincularCentroCustoModalOpen, setIsVincularCentroCustoModalOpen] =
    useState(false);
  const [isCentroCustoModalOpen, setIsCentroCustoModalOpen] = useState(false);
  const [passagers, setPassagers] = useState<Funcionario[]>([]);
  const [selectedFuncionario, setSelectedFuncionario] =
    useState<Funcionario | null>(null);

  const handleCreate = useCallback(() => {
    router.push(`${currentPath}/passegers`);
  }, [router, currentPath]);

  const handleVincularCentroCusto = useCallback((funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsVincularCentroCustoModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleSelectionChange = useCallback(
    (selected: Selection) => {
      if (selected instanceof Set) {
        setPassagers(
          funcionarios.filter((funcionario) => selected.has(funcionario.id))
        );
      }
    },
    [funcionarios]
  );

  return (
    <div className="flex flex-col gap-3">
      <Table className="bg-transparent shadow-none p-0">
        <div className="flex items-center gap-3 justify-end w-full">
          <div className="flex flex-row items-center gap-4">
            {/* Ações de Viagem */}
            <div className="flex flex-row gap-2">
              <Button
                onPress={() => setIsModalOpen(true)}
                variant="primary"
                size="sm"
                className="font-medium"
                isDisabled={passagers.length === 0}
              >
                <Icon icon="solar:car-linear" height={16} />
                Solicitar Viagem
              </Button>
              <Button
                onPress={() => setIsModalProgramadaOpen(true)}
                variant="secondary"
                size="sm"
                className="font-medium"
                isDisabled={passagers.length === 0}
              >
                <Icon icon="solar:calendar-linear" height={16} />
                Programar Viagem
              </Button>
            </div>

            {/* Separador visual */}
            <div className="h-8 w-px bg-linear-to-b from-transparent via-gray-300/50 dark:via-gray-600/50 to-transparent" />

            {/* Gestão de Colaboradores */}
            <div className="flex flex-row items-center gap-2">
              <Button onPress={handleCreate} variant="tertiary" size="sm">
                <Icon icon="iconoir:plus" height={16} />
                Novo Colaborador
              </Button>

              <CentroCustoModal
                isOpen={isCentroCustoModalOpen}
                onOpen={setIsCentroCustoModalOpen}
                empresa={empresa}
                token={token}
                onSuccess={handleRefresh}
              />
            </div>

            {/* Modais (renderizados fora da estrutura visual) */}
            <FormViagem
              token={token}
              isOpen={isModalOpen}
              onOpen={setIsModalOpen}
              passagers={passagers}
              empresa={empresa}
            />
            <FormViagemProgramada
              token={token}
              isOpen={isModalProgramadaOpen}
              onOpen={setIsModalProgramadaOpen}
              passagers={passagers}
              empresa={empresa}
            />
          </div>
        </div>

        <Table.ScrollContainer>
          <Table.Content
            aria-label="Tabela de funciários de uma empresa"
            selectionMode="multiple"
            onSelectionChange={handleSelectionChange}
          >
            <Table.Header>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50">
                <Checkbox slot="selection" />
              </Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Nome</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Telefone</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Cidade</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Estado</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Centro de Custo</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50">Ações</Table.Column>
            </Table.Header>
            <Table.Body items={funcionarios}>
              {(item) => (
                <Table.Row id={item.id}>
                  <Table.Cell>
                    <Checkbox slot="selection" />
                  </Table.Cell>
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>{item.phone || <span className="text-gray-400">—</span>}</Table.Cell>
                  <Table.Cell>{item.cidade || <span className="text-gray-400">—</span>}</Table.Cell>
                  <Table.Cell>{item.estado || <span className="text-gray-400">—</span>}</Table.Cell>
                  <Table.Cell>
                    {item.centroCustoCodigo ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {item.centroCustoCodigo}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.centroCustoDescricao}
                        </span>
                      </div>
                    ) : (
                      <Chip size="sm" variant="tertiary" color="default">
                        Não vinculado
                      </Chip>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Tooltip delay={0}>
                      <Tooltip.Trigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          aria-label={`${item.centroCustoCodigo ? "Alterar" : "Vincular"} centro de custo de ${item.name}`}
                          onPress={() => handleVincularCentroCusto(item)}
                        >
                          <Icon icon="solar:link-linear" height={16} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <p>
                          {item.centroCustoCodigo
                            ? "Alterar centro de custo"
                            : "Vincular centro de custo"}
                        </p>
                      </Tooltip.Content>
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {selectedFuncionario && (
        <VincularCentroCustoModal
          isOpen={isVincularCentroCustoModalOpen}
          onOpen={setIsVincularCentroCustoModalOpen}
          funcionario={selectedFuncionario}
          empresa={empresa}
          token={token}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default TablePassegers;
