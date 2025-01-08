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
} from "@nextui-org/table";
import React, { useEffect, useState } from "react";
import FormViagem from "./drawer/form-viagem";
import FormViagemProgramada from "./drawer/form-viagem-programada";

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
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Funcionario[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

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
          <div>
            <FormViagem
              isOpen={isOpen}
              onOpen={setOpen}
              passagers={selected}
              empresa={empresa}
            />
            <FormViagemProgramada
              isOpen={isOpen}
              onOpen={setOpen}
              passagers={selected}
              empresa={empresa}
            />
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
