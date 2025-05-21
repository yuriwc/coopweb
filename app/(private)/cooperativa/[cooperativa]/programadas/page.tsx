import Link from "next/link";
import Motorista from "./select/motorista";
import { cookies } from "next/headers";
import { Spacer } from "@heroui/spacer";

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
    },
  );

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${params.cooperativa}/motoristas`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok || !programadasRequest.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const motoristas = (await response.json()) as IResponse[];
  const programadas = (await programadasRequest.json()) as IProgramadas[];

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <header className="border-b-[0.5px] border-black pb-4 mb-6">
          <h1 className="text-2xl font-light tracking-[0.5em] uppercase">
            TRANSPORTES
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase mt-1">
            BASF S.A • CAMACARI
          </p>
        </header>

        {/* Lista de Transportes */}
        <div className="space-y-6">
          {programadas.map((transporte) => (
            <div
              key={transporte.id}
              className="border-[0.5px] border-black bg-white rounded-lg shadow-sm"
            >
              {/* Cabeçalho do Card */}
              <div className="grid grid-cols-5 border-b-[0.5px] border-black">
                <div className="col-span-2 p-3 border-r-[0.5px] border-black">
                  <p className="text-[0.7rem] tracking-[0.5em] uppercase">
                    VIAGEM
                  </p>
                </div>
                <div className="col-span-3 p-3">
                  <p className="text-sm font-light">
                    #{transporte.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-5 border-b-[0.5px] border-black">
                <div className="col-span-2 p-3 border-r-[0.5px] border-black">
                  <p className="text-[0.7rem] tracking-[0.5em] uppercase">
                    HORÁRIO
                  </p>
                </div>
                <div className="col-span-3 p-3">
                  <p className="text-sm font-light">
                    {transporte.horaSaida} → {transporte.horaRetorno}
                  </p>
                </div>
              </div>

              {/* Passageiro */}
              <div className="grid grid-cols-5 border-b-[0.5px] border-black">
                <div className="col-span-2 p-3 border-r-[0.5px] border-black">
                  <p className="text-[0.7rem] tracking-[0.5em] uppercase">
                    PASSAGEIRO
                  </p>
                </div>
                <div className="col-span-3 p-3">
                  {transporte.nomesPassageiros.map((nome, index) => (
                    <p key={index} className="text-sm font-light">
                      {nome.toUpperCase()}
                    </p>
                  ))}
                </div>
              </div>

              {/* Endereços */}
              <div className="grid grid-cols-5">
                <div className="col-span-2 p-3 border-r-[0.5px] border-black">
                  <p className="text-[0.7rem] tracking-[0.5em] uppercase">
                    TRAJETO
                  </p>
                </div>
                <div className="col-span-3 p-3 space-y-2">
                  <div>
                    <p className="text-[0.7rem] tracking-[0.3em] uppercase">
                      ORIGEM
                    </p>
                    <p className="text-sm font-light">
                      {transporte.enderecoEmpresa}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] tracking-[0.3em] uppercase">
                      DESTINO
                    </p>
                    <p className="text-sm font-light">
                      {transporte.enderecosPassageiros[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="flex flex-row border-t-[0.5px] border-black p-3">
                <Motorista motoristas={motoristas} />
                <Spacer />
                <Link
                  href={`/transportes/${transporte.id}`}
                  className="
                  flex justify-center
                  w-full items-center
                  border-[0.5px] border-black
                  p-2 text-xs
                  font-light tracking-[0.5em] uppercase
                  hover:bg-black hover:text-white transition-colors
                "
                >
                  Alocar Motorista
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <footer className="mt-6 border-t-[0.5px] border-black pt-4 text-center">
          <p className="text-xs tracking-[0.5em] uppercase">
            SISTEMA DE TRANSPORTE CORPORATIVO
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
