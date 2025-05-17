import { Cooperativa } from "@/src/model/cooperativas";
import { Button } from "@heroui/button";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/findByUser`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const empresas = await response.json();
  return (
    <div className="flex flex-col min-h-screen bg-white items-center justify-center px-4 py-12">
      <main className="flex flex-col items-center w-full max-w-2xl mx-auto gap-10 flex-1 justify-center">
        <h1 className="text-3xl sm:text-4xl font-light tracking-[0.25em] uppercase text-black text-center mb-2">
          CoopWeb
        </h1>
        <h2 className="text-xs sm:text-sm font-light tracking-[0.18em] uppercase text-black text-center mb-8">
          Gestão e Controle de Mobilidade
        </h2>
        <p className="text-xs sm:text-base font-light tracking-[0.15em] uppercase text-black text-center mb-6">
          Selecione em qual empresa deseja entrar
        </p>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-items-center">
          {empresas.map((empresa: Cooperativa) => (
            <Link className="w-full" href={`/${empresa.id}`} key={empresa.id}>
              <Button className="w-full h-full border rounded-none p-6 flex flex-col items-center transition hover:bg-black hover:text-white group">
                <span className="text-base sm:text-lg font-light tracking-[0.18em] uppercase transition">
                  {empresa.nome}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
