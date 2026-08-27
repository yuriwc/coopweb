"use server";

import { extractErrorMessage } from "@/src/utils/http-error";
import { MotoristaLookup, ResultadoAcao } from "@/src/model/admin";
import { getToken } from "@/src/utils/token/get-token";

export async function buscarMotoristaPorCpf(cpf: string): Promise<ResultadoAcao<MotoristaLookup>> {
  const cpfDigits = cpf.replace(/[^0-9]/g, "");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/motorista/por-cpf/${cpfDigits}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return {
        success: false,
        message: message ?? "Nenhum motorista encontrado para este CPF.",
      };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Erro ao buscar motorista por CPF:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
