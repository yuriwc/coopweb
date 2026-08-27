"use client";

import { CentroCustoResumo } from "@/src/model/relatorio-vouchers";
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Tabs } from "@heroui/react";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { fetchComLog } from "@/src/utils/log-fetch";

const VouchersCharts = dynamic(() => import("./charts"), {
  loading: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-md border border-gray-200 dark:border-gray-700 h-96 flex items-center justify-center">
          <Icon
            icon="solar:refresh-linear"
            className="w-8 h-8 animate-spin text-accent"
          />
        </div>
        <div className="rounded-md border border-gray-200 dark:border-gray-700 h-96 flex items-center justify-center">
          <Icon
            icon="solar:refresh-linear"
            className="w-8 h-8 animate-spin text-accent"
          />
        </div>
      </div>
      <div className="rounded-md border border-gray-200 dark:border-gray-700 h-96 flex items-center justify-center">
        <Icon
          icon="solar:refresh-linear"
          className="w-8 h-8 animate-spin text-accent"
        />
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

  const monthsData = useMemo(() => {
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
  }, []);

  const fetchData = useCallback(
    async (month?: number) => {
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

        const response = await fetchComLog(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Erro na requisição:", response.status, response.statusText);
          setError(true);
          return;
        }

        const data: CentroCustoResumo[] = await response.json();
        setResumo(data);
      } catch (error) {
        console.error("Erro ao buscar resumo de vouchers:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [token, empresaId, defaultDataInicio, defaultDataFim]
  );

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, empresaId, fetchData]);

  const handleMonthChange = (month: string) => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Icon
            icon="solar:refresh-linear"
            className="w-8 h-8 animate-spin mx-auto mb-4 text-accent"
          />
          <p className="text-gray-600 dark:text-gray-300">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  if (error || !resumo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md border border-gray-200 dark:border-gray-700">
          <Card.Content className="text-center p-8">
            <Icon
              icon="solar:danger-triangle-linear"
              className="w-16 h-16 mx-auto text-danger mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Erro ao carregar dados
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Não foi possível carregar o resumo de vouchers.
            </p>
          </Card.Content>
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

  const summaryCards = [
    {
      key: "total",
      icon: "solar:ticket-linear",
      iconClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900",
      value: totals.totalVouchers,
      label: "Total Vouchers",
    },
    {
      key: "valorTotal",
      icon: "solar:dollar-linear",
      iconClass:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900",
      value: formatCurrency(totals.valorTotal),
      label: "Valor Total",
    },
    {
      key: "valorPago",
      icon: "solar:check-circle-linear",
      iconClass:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900",
      value: formatCurrency(totals.valorPago),
      label: "Valor Pago",
    },
    {
      key: "valorPendente",
      icon: "solar:clock-circle-linear",
      iconClass:
        "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900",
      value: formatCurrency(totals.valorPendente),
      label: "Valor Pendente",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl w-full pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/${empresaId}`}
              aria-label="Voltar"
              className="inline-flex items-center justify-center rounded-md bg-default dark:bg-default h-10 w-10 text-gray-700 dark:text-gray-300 hover:opacity-80 transition-opacity shrink-0"
            >
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Resumo de Vouchers
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Análise gráfica por centro de custo · {formatDate(defaultDataInicio)}{" "}
                até {formatDate(defaultDataFim)}
              </p>
            </div>
          </div>
          <Link
            href={`/${empresaId}/vouchers/dashboard`}
            className="inline-flex items-center gap-2 rounded-md border border-accent dark:border-accent text-accent dark:text-accent px-4 h-10 text-sm font-medium hover:opacity-80 transition-opacity shrink-0"
          >
            <Icon icon="solar:list-linear" className="w-4 h-4" />
            Ver Detalhes
          </Link>
        </header>

        <Card className="border border-gray-200 dark:border-gray-700 mb-6">
          <Card.Content className="p-6 sm:p-8">
            <Tabs
              selectedKey={selectedMonth}
              onSelectionChange={(key) => handleMonthChange(key as string)}
              className="mb-6"
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Selecionar mês">
                  {monthsData.map((month, index) => (
                    <Tabs.Tab key={month.key} id={month.key}>
                      {index > 0 && <Tabs.Separator />}
                      {month.label}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
              {monthsData.map((month) => (
                <Tabs.Panel key={month.key} id={month.key}>{null}</Tabs.Panel>
              ))}
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryCards.map((card) => (
                <div
                  key={card.key}
                  className="flex items-center gap-3 p-4 rounded-md bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className={`p-2 rounded-lg ${card.iconClass}`}>
                    <Icon icon={card.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {card.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <VouchersCharts data={resumo} />
      </div>
    </div>
  );
}
