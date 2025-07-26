import { getTokenClient } from "../utils/token/get-token-client";

export interface Motorista {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status?: string;
}

export async function getMotoristas(
  cooperativaId: string
): Promise<Motorista[] | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${cooperativaId}/motoristas`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getTokenClient()}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Erro na requisição:", response.status, response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    return null;
  }
}

export async function assignMotoristaToRide(
  cooperativaId: string,
  rideId: string,
  motoristaId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/cooperativa/${cooperativaId}/rides/${rideId}/assign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getTokenClient()}`,
        },
        body: JSON.stringify({ motoristaId }),
      }
    );

    if (!response.ok) {
      console.error("Erro ao atribuir motorista:", response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atribuir motorista:", error);
    return false;
  }
}