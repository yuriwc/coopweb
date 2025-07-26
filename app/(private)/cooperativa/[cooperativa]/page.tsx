import { ActionButton } from "@/src/components/ActionButton";
import { FilasDisplay, FilasHeader } from "@/src/components/FilasDisplay";

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;

  return (
    <div className="h-[calc(100vh-65px)] bg-gray-50 dark:bg-gray-900">
      {/* Main Container */}
      <div className="h-full flex flex-col">
        {/* Top Header Bar */}
        <div className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Digitaxi
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Painel da Cooperativa
              </p>
            </div>
            
            {/* Filas Header */}
            <FilasHeader cooperativaId={params.cooperativa} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Filas Section */}
            <section>
              <FilasDisplay cooperativaId={params.cooperativa} showHeader={true} />
            </section>

            {/* Actions Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ações Rápidas
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Acesse as principais funcionalidades do sistema
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <ActionButton
                  title="Viagens Programadas"
                  description="Gerencie as viagens programadas disponíveis"
                  href={"./" + params.cooperativa + "/programadas"}
                  icon="solar:calendar-linear"
                />
                <ActionButton
                  title="Faturas"
                  description="Acesse relatórios detalhados de vouchers e pagamentos"
                  href={"./" + params.cooperativa + "/faturas"}
                  icon="solar:document-text-linear"
                  variant="secondary"
                />
                <ActionButton
                  title="Monitoramento"
                  description="Acompanhe as viagens dos colaboradores em tempo real"
                  href={params.cooperativa + "/ride/realtime"}
                  icon="solar:gps-linear"
                  variant="tertiary"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
