"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  CloseButton,
  InputGroup,
  Pagination,
  Table,
  TextField,
  Tooltip,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  STATUS_VOUCHER_LABEL,
  StatusVoucher,
  VoucherCooperativa,
} from "../../../../../src/model/relatorio-vouchers";
import { janelaPaginas } from "@/src/utils/paginacao";

const POR_PAGINA = 10;

// Rótulo curto para a ficha da tabela; o texto completo fica na dica.
const STATUS_CURTO: Record<StatusVoucher, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

const STATUS_COR: Record<StatusVoucher, "success" | "warning" | "accent" | "danger"> = {
  PAGO: "success",
  PENDENTE: "warning",
  APROVADO: "accent",
  CANCELADO: "danger",
};

const STATUS_ICONE: Record<StatusVoucher, string> = {
  PAGO: "solar:shield-check-linear",
  PENDENTE: "solar:clock-circle-linear",
  APROVADO: "solar:check-circle-linear",
  CANCELADO: "solar:close-circle-linear",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

// A API às vezes manda ISO e às vezes dd/mm/aaaa — tratamos os dois.
function parseData(valor?: string): Date | null {
  if (!valor) return null;

  if (/^\d{4}-/.test(valor)) {
    const iso = new Date(valor);
    return isNaN(iso.getTime()) ? null : iso;
  }

  const partes = valor.split(/[/\-\s]/);
  if (partes.length >= 3) {
    const data = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
    if (!isNaN(data.getTime())) return data;
  }

  const solto = new Date(valor);
  return isNaN(solto.getTime()) ? null : solto;
}

const formatDate = (valor?: string) => {
  const data = parseData(valor);
  return data ? data.toLocaleDateString("pt-BR") : valor || "—";
};

function estaVencido(voucher: VoucherCooperativa) {
  if (voucher.status === "PAGO" || voucher.status === "CANCELADO") return false;
  const vencimento = parseData(voucher.dataVencimento);
  if (!vencimento) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return vencimento < hoje;
}

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
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = termo
      ? vouchers.filter((voucher) =>
          [
            voucher.numeroVoucher,
            voucher.nomeEmpresa,
            voucher.nomeMotorista,
            voucher.nomePassageiro,
            voucher.origemViagem,
            voucher.destinoViagem,
          ].some((campo) => campo?.toLowerCase().includes(termo))
        )
      : [...vouchers];

    // Mais recentes primeiro: é o que interessa numa fatura do mês.
    return lista.sort(
      (a, b) =>
        (parseData(b.dataEmissao)?.getTime() ?? 0) -
        (parseData(a.dataEmissao)?.getTime() ?? 0)
    );
  }, [vouchers, busca]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  // Página derivada: a busca pode encurtar a lista e invalidar a página atual.
  const paginaAtual = Math.min(pagina, paginas);
  const primeiro = (paginaAtual - 1) * POR_PAGINA;
  const visiveis = filtrados.slice(primeiro, primeiro + POR_PAGINA);

  const limparBusca = () => {
    setBusca("");
    setPagina(1);
  };

  if (vouchers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-default px-6 py-16 text-center dark:bg-default/30">
        <Icon icon="solar:bill-list-linear" className="size-8 text-muted" />
        <div>
          <p className="font-semibold text-foreground">Nenhum voucher no período</p>
          <p className="mt-1 text-sm text-muted">
            Ajuste o mês, o ano ou a empresa para ver outros lançamentos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TextField
        className="w-full sm:max-w-sm"
        value={busca}
        onChange={(valor) => {
          setBusca(valor);
          setPagina(1);
        }}
        aria-label="Buscar por voucher, empresa, motorista, passageiro ou trajeto"
      >
        <InputGroup>
          <InputGroup.Prefix>
            <Icon icon="solar:magnifer-linear" className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="Buscar voucher, empresa ou pessoa..." />
          {busca && (
            <InputGroup.Suffix>
              <CloseButton aria-label="Limpar busca" onPress={limparBusca} />
            </InputGroup.Suffix>
          )}
        </InputGroup>
      </TextField>

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-default px-6 py-16 text-center dark:bg-default/30">
          <Icon icon="solar:magnifer-linear" className="size-8 text-muted" />
          <div>
            <p className="font-semibold text-foreground">Nenhum voucher encontrado</p>
            <p className="mt-1 text-sm text-muted">Nada corresponde a &quot;{busca}&quot;</p>
          </div>
          <Button variant="tertiary" size="sm" onPress={limparBusca}>
            Limpar busca
          </Button>
        </div>
      ) : (
        <Table className="bg-transparent p-0 shadow-none">
          <Table.ScrollContainer>
            <Table.Content aria-label="Vouchers da cooperativa">
              <Table.Header>
                <Table.Column isRowHeader className="bg-default/60 dark:bg-default/20">
                  Voucher
                </Table.Column>
                <Table.Column className="bg-default/60 dark:bg-default/20">Trajeto</Table.Column>
                <Table.Column className="bg-default/60 dark:bg-default/20">Pessoas</Table.Column>
                <Table.Column className="bg-default/60 dark:bg-default/20">Datas</Table.Column>
                <Table.Column className="bg-default/60 dark:bg-default/20">Valor</Table.Column>
                <Table.Column className="bg-default/60 dark:bg-default/20">Status</Table.Column>
                <Table.Column className="bg-default/60 dark:bg-default/20">Ações</Table.Column>
              </Table.Header>

              <Table.Body items={visiveis}>
                {(voucher) => {
                  const vencido = estaVencido(voucher);
                  const processando = vouchersProcessando.has(voucher.id);
                  const podeAgir =
                    voucher.status === "PENDENTE" || voucher.status === "APROVADO";

                  return (
                    <Table.Row id={voucher.id}>
                      <Table.Cell className="py-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-foreground">
                            {voucher.numeroVoucher}
                          </p>
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <p className="max-w-[14rem] truncate text-xs text-muted">
                                {voucher.nomeEmpresa}
                              </p>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>{voucher.nomeEmpresa}</p>
                            </Tooltip.Content>
                          </Tooltip>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="py-3">
                        <ol className="relative min-w-0 space-y-1.5 text-xs">
                          <span
                            aria-hidden
                            className="absolute bottom-[0.4rem] left-[3px] top-[0.4rem] w-px bg-black/10 dark:bg-white/15"
                          />
                          {[
                            { cor: "#17c964", texto: voucher.origemViagem },
                            { cor: "#f31260", texto: voucher.destinoViagem },
                          ].map((ponto, i) => (
                            <li key={i} className="relative flex min-w-0 items-center gap-2">
                              <span
                                className="size-[7px] shrink-0 rounded-full ring-2 ring-surface"
                                style={{ backgroundColor: ponto.cor }}
                              />
                              <Tooltip delay={0}>
                                <Tooltip.Trigger>
                                  <span className="max-w-[13rem] truncate text-muted">
                                    {ponto.texto || "—"}
                                  </span>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  <p>{ponto.texto || "Não informado"}</p>
                                </Tooltip.Content>
                              </Tooltip>
                            </li>
                          ))}
                        </ol>
                      </Table.Cell>

                      <Table.Cell className="py-3">
                        <div className="min-w-0 space-y-1 text-xs">
                          <p className="flex items-center gap-1.5">
                            <Icon
                              icon="solar:user-rounded-linear"
                              className="size-3.5 shrink-0 text-muted"
                            />
                            <span className="max-w-[10rem] truncate text-foreground">
                              {voucher.nomeMotorista || "—"}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Icon
                              icon="solar:users-group-rounded-linear"
                              className="size-3.5 shrink-0 text-muted"
                            />
                            <span className="max-w-[10rem] truncate text-muted">
                              {voucher.nomePassageiro || "—"}
                            </span>
                          </p>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="py-3">
                        <div className="space-y-1 text-xs tabular-nums">
                          <p className="text-muted">
                            Emissão {formatDate(voucher.dataEmissao)}
                          </p>
                          <p
                            className={cn(
                              "flex items-center gap-1",
                              vencido ? "font-semibold text-danger" : "text-muted"
                            )}
                          >
                            {vencido && (
                              <Icon
                                icon="solar:danger-triangle-linear"
                                className="size-3.5 shrink-0"
                              />
                            )}
                            Vence {formatDate(voucher.dataVencimento)}
                          </p>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="py-3">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(voucher.valorTotal)}
                        </p>
                        {voucher.formaPagamento && (
                          <p className="text-xs text-muted">{voucher.formaPagamento}</p>
                        )}
                      </Table.Cell>

                      <Table.Cell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <Chip
                                size="sm"
                                color={STATUS_COR[voucher.status]}
                                variant="tertiary"
                              >
                                <Icon
                                  icon={STATUS_ICONE[voucher.status]}
                                  className="size-3.5"
                                />
                                {STATUS_CURTO[voucher.status]}
                              </Chip>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>{STATUS_VOUCHER_LABEL[voucher.status]}</p>
                            </Tooltip.Content>
                          </Tooltip>
                          {voucher.observacao && (
                            <Tooltip delay={0}>
                              <Tooltip.Trigger>
                                <Icon
                                  icon="solar:info-circle-linear"
                                  className="size-4 text-muted"
                                />
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                <p>{voucher.observacao}</p>
                              </Tooltip.Content>
                            </Tooltip>
                          )}
                        </div>
                      </Table.Cell>

                      <Table.Cell className="py-3">
                        {podeAgir ? (
                          <div className="flex items-center gap-1">
                            {voucher.status === "PENDENTE" && (
                              <Tooltip delay={0}>
                                <Tooltip.Trigger>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="tertiary"
                                    className="rounded-full"
                                    aria-label={`Aprovar voucher ${voucher.numeroVoucher}`}
                                    isDisabled={processando}
                                    onPress={() => onAprovar(voucher)}
                                  >
                                    <Icon icon="solar:check-circle-linear" className="size-4" />
                                  </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  <p>Aprovar</p>
                                </Tooltip.Content>
                              </Tooltip>
                            )}

                            <Tooltip delay={0}>
                              <Tooltip.Trigger>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="tertiary"
                                  className="rounded-full"
                                  aria-label={`Registrar pagamento do voucher ${voucher.numeroVoucher}`}
                                  isDisabled={processando}
                                  onPress={() => onAbrirPagamento(voucher)}
                                >
                                  <Icon icon="solar:wallet-money-linear" className="size-4" />
                                </Button>
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                <p>Registrar pagamento</p>
                              </Tooltip.Content>
                            </Tooltip>

                            <Tooltip delay={0}>
                              <Tooltip.Trigger>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="tertiary"
                                  className="rounded-full"
                                  aria-label={`Aplicar desconto no voucher ${voucher.numeroVoucher}`}
                                  isDisabled={processando}
                                  onPress={() => onAbrirDesconto(voucher)}
                                >
                                  <Icon icon="solar:tag-price-linear" className="size-4" />
                                </Button>
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                <p>Aplicar desconto</p>
                              </Tooltip.Content>
                            </Tooltip>

                            <Tooltip delay={0}>
                              <Tooltip.Trigger>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="danger-soft"
                                  className="rounded-full"
                                  aria-label={`Cancelar voucher ${voucher.numeroVoucher}`}
                                  isDisabled={processando}
                                  onPress={() => onCancelar(voucher)}
                                >
                                  <Icon icon="solar:close-circle-linear" className="size-4" />
                                </Button>
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                <p>Cancelar voucher</p>
                              </Tooltip.Content>
                            </Tooltip>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                }}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}

      {filtrados.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted">
            Mostrando {primeiro + 1}–{primeiro + visiveis.length} de {filtrados.length}{" "}
            voucher{filtrados.length > 1 ? "s" : ""}
          </p>

          {paginas > 1 && (
            <Pagination>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={paginaAtual === 1}
                    onPress={() => setPagina(paginaAtual - 1)}
                  >
                    <Pagination.PreviousIcon />
                  </Pagination.Previous>
                </Pagination.Item>

                {janelaPaginas(paginaAtual, paginas).map((item, i) => (
                  <Pagination.Item key={`${item}-${i}`}>
                    {item === "..." ? (
                      <Pagination.Ellipsis />
                    ) : (
                      <Pagination.Link
                        isActive={item === paginaAtual}
                        aria-label={`Página ${item}`}
                        onPress={() => setPagina(item)}
                      >
                        {item}
                      </Pagination.Link>
                    )}
                  </Pagination.Item>
                ))}

                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={paginaAtual === paginas}
                    onPress={() => setPagina(paginaAtual + 1)}
                  >
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
