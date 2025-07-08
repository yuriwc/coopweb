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
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify/react";
import { VoucherCooperativa } from "../../../../../src/model/relatorio-vouchers";

const columns = [
  { key: "voucher", label: "VOUCHER" },
  { key: "empresa", label: "EMPRESA" },
  { key: "dataEmissao", label: "EMISSÃO" },
  { key: "dataVencimento", label: "VENCIMENTO" },
  { key: "motorista", label: "MOTORISTA" },
  { key: "passageiro", label: "PASSAGEIRO" },
  { key: "valor", label: "VALOR" },
  { key: "status", label: "STATUS" },
  { key: "trajeto", label: "TRAJETO" },
  { key: "pagamento", label: "PAGAMENTO" },
];

interface VouchersCooperativaTableProps {
  vouchers: VoucherCooperativa[];
}

export default function VouchersCooperativaTable({ vouchers }: VouchersCooperativaTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing DD/MM/YYYY format
        const parts = dateString.split(/[-\/\s]/);
        if (parts.length >= 3) {
          const parsedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          return parsedDate.toLocaleDateString("pt-BR");
        }
        return dateString;
      }
      return date.toLocaleDateString("pt-BR");
    } catch {
      return dateString;
    }
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

  const getStatusIcon = (status: "PAGO" | "PENDENTE" | "APROVADO") => {
    switch (status) {
      case "PAGO":
        return "solar:shield-check-linear";
      case "PENDENTE":
        return "solar:clock-circle-linear";
      case "APROVADO":
        return "solar:check-circle-linear";
      default:
        return "solar:question-circle-linear";
    }
  };

  const isVencido = (dataVencimento: string) => {
    try {
      const vencimento = new Date(dataVencimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return vencimento < hoje;
    } catch {
      return false;
    }
  };

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="mb-4">
          <Icon icon="solar:document-linear" className="w-12 h-12 mx-auto text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Nenhum voucher encontrado
        </h3>
        <p className="text-sm text-gray-500">
          Não há vouchers para os filtros selecionados
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table 
        aria-label="Tabela de vouchers da cooperativa"
        classNames={{
          wrapper: "bg-transparent shadow-none",
          th: "bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold",
          td: "py-3",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} className="uppercase tracking-wide">
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={vouchers}>
          {(voucher) => (
            <TableRow 
              key={voucher.id}
              className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
            >
              {(columnKey) => (
                <TableCell>
                  {columnKey === "voucher" && (
                    <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                      {voucher.numeroVoucher}
                    </div>
                  )}
                  
                  {columnKey === "empresa" && (
                    <div className="text-sm font-medium max-w-[150px]">
                      <Tooltip content={voucher.nomeEmpresa}>
                        <div className="truncate">
                          {voucher.nomeEmpresa}
                        </div>
                      </Tooltip>
                    </div>
                  )}
                  
                  {columnKey === "dataEmissao" && (
                    <div className="text-sm">
                      {formatDate(voucher.dataEmissao)}
                    </div>
                  )}
                  
                  {columnKey === "dataVencimento" && (
                    <div className="flex items-center gap-1">
                      <span className={`text-sm ${isVencido(voucher.dataVencimento) ? 'text-red-600 font-semibold' : ''}`}>
                        {formatDate(voucher.dataVencimento)}
                      </span>
                      {isVencido(voucher.dataVencimento) && (
                        <Icon icon="solar:danger-triangle-linear" className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                  
                  {columnKey === "motorista" && (
                    <div className="text-sm max-w-[120px]">
                      <Tooltip content={voucher.nomeMotorista}>
                        <div className="truncate">
                          {voucher.nomeMotorista}
                        </div>
                      </Tooltip>
                    </div>
                  )}
                  
                  {columnKey === "passageiro" && (
                    <div className="text-sm max-w-[120px]">
                      <Tooltip content={voucher.nomePassageiro}>
                        <div className="truncate">
                          {voucher.nomePassageiro}
                        </div>
                      </Tooltip>
                    </div>
                  )}
                  
                  {columnKey === "valor" && (
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(voucher.valorTotal)}
                    </div>
                  )}
                  
                  {columnKey === "status" && (
                    <Chip
                      size="sm"
                      color={getStatusColor(voucher.status)}
                      variant="flat"
                      startContent={
                        <Icon icon={getStatusIcon(voucher.status)} className="w-3 h-3" />
                      }
                    >
                      {voucher.status}
                    </Chip>
                  )}
                  
                  {columnKey === "trajeto" && (
                    <div className="text-xs max-w-[200px] space-y-1">
                      <div className="flex items-start gap-1">
                        <Icon icon="solar:map-point-linear" className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <Tooltip content={voucher.origemViagem}>
                          <div className="truncate text-gray-600 dark:text-gray-400">
                            {voucher.origemViagem}
                          </div>
                        </Tooltip>
                      </div>
                      <div className="flex items-start gap-1">
                        <Icon icon="solar:map-point-favourite-linear" className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <Tooltip content={voucher.destinoViagem}>
                          <div className="truncate text-gray-600 dark:text-gray-400">
                            {voucher.destinoViagem}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                  
                  {columnKey === "pagamento" && (
                    <div className="text-xs">
                      {voucher.formaPagamento ? (
                        <Chip size="sm" variant="bordered" color="secondary">
                          {voucher.formaPagamento}
                        </Chip>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      {voucher.observacao && (
                        <div className="mt-1">
                          <Tooltip content={voucher.observacao}>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Icon icon="solar:info-circle-linear" className="w-3 h-3" />
                              <span className="text-xs">Obs.</span>
                            </div>
                          </Tooltip>
                        </div>
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