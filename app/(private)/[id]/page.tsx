import dynamic from "next/dynamic";
import TablePassegers from "./table-passegers";
import { Funcionario } from "@/src/model/funcionario";
import { Spacer } from "@heroui/spacer";
import { getToken } from "@/src/utils/token/get-token";
import { Empresa } from "@/src/model/empresa";
import { Icon as IconifyIcon } from "@iconify/react";
import styles from './styles.module.css';

const ActionButton = dynamic(() => import("@/src/components/ActionButton").then(mod => ({ default: mod.ActionButton })), {
  loading: () => <div className="min-h-[240px] bg-white/18 dark:bg-white/5 backdrop-blur-xl rounded-3xl border animate-pulse" />,
});

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;

  const token = await getToken();

  const [responseEmpresa, response] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}`, {
      next: {
        revalidate: 3600,
        tags: ["getEmpresa"],
      },
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}/funcionarios`,
      {
        next: {
          tags: ["getFuncionarios"],
        },
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ),
  ]);

  if (!response.ok || !responseEmpresa.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const funcionarios = (await response.json()) as Funcionario[];
  const empresa = (await responseEmpresa.json()) as Empresa;

  return (
    <div className="min-h-screen relative overflow-hidden bg-blue-50/50 dark:bg-gray-900">
      {/* Liquid Glass Background */}
      <div className={`${styles.liquidGlassBackground} ${styles.darkLiquidGlassBackground}`} />
      <div className={styles.liquidGlassBackdrop} />

      {/* Dynamic Background Particles */}
      <div className={styles.backgroundParticles}>
        <div className={`${styles.particle1} dark:${styles.darkParticle1}`} />
        <div className={`${styles.particle2} dark:${styles.darkParticle2}`} />
        <div className={`${styles.particle3} dark:${styles.darkParticle3}`} />
        <div className={`${styles.particle4} dark:${styles.darkParticle4}`} />
        <div className={`${styles.particle5} dark:${styles.darkParticle5}`} />
      </div>

      <div className="relative z-10 container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* Liquid Glass Header */}
        <header className="pb-2 mb-4 relative group">
          {/* Glass Effect Background */}
          <div className={`${styles.glassCardHeader} dark:${styles.glassCardHeaderDark}`} />
          <div className={`${styles.crystallineBorder} dark:${styles.crystallineBorderDark}`} />

          {/* Content */}
          <div className={`${styles.glassHover} dark:${styles.glassHoverDark} relative p-4 rounded-xl`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="relative">
                {/* Glass Text Effect */}
                <h1 className={`${styles.gradientText} text-xl sm:text-2xl lg:text-3xl font-bold relative`}>
                  {empresa.nome}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-0.5 text-sm backdrop-blur-sm font-medium drop-shadow-lg">
                  Painel de controle da empresa
                </p>
              </div>

              {/* Status Indicator with Liquid Glass Effect */}
              <div className="flex items-center gap-2 text-xs">
                <div className={`${styles.statusIndicator} dark:${styles.statusIndicatorDark}`}>
                  <div className={styles.statusDot} />
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
                <div className="absolute inset-0 bg-white/18 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-blue-200/30 dark:border-white/10 shadow-xl shadow-blue-400/15 dark:shadow-blue-500/5" />
                <div className="absolute inset-0 bg-blue-400/6 dark:bg-blue-500/2 rounded-xl" />

                {/* Crystalline Highlight */}
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-blue-300/50 dark:via-white/30 to-transparent" />

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
                <div className="absolute inset-0 bg-white/18 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-cyan-200/30 dark:border-white/10 shadow-xl shadow-cyan-400/15 dark:shadow-emerald-500/5" />
                <div className="absolute inset-0 bg-cyan-400/6 dark:bg-emerald-500/2 rounded-xl" />
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-cyan-300/50 dark:via-white/30 to-transparent" />

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
                        -
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
                <div className="absolute inset-0 bg-white/18 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-sky-200/30 dark:border-white/10 shadow-xl shadow-sky-400/15 dark:shadow-orange-500/5" />
                <div className="absolute inset-0 bg-sky-400/6 dark:bg-orange-500/2 rounded-xl" />
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-sky-300/50 dark:via-white/30 to-transparent" />

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
                        -
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
                <div className="absolute inset-0 bg-white/18 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-indigo-200/30 dark:border-white/10 shadow-xl shadow-indigo-400/15 dark:shadow-purple-500/5" />
                <div className="absolute inset-0 bg-indigo-400/6 dark:bg-purple-500/2 rounded-xl" />
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-indigo-300/50 dark:via-white/30 to-transparent" />

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
                        -
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
              <div className="absolute inset-0 bg-white/15 dark:bg-white/2 backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
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
              <div className="absolute inset-0 bg-white/20 dark:bg-white/3 backdrop-blur-xl rounded-3xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-400/20 dark:shadow-black/20" />
              <div className="relative p-6 rounded-3xl">
                <TablePassegers
                  funcionarios={funcionarios}
                  empresa={params.id}
                  token={token}
                />
              </div>
            </div>
          </section>

          <Spacer y={12} />

          {/* Liquid Glass Action Section */}
          <section className="relative">
            {/* Section Header */}
            <div className="mb-10 relative">
              <div className="absolute inset-0 bg-white/15 dark:bg-white/2 backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
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
              {/* Card 1 - Relatórios */}
              <div className="group relative min-h-[240px]">
                <div className="absolute inset-0 bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-cyan-200/40 dark:border-white/10 shadow-2xl shadow-cyan-400/20 dark:shadow-blue-500/5" />
                <div className="absolute inset-0 bg-linear-to-br from-cyan-400/10 via-blue-400/8 to-sky-400/10 dark:from-blue-400/8 dark:via-cyan-400/6 dark:to-sky-400/8 rounded-3xl" />

                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-cyan-300/60 dark:via-white/40 to-transparent" />
                <div className="absolute bottom-0 left-1/3 right-1/3 h-px bg-linear-to-r from-transparent via-cyan-300/40 dark:via-white/20 to-transparent" />

                <div className="relative h-full p-8 rounded-3xl transition-all duration-700 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/15 cursor-pointer">
                  <ActionButton
                    title="Minhas Viagens"
                    description="Visualize e gerencie suas ultimas viagens"
                    href={params.id + "/ride"}
                    icon="solar:chart-square-linear"
                    variant="secondary"
                  />
                </div>
              </div>

              {/* Card 2 - Vouchers */}
              <div className="group relative min-h-[240px]">
                <div className="absolute inset-0 bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-purple-200/40 dark:border-white/10 shadow-2xl shadow-purple-400/20 dark:shadow-purple-500/5" />
                <div className="absolute inset-0 bg-linear-to-br from-purple-400/10 via-indigo-400/8 to-pink-400/10 dark:from-purple-400/8 dark:via-indigo-400/6 dark:to-pink-400/8 rounded-3xl" />

                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-purple-300/60 dark:via-white/40 to-transparent" />
                <div className="absolute bottom-0 left-1/3 right-1/3 h-px bg-linear-to-r from-transparent via-purple-300/40 dark:via-white/20 to-transparent" />

                <div className="relative h-full p-8 rounded-3xl transition-all duration-700 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/15 cursor-pointer">
                  <ActionButton
                    title="Faturas e Vouchers"
                    description="Faturas e vouchers da sua empresa. Dashboard de gastos por área"
                    href={params.id + "/vouchers/dashboard"}
                    icon="solar:ticket-linear"
                    variant="primary"
                  />
                </div>
              </div>

              {/* Card 4 - Monitoramento em Tempo Real */}
              <div className="group relative min-h-[240px]">
                <div className="absolute inset-0 bg-white/20 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-teal-200/40 dark:border-white/10 shadow-2xl shadow-teal-400/20 dark:shadow-emerald-500/5" />
                <div className="absolute inset-0 bg-linear-to-br from-teal-400/10 via-cyan-400/8 to-blue-400/10 dark:from-emerald-400/8 dark:via-teal-400/6 dark:to-green-400/8 rounded-3xl" />

                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-teal-300/60 dark:via-white/40 to-transparent" />
                <div className="absolute bottom-0 left-1/3 right-1/3 h-px bg-linear-to-r from-transparent via-teal-300/40 dark:via-white/20 to-transparent" />

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
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-blue-100/8 to-transparent dark:from-white/1 backdrop-blur-sm rounded-t-3xl" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
