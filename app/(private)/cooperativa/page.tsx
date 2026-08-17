import { Cooperativa } from "@/src/model/cooperativas";
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            CoopGo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Selecione a cooperativa que deseja acessar
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map((empresa: Cooperativa) => (
            <Link href={`/cooperativa/${empresa.id}`} key={empresa.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <Card.Content className="flex flex-col items-center justify-center text-center gap-3 py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon icon="solar:buildings-2-linear" className="w-6 h-6" />
                  </div>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {empresa.nome}
                  </span>
                </Card.Content>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
