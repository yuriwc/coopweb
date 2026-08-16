import { getToken } from "../../../../../src/utils/token/get-token";
import { MotoristaCooperativa } from "../../../../../src/model/motorista";
import MotoristasClient from "./motoristas-client";

interface CooperativaResumo {
  id: string;
  codigo: string;
}

async function fetchCooperativaCodigo(
  cooperativaId: string,
  token: string
): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { tags: ["cooperativa-codigo"] },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const cooperativas: CooperativaResumo[] = Array.isArray(data) ? data : [data];
    const encontrada = cooperativas.find((c) => c.id === cooperativaId) ?? cooperativas[0];
    return encontrada?.codigo ?? null;
  } catch (error) {
    console.error("Erro ao buscar código da cooperativa:", error);
    return null;
  }
}

async function fetchMotoristas(
  cooperativaId: string,
  token: string
): Promise<MotoristaCooperativa[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${cooperativaId}/motoristas`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { tags: ["motoristas-cooperativa"] },
      }
    );

    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    return [];
  }
}

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;
  const cooperativaId = params.cooperativa;
  const token = await getToken();

  const [motoristas, cooperativaCodigo] = await Promise.all([
    fetchMotoristas(cooperativaId, token),
    fetchCooperativaCodigo(cooperativaId, token),
  ]);

  return (
    <MotoristasClient
      cooperativaId={cooperativaId}
      cooperativaCodigo={cooperativaCodigo}
      motoristasIniciais={motoristas}
      token={token}
    />
  );
};

export default App;
