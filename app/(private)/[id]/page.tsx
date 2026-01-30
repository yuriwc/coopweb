import dynamic from "next/dynamic";
import TablePassegers from "./table-passegers";
import { Funcionario } from "@/src/model/funcionario";
import { Spacer } from "@heroui/spacer";
import { getToken } from "@/src/utils/token/get-token";
import { Empresa } from "@/src/model/empresa";
import { Icon as IconifyIcon } from "@iconify/react";
import styles from "./styles.module.css";

const ActionButton = dynamic(
  () =>
    import("@/src/components/ActionButton").then((mod) => ({
      default: mod.ActionButton,
    })),
  {
    loading: () => (
      <div className="min-h-[240px] rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse" />
    ),
  }
);

/* ------------------------------------------------------------------ */
/* Base glass section (layout uniforme) */
/* ------------------------------------------------------------------ */
type GlassSectionProps = {
  className?: string;
  children: React.ReactNode;
};

const GlassSection = ({ className = "", children }: GlassSectionProps) => {
  return (
    <section className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/85 dark:bg-gray-800/80 shadow-lg backdrop-blur-md" />
      <div className="relative rounded-3xl p-8 sm:p-10">
        {children}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Stat card */
/* ------------------------------------------------------------------ */
type StatCardProps = {
  icon: string;
  title: string;
  value: React.ReactNode;
  tone?: "blue" | "emerald" | "orange" | "purple";
};

const toneMap = {
  blue: "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300",
  emerald:
    "bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300",
  orange:
    "bg-orange-50 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-300",
  purple:
    "bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-300",
} as const;

const StatCard = ({ icon, title, value, tone = "blue" }: StatCardProps) => (
  <div className="relative rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/75 dark:bg-gray-800/70 shadow-md backdrop-blur-md p-6 sm:p-7 transition-transform hover:scale-[1.015]">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl border ${toneMap[tone]}`}>
        <IconifyIcon icon={icon} className="w-5 h-5" />
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
          {value}
        </p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
          {title}
        </p>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Page */
/* ------------------------------------------------------------------ */
const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const token = await getToken();

  const [responseEmpresa, response] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}`, {
      next: { revalidate: 3600, tags: ["getEmpresa"] },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    fetch(
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
    <div className="min-h-screen relative overflow-hidden bg-[#F5F5F5] dark:bg-[#060607]">
      <div className={styles.liquidGlassBackdrop} />
      <div className={styles.backgroundParticles} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
        <main className="space-y-8 sm:space-y-10">
          {/* Header */}
          <GlassSection>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {empresa.nome}
                </h1>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-2">
                  Painel de controle da empresa
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/30">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Sistema online
                  </span>
                </div>
              </div>
            </div>
          </GlassSection>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon="solar:users-group-rounded-linear"
              title="Colaboradores"
              value={funcionarios.length}
              tone="blue"
            />
            <StatCard
              icon="solar:check-circle-linear"
              title="Viagens Ativas"
              value="-"
              tone="emerald"
            />
            <StatCard
              icon="solar:calendar-linear"
              title="Programadas"
              value="-"
              tone="orange"
            />
            <StatCard
              icon="solar:speedometer-linear"
              title="Eficiência"
              value="-"
              tone="purple"
            />
          </div>

          {/* Solicitar Viagem */}
          <GlassSection className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Solicitar Viagem
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Peça uma viagem para seus funcionários de forma rápida e fácil
              </p>
            </div>

            {/* tabela SEM borda */}
            <div className="bg-white/60 dark:bg-gray-900/20 rounded-2xl p-4 sm:p-6">
              <TablePassegers
                funcionarios={funcionarios}
                empresa={params.id}
                token={token}
              />
            </div>
          </GlassSection>

          <Spacer y={12} />

          {/* Ações */}
          <GlassSection className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                O que deseja fazer?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Acesse rapidamente as principais funcionalidades do sistema
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <ActionButton
                title="Minhas Viagens"
                description="Visualize e gerencie suas ultimas viagens"
                href={params.id + "/ride"}
                icon="solar:chart-square-linear"
                variant="secondary"
              />
              <ActionButton
                title="Faturas e Vouchers"
                description="Faturas e vouchers da sua empresa"
                href={params.id + "/vouchers/dashboard"}
                icon="solar:ticket-linear"
                variant="primary"
              />
              <ActionButton
                title="Monitoramento em Tempo Real"
                description="Acompanhe a localização das viagens"
                href={params.id + "/ride/realtime"}
                icon="solar:gps-linear"
                variant="tertiary"
              />
            </div>
          </GlassSection>
        </main>
      </div>
    </div>
  );
};

export default App;
