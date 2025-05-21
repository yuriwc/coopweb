import { ActionButton } from "@/src/components/ActionButton";

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;

  return (
    <div className="h-screen flex flex-col p-4 sm:p-8 overflow-y-auto">
      {/* Header */}
      <header className="pb-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-light tracking-[0.18em] uppercase">
            Digitaxi
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mb-12 overflow-visible">
        <div className="mb-8">
          <p className="mb-6 text-sm font-light tracking-[0.15em] uppercase">
            O que deseja fazer?
          </p>
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
              description="Acesse relatórios detalhados da viagens da cooperativa"
              href={params.cooperativa + "/ride"}
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
  );
};

export default App;
