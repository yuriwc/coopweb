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

const columns = [
  { key: "voucher", label: "VOUCHER" },
  { key: "data", label: "DATA" },
  { key: "motorista", label: "MOTORISTA" },
  { key: "passageiro", label: "PASSAGEIRO" },
  { key: "valor", label: "VALOR" },
  { key: "status", label: "STATUS" },
  { key: "trajeto", label: "TRAJETO" },
];

interface VouchersTableProps {
  vouchers: {
    id?: string;
    numeroVoucher?: string;
    dataEmissao?: string;
    nomeMotorista?: string;
    nomePassageiro?: string;
    valorTotal?: number;
    status?: "PAGO" | "PENDENTE" | "APROVADO";
    origemViagem?: string;
    destinoViagem?: string;
  }[];
}

export default function VouchersTable({ vouchers }: VouchersTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: "PAGO" | "PENDENTE" | "APROVADO") => {
    switch (status) {
      case "PAGO":
        return "success";
      case "PENDENTE":
        return "warning";
      case "APROVADO":
        return "primary";
      default:
        return "default";
    }
  };
  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Nenhum voucher encontrado para este centro de custo.
      </div>
    );
  }

  return (
    <Table aria-label="Tabela de vouchers do centro de custo">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={vouchers}>
        {(voucher) => (
          <TableRow key={voucher.id || voucher.numeroVoucher}>
            {(columnKey) => (
              <TableCell>
                {columnKey === "voucher" && (
                  <div className="font-mono text-sm">
                    {voucher.numeroVoucher || "-"}
                  </div>
                )}
                {columnKey === "data" && (
                  <div className="text-sm">
                    {voucher.dataEmissao
                      ? new Date(voucher.dataEmissao).toLocaleDateString(
                          "pt-BR"
                        )
                      : "-"}
                  </div>
                )}
                {columnKey === "motorista" && (
                  <div className="text-sm">{voucher.nomeMotorista || "-"}</div>
                )}
                {columnKey === "passageiro" && (
                  <div className="text-sm">{voucher.nomePassageiro || "-"}</div>
                )}
                {columnKey === "valor" && (
                  <div className="font-semibold">
                    {voucher.valorTotal
                      ? formatCurrency(voucher.valorTotal)
                      : "-"}
                  </div>
                )}
                {columnKey === "status" && (
                  <Chip
                    size="sm"
                    color={
                      voucher.status
                        ? getStatusColor(voucher.status)
                        : "default"
                    }
                    variant="flat"
                  >
                    {voucher.status || "N/A"}
                  </Chip>
                )}
                {columnKey === "trajeto" && (
                  <div className="text-xs max-w-xs">
                    <div className="truncate text-gray-600">
                      De: {voucher.origemViagem || "-"}
                    </div>
                    <div className="truncate text-gray-600">
                      Para: {voucher.destinoViagem || "-"}
                    </div>
                  </div>
                )}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
