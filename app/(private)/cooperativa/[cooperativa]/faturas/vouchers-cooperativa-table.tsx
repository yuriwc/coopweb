"use client";

import { Table } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Tooltip } from "@heroui/react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  STATUS_VOUCHER_LABEL,
  StatusVoucher,
  VoucherCooperativa,
} from "../../../../../src/model/relatorio-vouchers";

interface VouchersCooperativaTableProps {
  vouchers: VoucherCooperativa[];
  vouchersProcessando: Set<string>;
  onAprovar: (voucher: VoucherCooperativa) => void;
  onAbrirPagamento: (voucher: VoucherCooperativa) => void;
  onAbrirDesconto: (voucher: VoucherCooperativa) => void;
  onCancelar: (voucher: VoucherCooperativa) => void;
}

export default function VouchersCooperativaTable({
  vouchers,
  vouchersProcessando,
  onAprovar,
  onAbrirPagamento,
  onAbrirDesconto,
  onCancelar,
}: VouchersCooperativaTableProps) {
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

  const getStatusColor = (status: StatusVoucher) => {
    switch (status) {
      case "PAGO":
        return "success";
      case "PENDENTE":
        return "warning";
      case "APROVADO":
        return "accent";
      case "CANCELADO":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: StatusVoucher) => {
    switch (status) {
      case "PAGO":
        return "solar:shield-check-linear";
      case "PENDENTE":
        return "solar:clock-circle-linear";
      case "APROVADO":
        return "solar:check-circle-linear";
      case "CANCELADO":
        return "solar:close-circle-linear";
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
      <Table className="bg-transparent shadow-none">
        <Table.ScrollContainer>
          <Table.Content aria-label="Tabela de vouchers da cooperativa">
            <Table.Header>
              <Table.Column isRowHeader className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">VOUCHER</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">EMPRESA</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">EMISSÃO</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">VENCIMENTO</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">MOTORISTA</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">PASSAGEIRO</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">VALOR</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">STATUS</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">TRAJETO</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">PAGAMENTO</Table.Column>
              <Table.Column className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wide">AÇÕES</Table.Column>
            </Table.Header>
            <Table.Body items={vouchers}>
              {(voucher) => (
                <Table.Row
                  id={voucher.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <Table.Cell className="py-3">
                    <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                      {voucher.numeroVoucher}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="text-sm font-medium max-w-[150px]">
                      <Tooltip delay={0}>
                        <Tooltip.Trigger>
                          <div className="truncate">
                            {voucher.nomeEmpresa}
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{voucher.nomeEmpresa}</p>
                        </Tooltip.Content>
                      </Tooltip>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="text-sm">
                      {formatDate(voucher.dataEmissao)}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm ${isVencido(voucher.dataVencimento) ? 'text-red-600 font-semibold' : ''}`}>
                        {formatDate(voucher.dataVencimento)}
                      </span>
                      {isVencido(voucher.dataVencimento) && (
                        <Icon icon="solar:danger-triangle-linear" className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="text-sm max-w-[120px]">
                      <Tooltip delay={0}>
                        <Tooltip.Trigger>
                          <div className="truncate">
                            {voucher.nomeMotorista}
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{voucher.nomeMotorista}</p>
                        </Tooltip.Content>
                      </Tooltip>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="text-sm max-w-[120px]">
                      <Tooltip delay={0}>
                        <Tooltip.Trigger>
                          <div className="truncate">
                            {voucher.nomePassageiro}
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>{voucher.nomePassageiro}</p>
                        </Tooltip.Content>
                      </Tooltip>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(voucher.valorTotal)}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <Chip size="sm" color={getStatusColor(voucher.status)} variant="tertiary">
                      <Icon icon={getStatusIcon(voucher.status)} className="w-3 h-3" />
                      {STATUS_VOUCHER_LABEL[voucher.status]}
                    </Chip>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="text-xs max-w-[200px] space-y-1">
                      <div className="flex items-start gap-1">
                        <Icon icon="solar:map-point-linear" className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                        <Tooltip delay={0}>
                          <Tooltip.Trigger>
                            <div className="truncate text-gray-600 dark:text-gray-400">
                              {voucher.origemViagem}
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <p>{voucher.origemViagem}</p>
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                      <div className="flex items-start gap-1">
                        <Icon icon="solar:map-point-favourite-linear" className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                        <Tooltip delay={0}>
                          <Tooltip.Trigger>
                            <div className="truncate text-gray-600 dark:text-gray-400">
                              {voucher.destinoViagem}
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <p>{voucher.destinoViagem}</p>
                          </Tooltip.Content>
                        </Tooltip>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="text-xs">
                      {voucher.formaPagamento ? (
                        <Chip size="sm" variant="secondary" color="default">
                          {voucher.formaPagamento}
                        </Chip>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      {voucher.observacao && (
                        <div className="mt-1">
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Icon icon="solar:info-circle-linear" className="w-3 h-3" />
                                <span className="text-xs">Obs.</span>
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>{voucher.observacao}</p>
                            </Tooltip.Content>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </Table.Cell>

                  <Table.Cell className="py-3">
                    <div className="flex items-center gap-1.5">
                      {voucher.status === "PENDENTE" && (
                        <Button
                          size="sm"
                          variant="tertiary"
                          aria-label={`Aprovar voucher ${voucher.numeroVoucher}`}
                          isDisabled={vouchersProcessando.has(voucher.id)}
                          onPress={() => onAprovar(voucher)}
                        >
                          Aprovar
                        </Button>
                      )}
                      {(voucher.status === "PENDENTE" || voucher.status === "APROVADO") && (
                        <Button
                          size="sm"
                          variant="tertiary"
                          aria-label={`Confirmar pagamento do voucher ${voucher.numeroVoucher}`}
                          isDisabled={vouchersProcessando.has(voucher.id)}
                          onPress={() => onAbrirPagamento(voucher)}
                        >
                          Pagar
                        </Button>
                      )}
                      {(voucher.status === "PENDENTE" || voucher.status === "APROVADO") && (
                        <Button
                          size="sm"
                          variant="tertiary"
                          aria-label={`Aplicar desconto no voucher ${voucher.numeroVoucher}`}
                          isDisabled={vouchersProcessando.has(voucher.id)}
                          onPress={() => onAbrirDesconto(voucher)}
                        >
                          Desconto
                        </Button>
                      )}
                      {(voucher.status === "PENDENTE" || voucher.status === "APROVADO") && (
                        <Button
                          size="sm"
                          variant="danger-soft"
                          className="ml-1.5"
                          aria-label={`Cancelar voucher ${voucher.numeroVoucher}`}
                          isDisabled={vouchersProcessando.has(voucher.id)}
                          onPress={() => onCancelar(voucher)}
                        >
                          Cancelar
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