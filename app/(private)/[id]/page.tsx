import Link from "next/link";
import TablePassegers from "./table-passegers";
import { Funcionario } from "@/src/model/funcionario";
import { getToken } from "@/src/utils/token/get-token";
import { fetchComLog } from "@/src/utils/log-fetch";
import { Empresa } from "@/src/model/empresa";
import { Card } from "@heroui/react";
import { Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

/* ------------------------------------------------------------------ */
/* Page */
/* ------------------------------------------------------------------ */
const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const token = await getToken();

  const [responseEmpresa, response] = await Promise.all([
    fetchComLog(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}`, {
      next: { revalidate: 3600, tags: ["getEmpresa"] },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    fetchComLog(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}/funcionarios`,
      {
        next: { tags: ["getFuncionarios"] },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ),
  ]);

  if (!response.ok || !responseEmpresa.ok) return null;

  const funcionarios = (await response.json()) as Funcionario[];
  const empresa = (await responseEmpresa.json()) as Empresa;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
        {/* Cabeçalho — texto puro, sem card, como em dashboards modernos */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {empresa.nome}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {funcionarios.length} colaboradores · Painel de controle da empresa
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Link
                  href={`/${params.id}/ride/realtime`}
                  aria-label="Monitoramento em tempo real"
                  className="inline-flex items-center justify-center rounded-md bg-default dark:bg-default h-10 w-10 text-gray-700 dark:text-gray-300 hover:opacity-80 transition-opacity"
                >
                  <Icon icon="solar:gps-linear" className="w-4 h-4" />
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Monitoramento em tempo real</p>
              </Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Link
                  href={`/${params.id}/configuracoes`}
                  aria-label="Configurações da empresa"
                  className="inline-flex items-center justify-center rounded-md bg-default dark:bg-default h-10 w-10 text-gray-700 dark:text-gray-300 hover:opacity-80 transition-opacity"
                >
                  <Icon icon="solar:settings-linear" className="w-4 h-4" />
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Configurações da empresa</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </header>

        {/* Superfície única: colaboradores + ações de viagem */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <Card.Header className="flex-col items-start px-6 sm:px-8 pt-6 sm:pt-8 pb-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Colaboradores
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Peça uma viagem ou gerencie o quadro de funcionários da empresa
            </p>
          </Card.Header>
          <Card.Content className="p-6 sm:p-8">
            <TablePassegers
              funcionarios={funcionarios}
              empresa={params.id}
              token={token}
            />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default App;
