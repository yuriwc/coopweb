import { cookies } from "next/headers";
import ActionButton from "./action/button";

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

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const programadasRequest = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/sem-motorista`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["programacoes"] },
    }
  );

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${params.cooperativa}/motoristas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok || !programadasRequest.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const motoristas = (await response.json()) as IResponse[];
  const programadas = (await programadasRequest.json()) as IProgramadas[];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50/80 to-indigo-100/60 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/30">
      {/* Background aquático com partículas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-sky-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-tl from-sky-400/10 to-indigo-400/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <header className="mb-8">
            <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-6 shadow-xl">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-wide">
                TRANSPORTES
              </h1>
              <p className="text-sm font-medium tracking-[0.15em] uppercase mt-2 text-slate-600 dark:text-slate-300">
                BASF S.A • CAMACARI
              </p>
            </div>
          </header>

          {/* Lista de Transportes */}
          <div className="space-y-6">
            {programadas.map((transporte) => (
              <div
                key={transporte.id}
                className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Cabeçalho do Card */}
                <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                  <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-blue-100/20 dark:bg-blue-900/20">
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
