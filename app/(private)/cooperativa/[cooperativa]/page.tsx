import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card } from "@heroui/react";
import { FilasDisplay, FilasHeader } from "@/src/components/FilasDisplay";
import { PendingRides, PendingRidesHeader } from "@/src/components/PendingRides";

const ACOES_RAPIDAS = [
  {
    title: "Viagens Programadas",
    description: "Gerencie as viagens programadas disponíveis",
    href: "programadas",
    icon: "solar:calendar-linear",
  },
  {
    title: "Gestão de Motoristas",
    description: "Cadastre motoristas, vincule veículos e bloqueie/reative",
    href: "motoristas",
    icon: "solar:user-id-linear",
  },
  {
    title: "Cadastrar Empresa",
    description: "Cadastre uma nova empresa cliente da cooperativa",
    href: "empresas/nova",
    icon: "solar:buildings-2-linear",
  },
  {
    title: "Gestão de Filas",
    description: "Crie e acompanhe os pontos de atendimento",
    href: "filas",
    icon: "solar:map-point-wave-linear",
  },
  {
    title: "Faturas",
    description: "Acesse relatórios detalhados de vouchers e pagamentos",
    href: "faturas",
    icon: "solar:document-text-linear",
  },
  {
    title: "Monitoramento",
    description: "Acompanhe as viagens dos colaboradores em tempo real",
    href: "ride/realtime",
    icon: "solar:gps-linear",
  },
];

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Digitaxi
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Painel da Cooperativa
            </p>
          </div>

          <div className="flex items-center gap-6">
            <PendingRidesHeader cooperativaId={params.cooperativa} />
            <FilasHeader cooperativaId={params.cooperativa} />
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Coluna principal: operação em tempo real */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            <section>
              <PendingRides cooperativaId={params.cooperativa} showHeader />
            </section>

            <section>
              <FilasDisplay cooperativaId={params.cooperativa} showHeader />
            </section>
          </div>

          {/* Barra lateral: ações rápidas */}
          <div className="xl:col-span-1">
            <Card className="xl:sticky xl:top-8">
              <Card.Header>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Ações Rápidas
                </h2>
              </Card.Header>
              <Card.Content className="p-0">
                <nav className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                  {ACOES_RAPIDAS.map((acao) => (
                    <Link
                      key={acao.title}
                      href={`./${params.cooperativa}/${acao.href}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                        <Icon icon={acao.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {acao.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {acao.description}
                        </p>
                      </div>
                      <Icon
                        icon="solar:alt-arrow-right-linear"
                        className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors shrink-0"
                      />
                    </Link>
                  ))}
                </nav>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
