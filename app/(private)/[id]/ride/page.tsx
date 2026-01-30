import { getToken } from "@/src/utils/token/get-token";
import { ViagemResumo } from "@/src/model/viagem";
import Breadcrumb from "@/src/components/breadcrumb";
import ViagemTable from "./viagem-table";
import FilterPeriodo from "./filter-periodo";
import LoadingOverlay from "./loading-overlay";

const App = async (props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const periodo = searchParams.periodo || "hora";

  const url = [
    {
      name: "Início",
      url: `/${params.id}`,
    },
    {
      name: "Minhas Viagens",
      url: `${params.id}/ride/`,
    },
  ];

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
    <div className="min-h-screen relative overflow-hidden bg-[#F5F5F5] dark:bg-[#060607]">

      <div className="relative z-10 mx-auto max-w-7xl w-full pt-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Container */}
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm" />
          <div className="relative p-4 rounded-2xl">
            <Breadcrumb items={url} />
          </div>
        </div>

        {/* Header Section */}
        <section className="mb-8 relative group">
          <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg" />

          {/* Loading Overlay */}
          <LoadingOverlay />

          <div className="relative p-6 rounded-2xl transition-all duration-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                  Minhas Viagens
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  Histórico completo das suas viagens realizadas
                </p>
              </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <FilterPeriodo
                  currentPeriodo={periodo}
                  baseUrl={`/${params.id}/ride`}
                />
              </div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700 mb-6" />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Total de Viagens Card */}
              <div className="relative group/card">
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md" />

                <div className="relative p-6 rounded-xl transition-all duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
                          </svg>
                        </div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-400">
                          Total de Viagens
                        </span>
                      </div>
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">
                        {viagens.totalViagens}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Valor Total Card */}
              <div className="relative group/card">
                <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md" />

                <div className="relative p-6 rounded-xl transition-all duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        </div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-400">
                          Valor Total
                        </span>
                      </div>
                      <span className="text-3xl font-bold text-gray-800 dark:text-white">
                        R$ {viagens.totalValor.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Table Container */}
        <section className="relative group mb-8">
          <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg" />

          {/* Loading Overlay */}
          <LoadingOverlay />

          <div className="relative p-6 rounded-2xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
                Histórico de Viagens
              </h2>
            </div>

            {/* Table Container */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 min-h-[500px]">
              <ViagemTable viagens={viagens.viagens} />
            </div>
          </div>
        </section>

        <div className="pb-20" />
      </div>
    </div>
  );
};

export default App;
