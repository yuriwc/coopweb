import Link from "next/link";
import { getToken } from "@/src/utils/token/get-token";
import { ViagemResumo } from "@/src/model/viagem";
import ViagemTable from "./viagem-table";
import FilterPeriodo from "./filter-periodo";
import LoadingOverlay from "./loading-overlay";
import { Card } from "@heroui/react";
import { Separator } from "@heroui/react/separator";
import { Icon } from "@iconify/react";

const App = async (props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const periodo = searchParams.periodo || "hora";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}/viagens?periodo=${periodo}`,
    {
      next: {
        tags: ["getViagens"],
      },
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const viagens = (await response.json()) as ViagemResumo;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl w-full pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <header className="flex items-center gap-4 mb-8">
          <Link
            href={`/${params.id}`}
            aria-label="Voltar"
            className="inline-flex items-center justify-center rounded-md bg-default-100 dark:bg-default-50 h-10 w-10 text-gray-700 dark:text-gray-300 hover:opacity-80 transition-opacity"
          >
            <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Minhas Viagens
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Histórico completo das suas viagens realizadas
            </p>
          </div>
        </header>

        {/* Superfície única: filtro, resumo e histórico */}
        <Card className="border border-gray-200 dark:border-gray-700 relative">
          <LoadingOverlay />
          <Card.Content className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <FilterPeriodo
                currentPeriodo={periodo}
                baseUrl={`/${params.id}/ride`}
              />

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon icon="solar:routing-2-linear" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                      Total de Viagens
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {viagens.totalViagens}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
                    <Icon icon="solar:wallet-money-linear" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                      Valor Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      R$ {viagens.totalValor.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            <ViagemTable viagens={viagens.viagens} />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default App;
