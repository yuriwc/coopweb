import { listarCooperativas, listarEmpresas } from "@/src/services/admin";
import EmpresasClient from "./empresas-client";

export default async function EmpresasAdminPage() {
  const [empresas, cooperativas] = await Promise.all([listarEmpresas(), listarCooperativas()]);

  return <EmpresasClient empresas={empresas} cooperativas={cooperativas} />;
}
