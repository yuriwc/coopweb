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
import React, { useEffect, useState } from "react";
import Menu from "./menu";
import { Button } from "@heroui/button";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/src/components/icon";
import { Spacer } from "@heroui/spacer";
import FormViagemProgramada from "./modal/form-viagem-programada";

interface TablePassegersProps {
  funcionarios: Funcionario[];
  empresa: string;
  token: string;
}

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
];

const TablePassegers = ({
  funcionarios,
  empresa,
  token,
}: TablePassegersProps) => {
  const router = useRouter();
  const currentPath = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passagers, setPassagers] = useState<Funcionario[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleCreate = () => {
    router.push(`${currentPath}/passegers`);
  };

  return (
    <div className="flex flex-col gap-3">
      <Table
        aria-label="Tabela de funciários de uma empresa"
        selectionMode="multiple"
        onSelectionChange={(selected: Selection) => {
          if (selected instanceof Set) {
            setPassagers(
              funcionarios.filter((funcionario) => selected.has(funcionario.id))
            );
          }
        }}
        topContent={
          <div className="flex items-center gap-3 justify-between w-full">
            <div>
              <Menu />
              <span className="text-lg">Tabela de Colaboradores</span>
            </div>
            <div className="flex flex-row items-center">
              <Button onPress={handleCreate} variant="ghost">
                <Icon icon="iconoir:plus" height={30} />
              </Button>
              <Spacer x={5} />
              <div>
                <Button variant="ghost" onPress={() => setIsModalOpen(true)}>
                  Solicitar Viagem
                </Button>

                <FormViagemProgramada
                  token={token}
                  isOpen={isModalOpen}
                  onOpen={setIsModalOpen}
                  passagers={passagers}
                  empresa={empresa}
                />
              </div>
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
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TablePassegers;
