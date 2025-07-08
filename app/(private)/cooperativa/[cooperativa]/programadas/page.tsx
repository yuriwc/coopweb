import { cookies } from "next/headers";
import ActionButton from "./action/button";
import EncerrarButton from "./action/encerrar-button";

interface IResponse {
  nome: string;
  id: string;
}

interface IProgramadas {
  id: string;
  nomeEmpresa: string;
  enderecoEmpresa: string;
  nomesPassageiros: string[];
  enderecosPassageiros: string[];
  horaSaida: string;
  horaRetorno: string;
}

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

  // Buscar programações primeiro
  const [programadasSemMotoristaRequest, programadasComMotoristaRequest] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/sem-motorista`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { 
        tags: ["programacoes"],
        revalidate: 30 // Cache por 30 segundos para melhorar performance
      },
    }),
    fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/com-motorista`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { 
        tags: ["programacoes-com-motorista"],
        revalidate: 30 // Cache por 30 segundos
      },
    })
  ]);

  if (!programadasSemMotoristaRequest.ok || !programadasComMotoristaRequest.ok) {
    console.error("Erro na requisição das programações");
    return null;
  }

  const programadasSemMotorista = (await programadasSemMotoristaRequest.json()) as IProgramadas[];
  const programadasComMotorista = (await programadasComMotoristaRequest.json()) as IProgramadaComMotorista[];

  // Buscar motoristas APENAS se há programações sem motorista
  let motoristas: IResponse[] = [];
  if (programadasSemMotorista.length > 0) {
    try {
      const motoristasRequest = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${params.cooperativa}/motoristas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          next: { 
            tags: ["motoristas"],
            revalidate: 300 // Cache por 5 minutos (dados menos voláteis)
          },
        }
      );

      if (motoristasRequest.ok) {
        motoristas = (await motoristasRequest.json()) as IResponse[];
      } else {
        console.warn("Erro ao buscar motoristas:", motoristasRequest.status);
      }
    } catch (error) {
      console.warn("Erro ao buscar motoristas:", error);
    }
  }

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
                VIAGENS PROGRAMADAS
              </h1>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100/30 dark:bg-orange-900/30 rounded-full">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    {programadasSemMotorista.length} sem motorista
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100/30 dark:bg-green-900/30 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    {programadasComMotorista.length} com motorista
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Viagens SEM Motorista */}
          {programadasSemMotorista.length > 0 && (
            <section className="mb-12">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                  📋 Aguardando Atribuição de Motorista
                </h2>
                <div className="h-1 w-16 bg-orange-500 rounded-full"></div>
              </div>
              
              <div className="space-y-6">
                {programadasSemMotorista.map((transporte) => (
                  <div
                    key={transporte.id}
                    className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-orange-200/50 dark:border-orange-400/20 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-orange-100/20 dark:bg-orange-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          VIAGEM
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          #{transporte.id.slice(0, 8).toUpperCase()}
                        </p>
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
                          {transporte.horaSaida} → {transporte.horaRetorno}
                        </p>
                      </div>
                    </div>

                    {/* Passageiro */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-indigo-100/20 dark:bg-indigo-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          PASSAGEIRO
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        {transporte.nomesPassageiros.map((nome, index) => (
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
                            {transporte.enderecoEmpresa}
                          </p>
                        </div>
                        <div className="bg-white/20 dark:bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                          <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-600 dark:text-slate-400 mb-1">
                            DESTINO
                          </p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {transporte.enderecosPassageiros[0]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    <ActionButton
                      token={token}
                      motoristas={motoristas}
                      idProgramacao={transporte.id}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Viagens COM Motorista */}
          {programadasComMotorista.length > 0 && (
            <section className="mb-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                  🚗 Viagens Atribuídas
                </h2>
                <div className="h-1 w-16 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="space-y-6">
                {programadasComMotorista.map((viagem) => (
                  <div
                    key={viagem.id}
                    className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-green-200/50 dark:border-green-400/20 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-green-100/20 dark:bg-green-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          VIAGEM
                        </p>
                      </div>
                      <div className="col-span-3 p-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          #{viagem.id.slice(0, 8).toUpperCase()}
                        </p>
                        {viagem.tipoViagem && (
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoViagemColor(viagem.tipoViagem)}`}>
                            {getTipoViagemLabel(viagem.tipoViagem)}
                          </div>
                        )}
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

                    {/* Botão de Encerrar */}
                    <EncerrarButton
                      idProgramacao={viagem.id}
                      token={token}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

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
