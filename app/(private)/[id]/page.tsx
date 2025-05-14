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
    <div className="min-h-screen p-4 sm:p-8">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {empresa.nome}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mb-12">
        <div className="mb-8">
          <p className="text-neutral-500 dark:text-neutral-400 mb-2">
            O QUE DESEJA FAZER?
          </p>
          <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full my-4"></div>
        </div>
        <TablePassegers
          funcionarios={funcionarios}
          empresa={params.id}
          token={await getToken()}
        />
        <Spacer y={16} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ActionButton
            title="Relatório de Viagens"
            description="Veja suas viagens por fatura"
            href={`${params.id}/ride`}
            variant="secondary"
          />

          <ActionButton
            title="Acompanhar Viagens"
            description="Monitoramento em tempo real"
            href="/acompanhamento"
            variant="secondary"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-4 sm:px-8 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-neutral-500 dark:text-neutral-400">
          <a
            className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>DESENVOLVIDO POR YURI CAVALCANTE</span>
          </a>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <a
            className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>EXAMPLES</span>
          </a>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <a
            className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>SUPORTE →</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
