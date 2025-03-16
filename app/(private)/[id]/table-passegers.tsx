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
import FormViagemProgramada from "./drawer/form-viagem-programada";
import Menu from "./menu";
import { Button } from "@heroui/button";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/src/components/icon";

interface TablePassegersProps {
  funcionarios: Funcionario[];
  empresa: string;
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

const TablePassegers = ({ funcionarios, empresa }: TablePassegersProps) => {
  const router = useRouter();
  const currentPath = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [openProgramada, setOpenProgramada] = useState(false);
  const [selected, setSelected] = useState<Funcionario[]>([]);

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
            setSelected(
              funcionarios.filter((funcionario) =>
                selected.has(funcionario.id),
              ),
            );
          }
        }}
        topContent={
          <div className="flex items-center w-[90vh] gap-3 justify-between">
            <div>
              <Menu />
              <span className="text-lg">Tabela de Colaboradores</span>
            </div>
            <div className="flex flex-row justify-center items-center">
              <Button onPress={handleCreate} variant="ghost">
                <Icon icon="iconoir:plus" height={30} />
              </Button>
              <FormViagemProgramada
                isOpen={openProgramada}
                onOpen={setOpenProgramada}
                passagers={selected}
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
