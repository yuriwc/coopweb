import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { getUsuarioAtual } from "@/src/services/usuario-atual";

const AREAS = [
  {
    href: "/admin/empresas",
    icone: "solar:buildings-2-linear",
    titulo: "Empresas",
    descricao:
      "Cadastrar empresas, criar e vincular contas de acesso, ver funcionários com o código de 4 dígitos e vincular cooperativas.",
  },
  {
    href: "/admin/cooperativas",
    icone: "solar:users-group-rounded-linear",
    titulo: "Cooperativas",
    descricao:
      "Cadastrar cooperativas, consultar o código de 4 dígitos, cadastrar motoristas e vincular motoristas existentes.",
  },
];

export default async function AdminHome() {
  const usuario = await getUsuarioAtual();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Painel administrativo
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {usuario?.firstname
              ? `Olá, ${usuario.firstname}. Gerencie os cadastros da plataforma.`
              : "Gerencie os cadastros da plataforma."}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {AREAS.map((area) => (
            <Link key={area.href} href={area.href} className="group block">
              <Card className="h-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 group-hover:border-accent">
                <Card.Content className="flex flex-col gap-4 p-6">
                  <div className="p-3 bg-accent-soft rounded-xl w-fit">
                    <Icon icon={area.icone} className="w-7 h-7 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {area.titulo}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {area.descricao}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-accent flex items-center gap-1">
                    Acessar
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    />
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
