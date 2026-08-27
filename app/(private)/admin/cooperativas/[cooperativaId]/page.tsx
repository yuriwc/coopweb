import { listarCooperativas, listarMotoristasDaCooperativa } from "@/src/services/admin";
import CooperativaDetalheClient from "./cooperativa-detalhe-client";

export default async function CooperativaDetalhePage(props: {
  params: Promise<{ cooperativaId: string }>;
}) {
  const { cooperativaId } = await props.params;

  const [cooperativas, motoristas] = await Promise.all([
    listarCooperativas(),
    listarMotoristasDaCooperativa(cooperativaId),
  ]);

  const cooperativa = cooperativas.find((c) => c.id === cooperativaId) ?? null;

  return (
    <CooperativaDetalheClient
      cooperativaId={cooperativaId}
      nome={cooperativa?.nome ?? null}
      codigo={cooperativa?.codigo ?? null}
      motoristas={motoristas}
    />
  );
}
