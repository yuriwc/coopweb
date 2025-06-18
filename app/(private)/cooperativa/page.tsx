import { Cooperativa } from "@/src/model/cooperativas";
import { Button } from "@heroui/button";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const empresas = await response.json();
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50/80 to-indigo-100/60 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/30">
      {/* Background aquático com partículas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-sky-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-tl from-sky-400/10 to-indigo-400/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen items-center justify-center px-4 py-12">
        <main className="flex flex-col items-center w-full max-w-4xl mx-auto gap-10 flex-1 justify-center">
          {/* Header com logo e título */}
          <div className="text-center space-y-6 mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-wide">
              CoopWeb
            </h1>
            <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl px-6 py-4 shadow-xl">
              <h2 className="text-sm sm:text-base font-medium tracking-[0.15em] uppercase text-slate-700 dark:text-slate-200 mb-2">
                Gestão e Controle de Mobilidade
              </h2>
              <p className="text-xs sm:text-sm font-medium tracking-[0.12em] uppercase text-slate-600 dark:text-slate-300">
                Selecione em qual Cooperativa deseja entrar
              </p>
            </div>
          </div>

          {/* Grid de cooperativas */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-items-center">
            {empresas.map((empresa: Cooperativa) => (
              <Link
                className="w-full"
                href={`/cooperativa/${empresa.id}`}
                key={empresa.id}
              >
                <Button className="w-full h-full backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/15 hover:shadow-xl hover:scale-105 hover:-translate-y-1 group shadow-lg min-h-[120px]">
                  <span className="text-base sm:text-lg font-semibold tracking-[0.15em] uppercase text-slate-800 dark:text-slate-100 transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-center">
                    {empresa.nome}
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
