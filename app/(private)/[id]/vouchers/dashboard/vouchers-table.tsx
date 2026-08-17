"use client";

import { Table } from "@heroui/react";
import { Chip } from "@heroui/react";

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
        return "accent";
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
    <Table className="bg-transparent shadow-none p-0">
      <Table.ScrollContainer>
        <Table.Content aria-label="Tabela de vouchers do centro de custo">
          <Table.Header>
            <Table.Column isRowHeader className="bg-gray-50 dark:bg-gray-800/50">VOUCHER</Table.Column>
            <Table.Column className="bg-gray-50 dark:bg-gray-800/50">DATA</Table.Column>
            <Table.Column className="bg-gray-50 dark:bg-gray-800/50">MOTORISTA</Table.Column>
            <Table.Column className="bg-gray-50 dark:bg-gray-800/50">PASSAGEIRO</Table.Column>
            <Table.Column className="bg-gray-50 dark:bg-gray-800/50">VALOR</Table.Column>
            <Table.Column className="bg-gray-50 dark:bg-gray-800/50">STATUS</Table.Column>
            <Table.Column className="bg-gray-50 dark:bg-gray-800/50">TRAJETO</Table.Column>
          </Table.Header>
          <Table.Body items={vouchers}>
            {(voucher) => (
              <Table.Row id={voucher.id || voucher.numeroVoucher}>
                <Table.Cell>
                  <div className="font-mono text-sm">
                    {voucher.numeroVoucher || "-"}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-sm">
                    {voucher.dataEmissao
                      ? new Date(voucher.dataEmissao).toLocaleDateString(
                          "pt-BR"
                        )
                      : "-"}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-sm">{voucher.nomeMotorista || "-"}</div>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-sm">{voucher.nomePassageiro || "-"}</div>
                </Table.Cell>
                <Table.Cell>
                  <div className="font-semibold">
                    {voucher.valorTotal
                      ? formatCurrency(voucher.valorTotal)
                      : "-"}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Chip
                    size="sm"
                    color={
                      voucher.status
                        ? getStatusColor(voucher.status)
                        : "default"
                    }
                    variant="tertiary"
                  >
                    {voucher.status || "N/A"}
                  </Chip>
                </Table.Cell>
                <Table.Cell>
                  <div className="text-xs max-w-xs">
                    <div className="truncate text-gray-600">
                      De: {voucher.origemViagem || "-"}
                    </div>
                    <div className="truncate text-gray-600">
                      Para: {voucher.destinoViagem || "-"}
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
