"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/src/utils/http-error";
import { ResultadoAcao } from "@/src/model/admin";
import { getToken } from "@/src/utils/token/get-token";

/**
 * Definitivo: não há endpoint de reativar, e a rota desativada continua bloqueando o
 * recadastro do mesmo par de cidades para a empresa (P-18 da EF Financeiro).
 */
export async function desativarRotaTabelaPreco(
  empresaId: string,
  rotaId: string,
): Promise<ResultadoAcao> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/tabela-preco/${rotaId}/desativar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message: message ?? "Erro ao desativar a rota. Tente novamente." };
    }

    revalidatePath(`/admin/empresas/${empresaId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao desativar rota da tabela de preços:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
