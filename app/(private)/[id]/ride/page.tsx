import { getToken } from "@/src/utils/token/get-token";
import { TravelCard } from "@/src/components/CardViagem";
import { ViagemResumo } from "@/src/model/viagem";
import Breadcrumb from "@/src/components/breadcrumb";

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
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
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}/viagens`,
    {
      next: {
        tags: ["getViagens"],
      },
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const viagens = (await response.json()) as ViagemResumo;

  return (
    <div className="mx-auto max-w-4xl w-full">
      <Breadcrumb items={url} />

      <div className="mb-8">
        <p className="mb-2">MINHAS VIAGENS</p>
        <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full my-4"></div>

        {/* Resumo de viagens */}
        <div className="grid grid-cols-2 gap-4 text-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 mb-4">
          <div className="flex flex-col items-start">
            <span className="text-xs uppercase">Total de Viagens</span>
            <span className="text-base font-semibold">
              {viagens.totalViagens}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase">Valor Total</span>
            <span className="text-base font-semibold">
              R$ {viagens.totalValor.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de viagens */}
      <div className="h-[calc(100vh-180px)] overflow-y-auto pr-2">
        <div className="space-y-4">
          {viagens.viagens.map((viagem, index) => (
            <TravelCard key={index} viagem={viagem} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
