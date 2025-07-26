"use client";

import { CentroCustoResumo } from "@/src/model/relatorio-vouchers";
import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

const VouchersCharts = dynamic(() => import("./charts"), {
  loading: () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/20 dark:bg-white/3 backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Carregando gráficos...
            </p>
          </div>
        </div>
        <div className="bg-white/20 dark:bg-white/3 backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Carregando gráficos...
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white/20 dark:bg-white/3 backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Carregando gráficos...
          </p>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

interface ResumoClientProps {
  empresaId: string;
  token: string;
  dataInicio?: string;
  dataFim?: string;
}

export default function ResumoClient({
  empresaId,
  token,
  dataInicio,
  dataFim,
}: ResumoClientProps) {
  const [resumo, setResumo] = useState<CentroCustoResumo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("current");

  const defaultDataInicio = useMemo(
    () =>
      dataInicio || new Date(new Date().setDate(1)).toISOString().split("T")[0],
    [dataInicio]
  );

  const defaultDataFim = useMemo(
    () => dataFim || new Date().toISOString().split("T")[0],
    [dataFim]
  );

  // Get last 3 months data
  const getMonthsData = () => {
    const now = new Date();
    const months = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNumber = date.getMonth() + 1;
      const monthName = date.toLocaleString("pt-BR", { month: "long" });
      const monthNameCapitalized =
        monthName.charAt(0).toUpperCase() + monthName.slice(1);

      months.push({
        key: i === 0 ? "current" : `month-${monthNumber}`,
        label: monthNameCapitalized,
        monthNumber,
        date,
      });
    }

    return months;
  };

  const monthsData = getMonthsData();

  const fetchData = useCallback(
    async (month?: number) => {
      console.log("🔍 [fetchData] Iniciando - month:", month);
      try {
        setLoading(true);
        setError(false);

        let startDate: string;
        let endDate: string;

        if (month) {
          const now = new Date();
          const start = new Date(now.getFullYear(), month - 1, 1);
          const end = new Date(now.getFullYear(), month, 0);

          startDate = start.toISOString().split("T")[0];
          endDate = end.toISOString().split("T")[0];
        } else {
          startDate = defaultDataInicio;
          endDate = defaultDataFim;
        }

        const url = month
          ? `${process.env.NEXT_PUBLIC_SERVER}/api/v1/relatorio/empresa/${empresaId}/vouchers/centro-custo/resumo?mes=${month}`
          : `${process.env.NEXT_PUBLIC_SERVER}/api/v1/relatorio/empresa/${empresaId}/vouchers/centro-custo/resumo?dataInicio=${startDate}&dataFim=${endDate}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("❌ [fetchData] API error:", response.status);
          setError(true);
          return;
        }

        const data: CentroCustoResumo[] = await response.json();
        console.log("✅ [fetchData] Success - data length:", data.length);
        setResumo(data);
      } catch (error) {
        console.error("💥 [fetchData] Exception:", error);
        setError(true);
      } finally {
        setLoading(false);
        console.log("🏁 [fetchData] Finalizado");
      }
    },
    [token, empresaId, defaultDataInicio, defaultDataFim]
  );

  useEffect(() => {
    if (token) {
      console.log("🚀 [useEffect] Calling fetchData...");
      fetchData();
    } else {
      console.log("⏸️ [useEffect] No token, skipping fetchData");
    }
  }, [token, empresaId, fetchData]);

  const handleMonthChange = (month: string) => {
    console.log("📅 [handleMonthChange] Month selected:", month);
    setSelectedMonth(month);

    if (month === "current") {
      fetchData();
    } else {
      const monthData = monthsData.find((m) => m.key === month);
      if (monthData) {
        fetchData(monthData.monthNumber);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="solar:refresh-linear"
            className="w-8 h-8 animate-spin mx-auto mb-4"
          />
          <p>Carregando resumo...</p>
        </div>
      </div>
    );
  }

  if (error || !resumo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center p-8">
            <Icon
              icon="solar:danger-triangle-linear"
              className="w-16 h-16 mx-auto text-danger mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-gray-600">
              Não foi possível carregar o resumo de vouchers.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const totals = resumo.reduce(
    (acc, centro) => ({
      totalVouchers: acc.totalVouchers + centro.totalVouchers,
      valorTotal: acc.valorTotal + centro.valorTotal,
      valorPago: acc.valorPago + centro.valorPago,
      valorPendente: acc.valorPendente + centro.valorPendente,
    }),
    { totalVouchers: 0, valorTotal: 0, valorPago: 0, valorPendente: 0 }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-blue-50/50 dark:bg-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-100/40 via-cyan-50/30 to-sky-100/40 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40" />
      <div className="fixed inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* Header */}
        <header className="pb-2 mb-6 relative group">
          <div className="absolute inset-0 bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-500/15 dark:shadow-black/20" />
          <div className="relative p-6 rounded-xl">
            <div className="flex flex-col gap-4">
              <Button
                as="a"
                href={`/${empresaId}`}
                variant="light"
                color="default"
                startContent={
                  <Icon icon="solar:arrow-left-linear" className="w-4 h-4" />
                }
                className="self-start"
              >
                Voltar
              </Button>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                    Resumo de Vouchers
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Análise gráfica por centro de custo
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Período: {formatDate(defaultDataInicio)} até{" "}
                    {formatDate(defaultDataFim)}
                  </p>
                </div>
                <Button
                  as="a"
                  href={`/${empresaId}/vouchers/dashboard`}
                  variant="ghost"
                  color="primary"
                  startContent={
                    <Icon icon="solar:list-linear" className="w-4 h-4" />
                  }
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Month Filter Tabs */}
        <section className="mb-6">
          <Card className="bg-white/20 dark:bg-white/3 backdrop-blur-xl border border-blue-200/40 dark:border-white/10">
            <CardBody className="p-4">
              <Tabs
                selectedKey={selectedMonth}
                onSelectionChange={(key) => handleMonthChange(key as string)}
                variant="underlined"
                color="primary"
              >
                {monthsData.map((month) => (
                  <Tab key={month.key} title={month.label} />
                ))}
              </Tabs>
            </CardBody>
          </Card>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/18 dark:bg-white/5 backdrop-blur-xl border border-blue-200/30 dark:border-white/10">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100/20 dark:bg-blue-900/20 rounded-lg">
                  <Icon
                    icon="solar:ticket-linear"
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totals.totalVouchers}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Total Vouchers
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white/18 dark:bg-white/5 backdrop-blur-xl border border-emerald-200/30 dark:border-white/10">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100/20 dark:bg-emerald-900/20 rounded-lg">
                  <Icon
                    icon="solar:dollar-linear"
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totals.valorTotal)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Valor Total
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white/18 dark:bg-white/5 backdrop-blur-xl border border-green-200/30 dark:border-white/10">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100/20 dark:bg-green-900/20 rounded-lg">
                  <Icon
                    icon="solar:check-circle-linear"
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totals.valorPago)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Valor Pago
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white/18 dark:bg-white/5 backdrop-blur-xl border border-orange-200/30 dark:border-white/10">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100/20 dark:bg-orange-900/20 rounded-lg">
                  <Icon
                    icon="solar:clock-circle-linear"
                    className="w-5 h-5 text-orange-600 dark:text-orange-400"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totals.valorPendente)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Valor Pendente
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Charts */}
        <VouchersCharts data={resumo} />

        <div className="pb-20" />
      </div>
    </div>
  );
}
