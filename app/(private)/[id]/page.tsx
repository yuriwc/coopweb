import { ActionButton } from "@/src/components/ActionButton";
import TablePassegers from "./table-passegers";
import { Funcionario } from "@/src/model/funcionario";
import { Spacer } from "@heroui/spacer";
import { getToken } from "@/src/utils/token/get-token";
import { Empresa } from "@/src/model/empresa";

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;

  const responseEmpresa = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}`,
    {
      next: {
        revalidate: 3600,
        tags: ["getEmpresa"],
      },
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
    },
  );
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}/funcionarios`,
    {
      next: {
        tags: ["getFuncionarios"],
      },
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok || !responseEmpresa.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const funcionarios = (await response.json()) as Funcionario[];
  const empresa = (await responseEmpresa.json()) as Empresa;

  return (
    <div className="h-screen flex flex-col p-4 sm:p-8 overflow-y-auto">
      {/* Header */}
      <header className="pb-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-light tracking-[0.18em] uppercase">
            {empresa.nome}
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

        <TablePassegers
          funcionarios={funcionarios}
          empresa={params.id}
          token={await getToken()}
        />

        <Spacer y={16} />

        {/* Container único dos ActionButtons - Grid Responsivo */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch pb-16">
          <div className="w-full h-[180px]">
            <ActionButton
              title="Viagens Programadas"
              description="Gerencie as viagens progradas disponíveis"
              href="#"
            />
          </div>
          <div className="w-full h-[180px]">
            <ActionButton
              title="Relatórios"
              description="Acesse relatórios detalhados de suas viagens"
              href={params.id + "/ride"}
              variant="secondary"
            />
          </div>
          <div className="w-full h-[180px] mb-10">
            <ActionButton
              title="Monitoramento"
              description="Acompanhe as viagens dos seus colaboradores em tempo real"
              href={params.id + "/ride/realtime"}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
