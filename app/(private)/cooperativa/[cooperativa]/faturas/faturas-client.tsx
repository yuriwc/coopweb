"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ComboBox, Input, ListBox, Label } from "@heroui/react";
import { Spinner } from "@heroui/react/spinner";
import { Modal, useOverlayState } from "@heroui/react";
import { RelatorioCooperativaMes, VoucherCooperativa, EmpresaLabelValue } from "../../../../../src/model/relatorio-vouchers";
import ShowToast from "../../../../../src/components/Toast";
import VouchersCooperativaTable from "./vouchers-cooperativa-table";
import { aprovarVoucher } from "./action/aprovar-voucher";
import { cancelarVoucher } from "./action/cancelar-voucher";
import ConfirmarAcaoModal from "./modal/confirmar-acao-modal";
import ConfirmarPagamentoModal from "./modal/confirmar-pagamento-modal";
import AplicarDescontoModal from "./modal/aplicar-desconto-modal";

interface LabelValue {
  value: string;
  label: string;
}

interface FaturasClientProps {
  cooperativaId: string;
  relatorioInicial: RelatorioCooperativaMes | null;
  empresasDisponiveis: EmpresaLabelValue[];
  errorInicial: string | null;
  token: string;
}

const MESES = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const ANOS = Array.from({ length: 5 }, (_, i) => {
  const ano = new Date().getFullYear() - i;
  return { value: ano.toString(), label: ano.toString() };
});

const STATUS_OPTIONS = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDENTE", label: "Pendente" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "PAGO", label: "Pago" },
  { value: "CANCELADO", label: "Cancelado" },
];

export default function FaturasClient({ 
  cooperativaId, 
  relatorioInicial, 
  empresasDisponiveis,
  errorInicial,
  token
}: FaturasClientProps) {
  const router = useRouter();
  const [relatorio, setRelatorio] = useState<RelatorioCooperativaMes | null>(relatorioInicial);
  const [error, setError] = useState<string | null>(errorInicial);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [mesAtual] = useState(() => new Date().getMonth() + 1);
  const [anoAtual] = useState(() => new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState<string>(mesAtual.toString());
  const [anoSelecionado, setAnoSelecionado] = useState<string>(anoAtual.toString());
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string>("TODAS");
  const [statusFiltro, setStatusFiltro] = useState<string>("TODOS");
  
  // Modal para relatório mensal
  const { isOpen, open, close } = useOverlayState();
  const [mesRelatorio, setMesRelatorio] = useState<string>(mesAtual.toString());
  const [anoRelatorio, setAnoRelatorio] = useState<string>(anoAtual.toString());
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

  // Ações por voucher (aprovar/pagar/cancelar/desconto)
  const [vouchersProcessando, setVouchersProcessando] = useState<Set<string>>(new Set());
  const [voucherParaAprovar, setVoucherParaAprovar] = useState<VoucherCooperativa | null>(null);
  const [voucherParaCancelar, setVoucherParaCancelar] = useState<VoucherCooperativa | null>(null);
  const [voucherParaPagar, setVoucherParaPagar] = useState<VoucherCooperativa | null>(null);
  const [voucherParaDesconto, setVoucherParaDesconto] = useState<VoucherCooperativa | null>(null);

  const buscarDados = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Construir URL com parâmetros
      const params = new URLSearchParams();
      params.append('mes', mesSelecionado);
      params.append('ano', anoSelecionado);
      
      if (empresaSelecionada !== "TODAS") {
        params.append('empresaId', empresaSelecionada);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/voucher/cooperativa/${cooperativaId}/mes?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRelatorio(data);
      } else {
        setError(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Erro ao buscar faturas:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  function marcarProcessando(voucherId: string, processando: boolean) {
    setVouchersProcessando((prev) => {
      const next = new Set(prev);
      if (processando) {
        next.add(voucherId);
      } else {
        next.delete(voucherId);
      }
      return next;
    });
  }

  function handleAbrirAprovar(voucher: VoucherCooperativa) {
    marcarProcessando(voucher.id, true);
    setVoucherParaAprovar(voucher);
  }

  function handleFecharAprovar() {
    if (voucherParaAprovar) marcarProcessando(voucherParaAprovar.id, false);
    setVoucherParaAprovar(null);
  }

  async function handleAprovarSucesso() {
    const voucherId = voucherParaAprovar?.id;
    setVoucherParaAprovar(null);
    ShowToast({ color: "success", title: "Voucher aprovado" });
    await buscarDados();
    if (voucherId) marcarProcessando(voucherId, false);
  }

  function handleAbrirCancelar(voucher: VoucherCooperativa) {
    marcarProcessando(voucher.id, true);
    setVoucherParaCancelar(voucher);
  }

  function handleFecharCancelar() {
    if (voucherParaCancelar) marcarProcessando(voucherParaCancelar.id, false);
    setVoucherParaCancelar(null);
  }

  async function handleCancelarSucesso() {
    const voucherId = voucherParaCancelar?.id;
    setVoucherParaCancelar(null);
    ShowToast({ color: "success", title: "Voucher cancelado" });
    await buscarDados();
    if (voucherId) marcarProcessando(voucherId, false);
  }

  function handleAbrirPagamento(voucher: VoucherCooperativa) {
    marcarProcessando(voucher.id, true);
    setVoucherParaPagar(voucher);
  }

  function handleFecharPagamento() {
    if (voucherParaPagar) marcarProcessando(voucherParaPagar.id, false);
    setVoucherParaPagar(null);
  }

  async function handlePagamentoSucesso() {
    const voucherId = voucherParaPagar?.id;
    setVoucherParaPagar(null);
    ShowToast({ color: "success", title: "Pagamento registrado com sucesso" });
    await buscarDados();
    if (voucherId) marcarProcessando(voucherId, false);
  }

  function handleAbrirDesconto(voucher: VoucherCooperativa) {
    marcarProcessando(voucher.id, true);
    setVoucherParaDesconto(voucher);
  }

  function handleFecharDesconto() {
    if (voucherParaDesconto) marcarProcessando(voucherParaDesconto.id, false);
    setVoucherParaDesconto(null);
  }

  async function handleDescontoSucesso() {
    const voucherId = voucherParaDesconto?.id;
    setVoucherParaDesconto(null);
    ShowToast({ color: "success", title: "Desconto aplicado com sucesso" });
    await buscarDados();
    if (voucherId) marcarProcessando(voucherId, false);
  }

  const gerarPDF = async () => {
    try {
      // Construir URL com parâmetros
      const params = new URLSearchParams();
      params.append('mes', mesSelecionado);
      params.append('ano', anoSelecionado);
      
      if (empresaSelecionada !== "TODAS") {
        params.append('empresaId', empresaSelecionada);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/voucher/cooperativa/${cooperativaId}/mes/pdf?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vouchers_${MESES.find(m => m.value === mesSelecionado)?.label}_${anoSelecionado}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError(`Erro ao gerar PDF: ${response.status}`);
      }
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setError("Erro ao gerar PDF");
    }
  };

  const gerarRelatorioMensal = async () => {
    setLoadingRelatorio(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/relatorio/cooperativa/${cooperativaId}/motoristas/pdf?mes=${mesRelatorio}&ano=${anoRelatorio}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_mensal_${MESES.find(m => m.value === mesRelatorio)?.label}_${anoRelatorio}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        close();
      } else {
        setError(`Erro ao gerar relatório: ${response.status}`);
      }
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      setError("Erro ao gerar relatório");
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusStats = (vouchers: VoucherCooperativa[]) => {
    const stats = vouchers.reduce((acc, voucher) => {
      acc[voucher.status] = (acc[voucher.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      PAGO: stats.PAGO || 0,
      PENDENTE: stats.PENDENTE || 0,
      APROVADO: stats.APROVADO || 0,
    };
  };

  const getValorTotalPorStatus = (vouchers: VoucherCooperativa[]) => {
    return vouchers.reduce((acc, voucher) => {
      acc[voucher.status] = (acc[voucher.status] || 0) + voucher.valorTotal;
      return acc;
    }, {} as Record<string, number>);
  };

  const vouchersFiltrados = relatorio?.vouchers.filter(voucher => {
    if (statusFiltro === "TODOS") return true;
    return voucher.status === statusFiltro;
  }) || [];

  const statusStats = relatorio ? getStatusStats(relatorio.vouchers) : { PAGO: 0, PENDENTE: 0, APROVADO: 0 };
  const valorStats = relatorio ? getValorTotalPorStatus(relatorio.vouchers) : { PAGO: 0, PENDENTE: 0, APROVADO: 0 };

  // Criar array de opções de empresas
  const opcoesEmpresas = [
    { value: "TODAS", label: "Todas as empresas" },
    ...empresasDisponiveis
  ];

  return (
    <div className="relative overflow-hidden bg-blue-50/50 dark:bg-gray-900">
      {/* Liquid Glass Background */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-100/40 via-cyan-50/30 to-sky-100/40 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40" />
      <div className="fixed inset-0 backdrop-blur-[2px]" />

      {/* Dynamic Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-32 right-20 w-24 h-24 bg-cyan-200/20 dark:bg-purple-400/10 rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-sky-200/20 dark:bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-300/15 dark:bg-blue-500/8 rounded-full blur-2xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-cyan-300/15 dark:bg-cyan-500/8 rounded-full blur-2xl animate-pulse delay-1200" />
      </div>

      <div className="relative z-10 container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* Header */}
        <header className="pb-4 mb-8 relative group">
          <div className="absolute inset-0 bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-500/15 dark:shadow-black/20" />
          <div className="absolute inset-0 bg-linear-to-r from-blue-400/8 via-cyan-400/8 to-sky-400/8 dark:from-blue-500/3 dark:via-purple-500/3 dark:to-emerald-500/3 rounded-xl" />

          <div className="relative p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  onPress={() => router.back()}
                  className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border-blue-200/40 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 uppercase tracking-widest text-xs"
                >
                  ← Voltar
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
                    Faturas da Cooperativa
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium drop-shadow-lg">
                    Gestão de vouchers e pagamentos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Button
                  variant="tertiary"
                  size="sm"
                  onPress={open}
                  className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-orange-200/40 dark:border-orange-400/20 text-orange-700 dark:text-orange-300 hover:bg-orange-50/20 dark:hover:bg-orange-950/20"
                >
                  <Icon icon="solar:file-chart-linear" />
                  Relatório Mensal
                </Button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-full border border-blue-200/30 dark:border-white/10">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                    {relatorio ? `${relatorio.total} vouchers` : "Carregando..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filtros */}
        <section className="mb-8 relative">
          <div className="absolute inset-0 bg-white/15 dark:bg-white/2 backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
          <div className="relative p-6 rounded-2xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <ComboBox
                  selectedKey={mesSelecionado}
                  onSelectionChange={(key) => {
                    if (key) {
                      setMesSelecionado(key as string);
                    }
                  }}
                  className="max-w-xs"
                  defaultItems={MESES}
                >
                  <Label>Mês</Label>
                  <ComboBox.InputGroup>
                    <Input placeholder="Buscar mês" />
                    <ComboBox.Trigger />
                  </ComboBox.InputGroup>
                  <ComboBox.Popover>
                    <ListBox>
                      {(mes: LabelValue) => (
                        <ListBox.Item id={mes.value} textValue={mes.label}>
                          {mes.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </ComboBox.Popover>
                </ComboBox>

                <ComboBox
                  selectedKey={anoSelecionado}
                  onSelectionChange={(key) => {
                    if (key) {
                      setAnoSelecionado(key as string);
                    }
                  }}
                  className="max-w-xs"
                  defaultItems={ANOS}
                >
                  <Label>Ano</Label>
                  <ComboBox.InputGroup>
                    <Input placeholder="Buscar ano" />
                    <ComboBox.Trigger />
                  </ComboBox.InputGroup>
                  <ComboBox.Popover>
                    <ListBox>
                      {(ano: LabelValue) => (
                        <ListBox.Item id={ano.value} textValue={ano.label}>
                          {ano.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </ComboBox.Popover>
                </ComboBox>

                <ComboBox
                  selectedKey={empresaSelecionada}
                  onSelectionChange={(key) => {
                    if (key) {
                      setEmpresaSelecionada(key as string);
                    }
                  }}
                  className="max-w-xs"
                  defaultItems={opcoesEmpresas}
                >
                  <Label>Empresa</Label>
                  <ComboBox.InputGroup>
                    <Input placeholder="Buscar empresa" />
                    <ComboBox.Trigger />
                  </ComboBox.InputGroup>
                  <ComboBox.Popover>
                    <ListBox>
                      {(empresa: LabelValue) => (
                        <ListBox.Item id={empresa.value} textValue={empresa.label}>
                          {empresa.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </ComboBox.Popover>
                </ComboBox>

                <ComboBox
                  selectedKey={statusFiltro}
                  onSelectionChange={(key) => {
                    if (key) {
                      setStatusFiltro(key as string);
                    }
                  }}
                  className="max-w-xs"
                  defaultItems={STATUS_OPTIONS}
                >
                  <Label>Status</Label>
                  <ComboBox.InputGroup>
                    <Input placeholder="Buscar status" />
                    <ComboBox.Trigger />
                  </ComboBox.InputGroup>
                  <ComboBox.Popover>
                    <ListBox>
                      {(status: LabelValue) => (
                        <ListBox.Item id={status.value} textValue={status.label}>
                          {status.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </ComboBox.Popover>
                </ComboBox>
              </div>

              <Button
                variant="primary"
                onPress={() => buscarDados()}
                isPending={loading}
                className="self-end"
              >
                {!loading && <Icon icon="solar:refresh-linear" />}
                Atualizar
              </Button>
            </div>
          </div>
        </section>

        {/* Cards de Resumo */}
        {relatorio && (
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Geral */}
              <Card className="border border-transparent dark:border-default-100">
                <Card.Header className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:calculator-linear" className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Geral</span>
                  </div>
                </Card.Header>
                <Card.Content className="pt-0">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(relatorio.vouchers.reduce((acc, v) => acc + v.valorTotal, 0))}
                  </div>
                  <p className="text-xs text-gray-500">{relatorio.total} vouchers</p>
                </Card.Content>
              </Card>

              {/* Pendentes */}
              <Card className="border border-transparent dark:border-default-100">
                <Card.Header className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</span>
                  </div>
                </Card.Header>
                <Card.Content className="pt-0">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(valorStats.PENDENTE || 0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="warning" variant="tertiary">
                      {statusStats.PENDENTE} vouchers
                    </Chip>
                  </div>
                </Card.Content>
              </Card>

              {/* Aprovados */}
              <Card className="border border-transparent dark:border-default-100">
                <Card.Header className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:check-circle-linear" className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprovados</span>
                  </div>
                </Card.Header>
                <Card.Content className="pt-0">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(valorStats.APROVADO || 0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="accent" variant="tertiary">
                      {statusStats.APROVADO} vouchers
                    </Chip>
                  </div>
                </Card.Content>
              </Card>

              {/* Pagos */}
              <Card className="border border-transparent dark:border-default-100">
                <Card.Header className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:shield-check-linear" className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos</span>
                  </div>
                </Card.Header>
                <Card.Content className="pt-0">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(valorStats.PAGO || 0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="success" variant="tertiary">
                      {statusStats.PAGO} vouchers
                    </Chip>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </section>
        )}

        {/* Tabela de Vouchers */}
        <section className="relative">
          <div className="absolute inset-0 bg-white/15 dark:bg-white/2 backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
          <div className="relative p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Lista de Vouchers
              </h2>
              <div className="flex items-center gap-2">
                {statusFiltro !== "TODOS" && (
                  <Chip size="sm" variant="tertiary" color="accent">
                    Status: {statusFiltro}
                  </Chip>
                )}
                {empresaSelecionada !== "TODAS" && (
                  <Chip size="sm" variant="tertiary" color="default">
                    Empresa: {empresasDisponiveis.find(e => e.value === empresaSelecionada)?.label || empresaSelecionada}
                  </Chip>
                )}
                {relatorio && (
                  <Chip size="sm" variant="tertiary" color="default">
                    {MESES.find(m => m.value === mesSelecionado)?.label} {anoSelecionado}
                  </Chip>
                )}
                {relatorio && (
                  <Button
                    variant="tertiary"
                    size="sm"
                    onPress={gerarPDF}
                    className="text-success"
                  >
                    <Icon icon="solar:document-add-linear" />
                    Gerar PDF
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" color="accent" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Icon icon="solar:danger-circle-linear" className="w-12 h-12 mx-auto text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Erro ao carregar dados
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                <Button variant="tertiary" onPress={() => buscarDados()}>
                  <Icon icon="solar:refresh-linear" />
                  Tentar Novamente
                </Button>
              </div>
            ) : relatorio ? (
              <VouchersCooperativaTable
                vouchers={vouchersFiltrados}
                vouchersProcessando={vouchersProcessando}
                onAprovar={handleAbrirAprovar}
                onAbrirPagamento={handleAbrirPagamento}
                onAbrirDesconto={handleAbrirDesconto}
                onCancelar={handleAbrirCancelar}
              />
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Icon icon="solar:document-linear" className="w-12 h-12 mx-auto text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Nenhum dado encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Não há vouchers para o período selecionado
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal para Relatório Mensal */}
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
          <Modal.Container placement="center" size="sm">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:file-chart-linear" className="w-5 h-5 text-orange-500" />
                    <span>Relatório Mensal da Cooperativa</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                    Relatório com o total gerado por motorista entre todas as empresas
                  </p>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-4">
                  <ComboBox
                    selectedKey={mesRelatorio}
                    onSelectionChange={(key) => {
                      if (key) {
                        setMesRelatorio(key as string);
                      }
                    }}
                    isRequired
                    defaultItems={MESES}
                  >
                    <Label>Mês</Label>
                    <ComboBox.InputGroup>
                      <Input placeholder="Buscar mês" />
                      <ComboBox.Trigger />
                    </ComboBox.InputGroup>
                    <ComboBox.Popover>
                      <ListBox>
                        {(mes: LabelValue) => (
                          <ListBox.Item id={mes.value} textValue={mes.label}>
                            {mes.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </ComboBox.Popover>
                  </ComboBox>

                  <ComboBox
                    selectedKey={anoRelatorio}
                    onSelectionChange={(key) => {
                      if (key) {
                        setAnoRelatorio(key as string);
                      }
                    }}
                    isRequired
                    defaultItems={ANOS}
                  >
                    <Label>Ano</Label>
                    <ComboBox.InputGroup>
                      <Input placeholder="Buscar ano" />
                      <ComboBox.Trigger />
                    </ComboBox.InputGroup>
                    <ComboBox.Popover>
                      <ListBox>
                        {(ano: LabelValue) => (
                          <ListBox.Item id={ano.value} textValue={ano.label}>
                            {ano.label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        )}
                      </ListBox>
                    </ComboBox.Popover>
                  </ComboBox>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger-soft" onPress={close}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onPress={gerarRelatorioMensal}
                  isPending={loadingRelatorio}
                >
                  {!loadingRelatorio && <Icon icon="solar:download-linear" />}
                  Gerar Relatório
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <ConfirmarAcaoModal
        isOpen={voucherParaAprovar !== null}
        onOpenChange={(open) => !open && handleFecharAprovar()}
        titulo={`Aprovar voucher ${voucherParaAprovar?.numeroVoucher ?? ""}`}
        descricao='O voucher passa para "Aprovado, aguardando pagamento".'
        rotuloConfirmar="Aprovar"
        corConfirmar="primary"
        onConfirmar={async () => {
          if (!voucherParaAprovar) return { success: false, message: "Voucher inválido" };
          return aprovarVoucher({ voucherId: voucherParaAprovar.id, token });
        }}
        onSucesso={handleAprovarSucesso}
      />

      <ConfirmarAcaoModal
        isOpen={voucherParaCancelar !== null}
        onOpenChange={(open) => !open && handleFecharCancelar()}
        titulo={`Cancelar voucher ${voucherParaCancelar?.numeroVoucher ?? ""}`}
        descricao="O voucher passa para “Cancelado” e não poderá mais ser aprovado ou pago."
        rotuloConfirmar="Cancelar voucher"
        corConfirmar="danger"
        onConfirmar={async () => {
          if (!voucherParaCancelar) return { success: false, message: "Voucher inválido" };
          return cancelarVoucher({ voucherId: voucherParaCancelar.id, token });
        }}
        onSucesso={handleCancelarSucesso}
      />

      <ConfirmarPagamentoModal
        isOpen={voucherParaPagar !== null}
        onOpenChange={(open) => !open && handleFecharPagamento()}
        voucher={voucherParaPagar}
        token={token}
        onSucesso={handlePagamentoSucesso}
      />

      <AplicarDescontoModal
        isOpen={voucherParaDesconto !== null}
        onOpenChange={(open) => !open && handleFecharDesconto()}
        voucher={voucherParaDesconto}
        token={token}
        onSucesso={handleDescontoSucesso}
      />
    </div>
  );
}