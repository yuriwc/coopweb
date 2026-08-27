import { listarCooperativas } from "@/src/services/admin";
import CooperativasClient from "./cooperativas-client";

export default async function CooperativasAdminPage() {
  const cooperativas = await listarCooperativas();

  return <CooperativasClient cooperativas={cooperativas} />;
}
