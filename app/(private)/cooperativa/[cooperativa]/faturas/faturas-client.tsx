"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Spinner } from "@heroui/spinner";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { RelatorioCooperativaMes, VoucherCooperativa, EmpresaLabelValue } from "../../../../../src/model/relatorio-vouchers";
import VouchersCooperativaTable from "./vouchers-cooperativa-table";

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [mesRelatorio, setMesRelatorio] = useState<string>(mesAtual.toString());
  const [anoRelatorio, setAnoRelatorio] = useState<string>(anoAtual.toString());
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

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
        onClose();
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
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100/40 via-cyan-50/30 to-sky-100/40 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40" />
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
          <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-500/15 dark:shadow-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/[0.08] via-cyan-400/[0.08] to-sky-400/[0.08] dark:from-blue-500/[0.03] dark:via-purple-500/[0.03] dark:to-emerald-500/[0.03] rounded-xl" />

          <div className="relative p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="bordered"
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
                  color="warning"
                  variant="flat"
                  size="sm"
                  onPress={onOpen}
                  startContent={<Icon icon="solar:file-chart-linear" />}
                  className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-orange-200/40 dark:border-orange-400/20 text-orange-700 dark:text-orange-300 hover:bg-orange-50/20 dark:hover:bg-orange-950/20"
                >
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
          <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
          <div className="relative p-6 rounded-2xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Autocomplete
                  label="Mês"
                  placeholder="Buscar mês"
                  selectedKey={mesSelecionado}
                  onSelectionChange={(key) => {
                    if (key) {
                      setMesSelecionado(key as string);
                    }
                  }}
                  className="max-w-xs"
                  size="sm"
                  defaultItems={MESES}
                >
                  {(mes) => (
                    <AutocompleteItem key={mes.value}>{mes.label}</AutocompleteItem>
                  )}
                </Autocomplete>

                <Autocomplete
                  label="Ano"
                  placeholder="Buscar ano"
                  selectedKey={anoSelecionado}
                  onSelectionChange={(key) => {
                    if (key) {
                      setAnoSelecionado(key as string);
                    }
                  }}
                  className="max-w-xs"
                  size="sm"
                  defaultItems={ANOS}
                >
                  {(ano) => (
                    <AutocompleteItem key={ano.value}>{ano.label}</AutocompleteItem>
                  )}
                </Autocomplete>

                <Autocomplete
                  label="Empresa"
                  placeholder="Buscar empresa"
                  selectedKey={empresaSelecionada}
                  onSelectionChange={(key) => {
                    if (key) {
                      setEmpresaSelecionada(key as string);
                    }
                  }}
                  className="max-w-xs"
                  size="sm"
                  defaultItems={opcoesEmpresas}
                >
                  {(empresa) => (
                    <AutocompleteItem key={empresa.value}>{empresa.label}</AutocompleteItem>
                  )}
                </Autocomplete>

                <Autocomplete
                  label="Status"
                  placeholder="Buscar status"
                  selectedKey={statusFiltro}
                  onSelectionChange={(key) => {
                    if (key) {
                      setStatusFiltro(key as string);
                    }
                  }}
                  className="max-w-xs"
                  size="sm"
                  defaultItems={STATUS_OPTIONS}
                >
                  {(status) => (
                    <AutocompleteItem key={status.value}>{status.label}</AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              <Button
                color="primary"
                variant="solid"
                onPress={() => buscarDados()}
                isLoading={loading}
                startContent={!loading && <Icon icon="solar:refresh-linear" />}
                className="self-end"
              >
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
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:calculator-linear" className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Geral</span>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(relatorio.vouchers.reduce((acc, v) => acc + v.valorTotal, 0))}
                  </div>
                  <p className="text-xs text-gray-500">{relatorio.total} vouchers</p>
                </CardBody>
              </Card>

              {/* Pendentes */}
              <Card className="border border-transparent dark:border-default-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:clock-circle-linear" className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</span>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(valorStats.PENDENTE || 0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="warning" variant="flat">
                      {statusStats.PENDENTE} vouchers
                    </Chip>
                  </div>
                </CardBody>
              </Card>

              {/* Aprovados */}
              <Card className="border border-transparent dark:border-default-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:check-circle-linear" className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprovados</span>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(valorStats.APROVADO || 0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="primary" variant="flat">
                      {statusStats.APROVADO} vouchers
                    </Chip>
                  </div>
                </CardBody>
              </Card>

              {/* Pagos */}
              <Card className="border border-transparent dark:border-default-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:shield-check-linear" className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos</span>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(valorStats.PAGO || 0)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="success" variant="flat">
                      {statusStats.PAGO} vouchers
                    </Chip>
                  </div>
                </CardBody>
              </Card>
            </div>
          </section>
        )}

        {/* Tabela de Vouchers */}
        <section className="relative">
          <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
          <div className="relative p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Lista de Vouchers
              </h2>
              <div className="flex items-center gap-2">
                {statusFiltro !== "TODOS" && (
                  <Chip size="sm" variant="flat" color="primary">
                    Status: {statusFiltro}
                  </Chip>
                )}
                {empresaSelecionada !== "TODAS" && (
                  <Chip size="sm" variant="flat" color="secondary">
                    Empresa: {empresasDisponiveis.find(e => e.value === empresaSelecionada)?.label || empresaSelecionada}
                  </Chip>
                )}
                {relatorio && (
                  <Chip size="sm" variant="flat" color="default">
                    {MESES.find(m => m.value === mesSelecionado)?.label} {anoSelecionado}
                  </Chip>
                )}
                {relatorio && (
                  <Button
                    color="success"
                    variant="flat"
                    size="sm"
                    onPress={gerarPDF}
                    startContent={<Icon icon="solar:document-add-linear" />}
                  >
                    Gerar PDF
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" color="primary" />
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
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => buscarDados()}
                  startContent={<Icon icon="solar:refresh-linear" />}
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : relatorio ? (
              <VouchersCooperativaTable vouchers={vouchersFiltrados} />
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
      <Modal isOpen={isOpen} onClose={onClose} placement="center" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:file-chart-linear" className="w-5 h-5 text-orange-500" />
                  <span>Relatório Mensal da Cooperativa</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                  Relatório com o total gerado por motorista entre todas as empresas
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Autocomplete
                    label="Mês"
                    placeholder="Buscar mês"
                    selectedKey={mesRelatorio}
                    onSelectionChange={(key) => {
                      if (key) {
                        setMesRelatorio(key as string);
                      }
                    }}
                    size="sm"
                    isRequired
                    defaultItems={MESES}
                  >
                    {(mes) => (
                      <AutocompleteItem key={mes.value}>{mes.label}</AutocompleteItem>
                    )}
                  </Autocomplete>

                  <Autocomplete
                    label="Ano"
                    placeholder="Buscar ano"
                    selectedKey={anoRelatorio}
                    onSelectionChange={(key) => {
                      if (key) {
                        setAnoRelatorio(key as string);
                      }
                    }}
                    size="sm"
                    isRequired
                    defaultItems={ANOS}
                  >
                    {(ano) => (
                      <AutocompleteItem key={ano.value}>{ano.label}</AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="warning"
                  onPress={gerarRelatorioMensal}
                  isLoading={loadingRelatorio}
                  startContent={!loadingRelatorio && <Icon icon="solar:download-linear" />}
                >
                  Gerar Relatório
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}