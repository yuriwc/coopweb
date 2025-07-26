import { Spinner } from "@heroui/spinner";

const Loading = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-blue-50/50 dark:bg-gray-900">
      {/* Liquid Glass Background */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-100/40 via-cyan-50/30 to-sky-100/40 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40" />
      <div className="fixed inset-0 backdrop-blur-[2px]" />

      {/* Dynamic Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-32 right-20 w-24 h-24 bg-cyan-200/20 dark:bg-purple-400/10 rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-sky-200/20 dark:bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-300/15 dark:bg-blue-500/8 rounded-full blur-2xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-cyan-300/15 dark:bg-cyan-500/8 rounded-full blur-2xl animate-pulse delay-1200" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full pt-6 px-4 sm:px-6 lg:px-8">
        {/* Loading Container */}
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <Spinner
                size="lg"
                color="primary"
                classNames={{
                  circle1: "border-b-blue-500",
                  circle2: "border-b-sky-500",
                }}
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Carregando viagens...
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Aguarde enquanto buscamos seus dados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
