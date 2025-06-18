import Breadcrumb from "@/src/components/breadcrumb";
import FormPassegers from "./form";

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const url = [
    {
      name: "Início",
      url: `/${params.id}`,
    },
    {
      name: "Novo Colaborador",
      url: `/passegers/${params.id}`,
    },
  ];

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

      <div className="relative z-10 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Liquid Glass Breadcrumb Container */}
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
          <div className="relative p-4 rounded-2xl">
            <Breadcrumb items={url} />
          </div>
        </div>

        {/* Liquid Glass Header Section */}
        <section className="mb-8 relative group">
          {/* Glass Effect Background */}
          <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-500/15 dark:shadow-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/[0.08] via-cyan-400/[0.08] to-sky-400/[0.08] dark:from-blue-500/[0.03] dark:via-purple-500/[0.03] dark:to-emerald-500/[0.03] rounded-2xl" />

          {/* Crystalline Border Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-blue-300/30 dark:via-white/10 to-transparent p-[1px]">
            <div className="h-full w-full rounded-2xl bg-transparent" />
          </div>

          <div className="relative p-6 rounded-2xl transition-all duration-700 group-hover:backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
                  Novo Colaborador
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  Cadastre um novo passageiro no sistema
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Liquid Glass Form Container */}
        <section className="relative group mb-8">
          <div className="absolute inset-0 bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-white/10 shadow-xl shadow-blue-400/15 dark:shadow-blue-500/5" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.06] via-cyan-400/[0.04] to-sky-400/[0.06] dark:from-blue-500/[0.02] dark:via-cyan-500/[0.02] dark:to-sky-500/[0.02] rounded-2xl" />

          {/* Crystalline Highlight */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-300/50 dark:via-white/30 to-transparent" />

          <div className="relative p-6 rounded-2xl transition-all duration-500 group-hover:backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
                Formulário de Cadastro
              </h2>
            </div>

            {/* Form Container with Glass Effect */}
            <div className="flex justify-center">
              <div className="w-full">
                <FormPassegers id={params.id} />
              </div>
            </div>
          </div>
        </section>

        {/* Info Cards Section */}
        <section className="mb-8 relative group">
          <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-white/10 shadow-lg shadow-blue-400/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.05] to-sky-400/[0.05] dark:from-cyan-500/[0.02] dark:to-sky-500/[0.02] rounded-2xl" />

          <div className="relative p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-cyan-100/50 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Informações Importantes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Dados Necessários
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preencha todos os campos obrigatórios para cadastrar o
                  colaborador no sistema.
                </p>
              </div>

              <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Segurança
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Todos os dados são criptografados e armazenados com segurança.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Spacer with Glass Effect */}
        <div className="pb-20 relative">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-100/[0.08] to-transparent dark:from-white/[0.01] backdrop-blur-sm rounded-t-3xl" />
        </div>
      </div>
    </div>
  );
};

export default App;
