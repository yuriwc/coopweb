import { redirect } from "next/navigation";
import Navbar from "@/src/components/navbar";
import { getUsuarioAtual } from "@/src/services/usuario-atual";

/**
 * Portão da área administrativa. O backend já recusa as operações por @PreAuthorize; a checagem
 * aqui evita que quem não é ADMIN caia numa tela cheia de 403.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioAtual();

  if (!usuario) {
    redirect("/signin");
  }

  if (usuario.role !== "ADMIN") {
    redirect("/home");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
