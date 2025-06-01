import { ActionButton } from "@/src/components/ActionButton";
import TablePassegers from "./table-passegers";
import { Funcionario } from "@/src/model/funcionario";
import { Spacer } from "@heroui/spacer";
import { getToken } from "@/src/utils/token/get-token";
import { Empresa } from "@/src/model/empresa";
import { Icon as IconifyIcon } from "@iconify/react";

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
    }
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
    }
  );

  if (!response.ok || !responseEmpresa.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const funcionarios = (await response.json()) as Funcionario[];
  const empresa = (await responseEmpresa.json()) as Empresa;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* Header Modernizado */}
        <header className="pb-8 mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 rounded-2xl -z-10" />
          <div className="relative p-8 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  {empresa.nome}
                </h1>
                <p className="text-foreground-600 mt-2 text-lg">
                  Painel de controle da empresa
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Sistema online
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-12">
          {/* Seção de Estatísticas Rápidas */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-default-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <IconifyIcon
                      icon="solar:users-group-rounded-linear"
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {funcionarios.length}
                    </p>
                    <p className="text-sm text-foreground-600">Funcionários</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-default-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <IconifyIcon
                      icon="solar:check-circle-linear"
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-sm text-foreground-600">
                      Viagens Ativas
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-default-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <IconifyIcon
                      icon="solar:calendar-linear"
                      className="w-5 h-5 text-orange-600 dark:text-orange-400"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">8</p>
                    <p className="text-sm text-foreground-600">Programadas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-default-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <IconifyIcon
                      icon="solar:speedometer-linear"
                      className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">98%</p>
                    <p className="text-sm text-foreground-600">Eficiência</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Funcionários */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground-800 mb-2">
                Gestão de Funcionários
              </h2>
              <p className="text-foreground-600">
                Gerencie os funcionários e suas informações
              </p>
            </div>

            <TablePassegers
              funcionarios={funcionarios}
              empresa={params.id}
              token={await getToken()}
            />
          </section>

          <Spacer y={8} />

          {/* Seção de Ações Principais */}
          <section>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground-800 mb-2">
                O que deseja fazer?
              </h2>
              <p className="text-foreground-600">
                Acesse rapidamente as principais funcionalidades do sistema
              </p>
            </div>

            {/* Grid de ActionButtons Modernizado */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="min-h-[200px]">
                <ActionButton
                  title="Viagens Programadas"
                  description="Gerencie e acompanhe as viagens programadas da sua empresa"
                  href="#"
                  icon="solar:calendar-linear"
                  variant="primary"
                />
              </div>
              <div className="min-h-[200px]">
                <ActionButton
                  title="Relatórios"
                  description="Acesse relatórios detalhados e análises de performance das viagens"
                  href={params.id + "/ride"}
                  icon="solar:chart-square-linear"
                  variant="secondary"
                />
              </div>
              <div className="min-h-[200px] md:col-span-2 xl:col-span-1">
                <ActionButton
                  title="Monitoramento em Tempo Real"
                  description="Acompanhe a localização e status das viagens em andamento"
                  href={params.id + "/ride/realtime"}
                  icon="solar:gps-linear"
                  variant="tertiary"
                />
              </div>
            </div>
          </section>

          {/* Spacer para o rodapé */}
          <div className="pb-16" />
        </main>
      </div>
    </div>
  );
};

export default App;
