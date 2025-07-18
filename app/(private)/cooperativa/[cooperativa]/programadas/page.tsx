import { cookies } from "next/headers";
import ProgramadasClient from "./programadas-client";

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
            </div>
          </header>

          {/* Tabs customizadas */}
          <ProgramadasClient 
            programadasSemMotorista={programadasSemMotorista}
            programadasComMotorista={programadasComMotorista}
            motoristas={motoristas}
            token={token}
          />

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
