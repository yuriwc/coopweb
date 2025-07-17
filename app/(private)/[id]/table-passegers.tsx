"use client";

import { Funcionario } from "@/src/model/funcionario";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Selection,
} from "@heroui/table";
import React, { useState, useCallback } from "react";
import Menu from "./menu";
import { Button } from "@heroui/button";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/src/components/icon";
import FormViagemProgramada from "./modal/form-viagem-programada";
import FormViagem from "./modal/form-viagem";
import VincularCentroCustoModal from "./modal/form-vincular-centro-custo";
import CentroCustoModal from "./modal/form-centro-custo";

const columns = [
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "phone",
    label: "Telefone",
  },
  {
    key: "cidade",
    label: "Cidade",
  },
  {
    key: "estado",
    label: "Estado",
  },
  {
    key: "centroCusto",
    label: "Centro de Custo",
  },
];

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
      <Table
        aria-label="Tabela de funciários de uma empresa"
        selectionMode="multiple"
        onSelectionChange={handleSelectionChange}
        topContent={
          <div className="flex items-center gap-3 justify-between w-full">
            <div>
              <Menu />
              <span className="text-lg">Tabela de Colaboradores</span>
            </div>
            <div className="flex flex-row items-center gap-4">
              {/* Ações de Viagem */}
              <div className="flex flex-row gap-2">
                <Button
                  onPress={() => setIsModalOpen(true)}
                  variant="solid"
                  color="primary"
                  size="sm"
                  startContent={<Icon icon="solar:car-linear" height={16} />}
                  className="font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  isDisabled={passagers.length === 0}
                >
                  Solicitar Viagem
                </Button>
                <Button
                  onPress={() => setIsModalProgramadaOpen(true)}
                  variant="bordered"
                  color="primary"
                  size="sm"
                  startContent={<Icon icon="solar:calendar-linear" height={16} />}
                  className="font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  isDisabled={passagers.length === 0}
                >
                  Programar Viagem
                </Button>
              </div>

              {/* Separador visual */}
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300/50 dark:via-gray-600/50 to-transparent" />

              {/* Gestão de Colaboradores */}
              <div className="flex flex-row items-center gap-2">
                <Button
                  onPress={handleCreate}
                  variant="light"
                  size="sm"
                  startContent={<Icon icon="iconoir:plus" height={16} />}
                  className="backdrop-blur-sm bg-gray-500/10 hover:bg-gray-500/20 border border-gray-200/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-500/25"
                >
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
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={funcionarios}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {columnKey === "centroCusto" ? (
                    <div className="flex items-center justify-between">
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
                        <span className="text-gray-400 italic">
                          Não vinculado
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => handleVincularCentroCusto(item)}
                        startContent={
                          <Icon icon="solar:link-linear" height={16} />
                        }
                      >
                        {item.centroCustoCodigo ? "Alterar" : "Vincular"}
                      </Button>
                    </div>
                  ) : (
                    getKeyValue(item, columnKey)
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
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
