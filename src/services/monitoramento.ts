import { getToken } from "../utils/token/get-token";
import type { ISelect } from "../interface/ISelect";
import type { Motorista } from "./motorista";

// Nomes exibidos no cabeçalho do monitoramento em tempo real. Qualquer falha
// vira `undefined` e a tela omite a informação — nunca mostra o ID no lugar.

async function getLista<T>(path: string): Promise<T[]> {
  try {
    const token = await getToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}${path}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Erro ao buscar ${path}:`, error);
    return [];
  }
}

export async function getNomeMotorista(
  cooperativaId: string,
  motoristaId: string
): Promise<string | undefined> {
  const motoristas = await getLista<Motorista>(
    `/api/v1/cooperativa/${cooperativaId}/motoristas`
  );
  return motoristas.find((m) => m.id === motoristaId)?.nome || undefined;
}

export async function getNomeCooperativa(
  empresaId: string,
  cooperativaId: string
): Promise<string | undefined> {
  const cooperativas = await getLista<ISelect>(
    `/api/v1/empresa/${empresaId}/cooperativas`
  );
  return cooperativas.find((c) => c.value === cooperativaId)?.label || undefined;
}
