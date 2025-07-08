import { cookies } from "next/headers";

interface IProgramadaComMotorista {
  id: string;
  nomeEmpresa: string;
  enderecoEmpresa: string;
  nomesPassageiros: string[];
  enderecosPassageiros: string[];
  horaSaida: string;
  horaRetorno: string;
  tipoViagem: "Apanha" | "Retorno" | "APANHA_E_RETORNO";
  motoristaId: string;
  motoristaNome: string;
  motoristaTelefone: string;
  motoristaMatricula: string;
}

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const programadasRequest = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/com-motorista`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["programacoes-com-motorista"] },
    }
  );

  if (!programadasRequest.ok) {
    console.error("Erro na requisição:", programadasRequest.status, programadasRequest.statusText);
    return null;
  }
  
  const programadas = (await programadasRequest.json()) as IProgramadaComMotorista[];

  const getTipoViagemLabel = (tipo: string) => {
    switch (tipo) {
      case "Apanha":
        return "APANHA";
      case "Retorno":
        return "RETORNO";
      case "APANHA_E_RETORNO":
        return "IDA E VOLTA";
      default:
        return tipo.toUpperCase();
    }
  };

  const getTipoViagemColor = (tipo: string) => {
    switch (tipo) {
      case "Apanha":
        return "bg-blue-100/30 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "Retorno":
        return "bg-green-100/30 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "APANHA_E_RETORNO":
        return "bg-purple-100/30 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      default:
        return "bg-gray-100/30 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50/80 to-indigo-100/60 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/30">
      {/* Background aquático com partículas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-sky-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-tl from-sky-400/10 to-indigo-400/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <header className="mb-8">
            <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-6 shadow-xl">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-wide">
                VIAGENS COM MOTORISTA
              </h1>
              <p className="text-sm font-medium tracking-[0.15em] uppercase mt-2 text-slate-600 dark:text-slate-300">
                {programadas.length} viagens atribuídas
              </p>
            </div>
          </header>

          {/* Lista de Viagens */}
          <div className="space-y-6">
            {programadas.map((viagem) => (
              <div
                key={viagem.id}
                className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Cabeçalho do Card */}
                <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                  <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-blue-100/20 dark:bg-blue-900/20">
                    <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                      VIAGEM
                    </p>
                  </div>
                  <div className="col-span-3 p-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      #{viagem.id.slice(0, 8).toUpperCase()}
                    </p>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoViagemColor(viagem.tipoViagem)}`}>
                      {getTipoViagemLabel(viagem.tipoViagem)}
                    </div>
                  </div>
                </div>

                {/* Motorista */}
                <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                  <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-emerald-100/20 dark:bg-emerald-900/20">
                    <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                      MOTORISTA
                    </p>
                  </div>
                  <div className="col-span-3 p-4">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                      {viagem.motoristaNome}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        📱 {viagem.motoristaTelefone}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        🆔 {viagem.motoristaMatricula}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                  <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-sky-100/20 dark:bg-sky-900/20">
                    <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                      HORÁRIO
                    </p>
                  </div>
                  <div className="col-span-3 p-4">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {viagem.horaSaida} → {viagem.horaRetorno}
                    </p>
                  </div>
                </div>

                {/* Empresa */}
                <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                  <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-orange-100/20 dark:bg-orange-900/20">
                    <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                      EMPRESA
                    </p>
                  </div>
                  <div className="col-span-3 p-4">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {viagem.nomeEmpresa}
                    </p>
                  </div>
                </div>

                {/* Passageiros */}
                <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                  <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-indigo-100/20 dark:bg-indigo-900/20">
                    <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                      PASSAGEIROS
                    </p>
                  </div>
                  <div className="col-span-3 p-4">
                    {viagem.nomesPassageiros.map((nome, index) => (
                      <p
                        key={index}
                        className="text-sm font-medium text-slate-800 dark:text-slate-100"
                      >
                        {nome.toUpperCase()}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Endereços */}
                <div className="grid grid-cols-5">
                  <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-cyan-100/20 dark:bg-cyan-900/20">
                    <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                      TRAJETO
                    </p>
                  </div>
                  <div className="col-span-3 p-4 space-y-3">
                    <div className="bg-white/20 dark:bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-600 dark:text-slate-400 mb-1">
                        ORIGEM
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {viagem.enderecoEmpresa}
                      </p>
                    </div>
                    <div className="bg-white/20 dark:bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-600 dark:text-slate-400 mb-1">
                        DESTINO
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {viagem.enderecosPassageiros[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé */}
          <footer className="mt-8">
            <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-4 shadow-xl text-center">
              <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-600 dark:text-slate-300">
                SISTEMA DE TRANSPORTE CORPORATIVO
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;