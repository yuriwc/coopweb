import { getToken } from "@/src/utils/token/get-token";
import { CentroCustoResumo } from "@/src/model/relatorio-vouchers";
import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Suspense } from "react";
import VouchersCharts from "./charts";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dataInicio?: string; dataFim?: string }>;
}

async function ResumoVouchers({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const dataInicio =
    resolvedSearchParams.dataInicio ||
    new Date(new Date().setDate(1)).toISOString().split("T")[0];
  const dataFim =
    resolvedSearchParams.dataFim || new Date().toISOString().split("T")[0];

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/relatorio/empresa/${resolvedParams.id}/vouchers/centro-custo/resumo?dataInicio=${dataInicio}&dataFim=${dataFim}`,
    {
      next: { tags: ["getVouchersResumo"] },
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
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

  const resumo: CentroCustoResumo[] = await response.json();

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
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100/40 via-cyan-50/30 to-sky-100/40 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40" />
      <div className="fixed inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* Header */}
        <header className="pb-2 mb-6 relative group">
          <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-500/15 dark:shadow-black/20" />
          <div className="relative p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                  Resumo de Vouchers
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Análise gráfica por centro de custo
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Período: {formatDate(dataInicio)} até {formatDate(dataFim)}
                </p>
              </div>
              <Button
                as="a"
                href={`/${resolvedParams.id}/vouchers/dashboard`}
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
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl border border-blue-200/30 dark:border-white/10">
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

          <Card className="bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl border border-emerald-200/30 dark:border-white/10">
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

          <Card className="bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl border border-green-200/30 dark:border-white/10">
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

          <Card className="bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl border border-orange-200/30 dark:border-white/10">
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

export default function ResumoPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Icon
              icon="solar:refresh-linear"
              className="w-8 h-8 animate-spin mx-auto mb-4"
            />
            <p>Carregando resumo...</p>
          </div>
        </div>
      }
    >
      <ResumoVouchers {...props} />
    </Suspense>
  );
}
