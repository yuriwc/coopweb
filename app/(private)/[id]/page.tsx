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
    <div className="min-h-screen relative overflow-hidden bg-blue-50/50 dark:bg-gray-900">
      {/* Liquid Glass Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100/40 via-cyan-50/30 to-sky-100/40 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40" />
      <div className="fixed inset-0 backdrop-blur-[2px]" />

      {/* Dynamic Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-32 right-20 w-24 h-24 bg-cyan-200/20 dark:bg-purple-400/10 rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-sky-200/20 dark:bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-300/15 dark:bg-blue-500/8 rounded-full blur-2xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-cyan-300/15 dark:bg-cyan-500/8 rounded-full blur-2xl animate-pulse delay-1200" />
      </div>

      <div className="relative z-10 container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* Liquid Glass Header */}
        <header className="pb-2 mb-4 relative group">
          {/* Glass Effect Background */}
          <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-500/15 dark:shadow-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/[0.08] via-cyan-400/[0.08] to-sky-400/[0.08] dark:from-blue-500/[0.03] dark:via-purple-500/[0.03] dark:to-emerald-500/[0.03] rounded-xl" />

          {/* Crystalline Border Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-300/30 dark:via-white/10 to-transparent p-[1px]">
            <div className="h-full w-full rounded-xl bg-transparent" />
          </div>

          {/* Content */}
          <div className="relative p-4 rounded-xl transition-all duration-700 group-hover:backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="relative">
                {/* Glass Text Effect */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold relative">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent blur-sm opacity-50" />
                  <span className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg">
                    {empresa.nome}
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-0.5 text-sm backdrop-blur-sm font-medium drop-shadow-lg">
                  Painel de controle da empresa
                </p>
              </div>

              {/* Status Indicator with Liquid Glass Effect */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                    Sistema online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {/* Liquid Glass Statistics Cards */}
          <section className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Card 1 - Funcionários */}
              <div className="group relative">
                {/* Glass Background */}
                <div className="absolute inset-0 bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl rounded-xl border border-blue-200/30 dark:border-white/10 shadow-xl shadow-blue-400/15 dark:shadow-blue-500/5" />
                <div className="absolute inset-0 bg-blue-400/[0.06] dark:bg-blue-500/[0.02] rounded-xl" />

                {/* Crystalline Highlight */}
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-300/50 dark:via-white/30 to-transparent" />

                <div className="relative p-4 rounded-xl transition-all duration-500 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
                  <div className="flex items-center gap-3">
                    {/* Icon with Glass Effect */}
                    <div className="relative p-2 rounded-lg">
                      <div className="absolute inset-0 bg-blue-100/20 dark:bg-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-200/30 dark:border-blue-800/30" />
                      <IconifyIcon
                        icon="solar:users-group-rounded-linear"
                        className="relative w-5 h-5 text-blue-600 dark:text-blue-400 drop-shadow-sm"
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
                        {funcionarios.length}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                        Colaboradores
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 - Viagens Ativas */}
              <div className="group relative">
                <div className="absolute inset-0 bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl rounded-xl border border-cyan-200/30 dark:border-white/10 shadow-xl shadow-cyan-400/15 dark:shadow-emerald-500/5" />
                <div className="absolute inset-0 bg-cyan-400/[0.06] dark:bg-emerald-500/[0.02] rounded-xl" />
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/50 dark:via-white/30 to-transparent" />

                <div className="relative p-4 rounded-xl transition-all duration-500 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="relative p-2 rounded-lg">
                      <div className="absolute inset-0 bg-emerald-100/20 dark:bg-emerald-900/20 backdrop-blur-sm rounded-lg border border-emerald-200/30 dark:border-emerald-800/30" />
                      <IconifyIcon
                        icon="solar:check-circle-linear"
                        className="relative w-5 h-5 text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
                        12
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                        Viagens Ativas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Programadas */}
              <div className="group relative">
                <div className="absolute inset-0 bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl rounded-xl border border-sky-200/30 dark:border-white/10 shadow-xl shadow-sky-400/15 dark:shadow-orange-500/5" />
                <div className="absolute inset-0 bg-sky-400/[0.06] dark:bg-orange-500/[0.02] rounded-xl" />
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-sky-300/50 dark:via-white/30 to-transparent" />

                <div className="relative p-4 rounded-xl transition-all duration-500 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10">
                  <div className="flex items-center gap-3">
                    <div className="relative p-2 rounded-lg">
                      <div className="absolute inset-0 bg-orange-100/20 dark:bg-orange-900/20 backdrop-blur-sm rounded-lg border border-orange-200/30 dark:border-orange-800/30" />
                      <IconifyIcon
                        icon="solar:calendar-linear"
                        className="relative w-5 h-5 text-orange-600 dark:text-orange-400 drop-shadow-sm"
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
                        8
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                        Programadas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 - Eficiência */}
              <div className="group relative">
                <div className="absolute inset-0 bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl rounded-xl border border-indigo-200/30 dark:border-white/10 shadow-xl shadow-indigo-400/15 dark:shadow-purple-500/5" />
                <div className="absolute inset-0 bg-indigo-400/[0.06] dark:bg-purple-500/[0.02] rounded-xl" />
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-300/50 dark:via-white/30 to-transparent" />

                <div className="relative p-4 rounded-xl transition-all duration-500 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
                  <div className="flex items-center gap-3">
                    <div className="relative p-2 rounded-lg">
                      <div className="absolute inset-0 bg-purple-100/20 dark:bg-purple-900/20 backdrop-blur-sm rounded-lg border border-purple-200/30 dark:border-purple-800/30" />
                      <IconifyIcon
                        icon="solar:speedometer-linear"
                        className="relative w-5 h-5 text-purple-600 dark:text-purple-400 drop-shadow-sm"
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg">
                        98%
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                        Eficiência
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Liquid Glass Funcionários Section */}
          <section className="relative">
            {/* Section Header with Glass Effect */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
              <div className="relative p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 drop-shadow-lg">
                  Solicitar Viagem
                </h2>
                <p className="text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                  Peça uma viagem para seus funcionários de forma rápida e fácil
                </p>
              </div>
            </div>

            {/* Table with Liquid Glass Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-400/20 dark:shadow-black/20" />
              <div className="relative p-6 rounded-3xl">
                <TablePassegers
                  funcionarios={funcionarios}
                  empresa={params.id}
                  token={await getToken()}
                />
              </div>
            </div>
          </section>

          <Spacer y={12} />

          {/* Liquid Glass Action Section */}
          <section className="relative">
            {/* Section Header */}
            <div className="mb-10 relative">
              <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
              <div className="relative p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 drop-shadow-lg">
                  O que deseja fazer?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                  Acesse rapidamente as principais funcionalidades do sistema
                </p>
              </div>
            </div>

            {/* Liquid Glass Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {/* Card 1 - Viagens Programadas */}
              <div className="group relative min-h-[240px]">
                {/* Multi-layer Glass Effect */}
                <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-400/20 dark:shadow-violet-500/5" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.10] via-indigo-400/[0.08] to-violet-400/[0.10] dark:from-violet-400/[0.08] dark:via-purple-400/[0.06] dark:to-indigo-400/[0.08] rounded-3xl" />

                {/* Crystalline Highlights */}
                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-300/60 dark:via-white/40 to-transparent" />
                <div className="absolute bottom-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-blue-300/40 dark:via-white/20 to-transparent" />

                <div className="relative h-full p-8 rounded-3xl transition-all duration-700 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/15 cursor-pointer">
                  <ActionButton
                    title="Viagens Programadas"
                    description="Gerencie e acompanhe as viagens programadas da sua empresa"
                    href="#"
                    icon="solar:calendar-linear"
                    variant="primary"
                  />
                </div>
              </div>

              {/* Card 2 - Relatórios */}
              <div className="group relative min-h-[240px]">
                <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-cyan-200/40 dark:border-white/10 shadow-2xl shadow-cyan-400/20 dark:shadow-blue-500/5" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.10] via-blue-400/[0.08] to-sky-400/[0.10] dark:from-blue-400/[0.08] dark:via-cyan-400/[0.06] dark:to-sky-400/[0.08] rounded-3xl" />

                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/60 dark:via-white/40 to-transparent" />
                <div className="absolute bottom-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/40 dark:via-white/20 to-transparent" />

                <div className="relative h-full p-8 rounded-3xl transition-all duration-700 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/15 cursor-pointer">
                  <ActionButton
                    title="Relatórios"
                    description="Acesse relatórios detalhados e análises de performance das viagens"
                    href={params.id + "/ride"}
                    icon="solar:chart-square-linear"
                    variant="secondary"
                  />
                </div>
              </div>

              {/* Card 3 - Monitoramento em Tempo Real */}
              <div className="group relative min-h-[240px] md:col-span-2 xl:col-span-1">
                <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-teal-200/40 dark:border-white/10 shadow-2xl shadow-teal-400/20 dark:shadow-emerald-500/5" />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/[0.10] via-cyan-400/[0.08] to-blue-400/[0.10] dark:from-emerald-400/[0.08] dark:via-teal-400/[0.06] dark:to-green-400/[0.08] rounded-3xl" />

                <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-teal-300/60 dark:via-white/40 to-transparent" />
                <div className="absolute bottom-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-teal-300/40 dark:via-white/20 to-transparent" />

                <div className="relative h-full p-8 rounded-3xl transition-all duration-700 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/15 cursor-pointer">
                  <ActionButton
                    title="Monitoramento em Tempo Real"
                    description="Acompanhe a localização e status das viagens em andamento"
                    href={params.id + "/ride/realtime"}
                    icon="solar:gps-linear"
                    variant="tertiary"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Spacer with Glass Effect */}
          <div className="pb-20 relative">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-100/[0.08] to-transparent dark:from-white/[0.01] backdrop-blur-sm rounded-t-3xl" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
