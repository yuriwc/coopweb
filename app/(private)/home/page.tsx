import { Cooperativa } from "@/src/model/cooperativas";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";
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
    }
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 items-center justify-center px-4">
        <Card className="max-w-md w-full border border-danger-200 bg-danger-50 dark:bg-danger-950/30">
          <CardBody className="flex flex-col items-center gap-4 p-8">
            <Icon
              icon="solar:close-circle-linear"
              className="w-16 h-16 text-danger-500"
            />
            <h3 className="text-lg font-semibold text-danger-700 dark:text-danger-400">
              Erro ao carregar empresas
            </h3>
            <p className="text-sm text-danger-600 dark:text-danger-300 text-center">
              Não foi possível carregar as empresas disponíveis. Tente novamente
              mais tarde.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const empresas = await response.json();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
      </div>

      <main className="flex flex-col items-center w-full max-w-6xl mx-auto gap-12 flex-1 justify-center px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Icon
                icon="solar:buildings-3-linear"
                className="w-12 h-12 text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              CoopWeb
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto" />
          </div>

          <h2 className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-300 tracking-wide">
            Gestão e Controle de Mobilidade
          </h2>

          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Selecione sua empresa para acessar o sistema de gestão de
            transportes
          </p>
        </div>

        {/* Companies Grid */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {empresas.map((empresa: Cooperativa) => (
              <Link
                className="group block transform transition-all duration-300 hover:scale-105"
                href={`/${empresa.id}`}
                key={empresa.id}
              >
                <Card className="h-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600">
                  <CardBody className="flex flex-col items-center justify-center gap-6 p-8 min-h-[180px]">
                    {/* Company Icon */}
                    <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl transition-all duration-300 group-hover:scale-110">
                      <Icon
                        icon="solar:buildings-2-linear"
                        className="w-8 h-8 text-blue-600 dark:text-blue-400"
                      />
                    </div>

                    {/* Company Name */}
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {empresa.nome}
                      </h3>
                      <div className="w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto transition-all duration-300 group-hover:w-12" />
                    </div>

                    {/* Access Button */}
                    <Button
                      variant="flat"
                      color="primary"
                      size="sm"
                      startContent={
                        <Icon
                          icon="solar:arrow-right-linear"
                          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        />
                      }
                      className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-all duration-300"
                    >
                      Acessar
                    </Button>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {empresas.length === 0 && (
            <Card className="max-w-md mx-auto border border-gray-200 dark:border-gray-700">
              <CardBody className="flex flex-col items-center gap-4 p-12 text-center">
                <Icon
                  icon="solar:buildings-linear"
                  className="w-16 h-16 text-gray-400"
                />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                  Nenhuma empresa encontrada
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Entre em contato com o administrador para ter acesso às
                  empresas.
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Sistema de gestão empresarial • Versão 2.0
          </p>
        </div>
      </main>
    </div>
  );
}
