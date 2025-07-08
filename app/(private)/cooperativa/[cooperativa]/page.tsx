import { ActionButton } from "@/src/components/ActionButton";

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50/80 to-indigo-100/60 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/30">
      {/* Background aquático com partículas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-sky-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-tl from-sky-400/10 to-indigo-400/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 h-screen flex flex-col p-4 sm:p-8 overflow-y-auto">
        {/* Header */}
        <header className="pb-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl px-6 py-3 shadow-xl">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-wide">
                Digitaxi
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mb-12 overflow-visible flex-1">
          <div className="mb-8">
            <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-xl px-4 py-3 shadow-lg inline-block">
              <p className="text-sm font-medium tracking-[0.15em] uppercase text-slate-700 dark:text-slate-200">
                O que deseja fazer?
              </p>
            </div>
          </div>

          {/* Container único dos ActionButtons - Grid Responsivo */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch pb-16">
            <div className="w-full h-[180px]">
              <ActionButton
                title="Viagens Programadas"
                description="Gerencie as viagens progradas disponíveis"
                href={"./" + params.cooperativa + "/programadas"}
              />
            </div>
            <div className="w-full h-[180px]">
              <ActionButton
                title="Faturas"
                description="Acesse relatórios detalhados de vouchers e pagamentos"
                href={"./" + params.cooperativa + "/faturas"}
                variant="secondary"
              />
            </div>
            <div className="w-full h-[180px] mb-10">
              <ActionButton
                title="Monitoramento"
                description="Acompanhe as viagens dos seus colaboradores em tempo real"
                href={params.cooperativa + "/ride/realtime"}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
