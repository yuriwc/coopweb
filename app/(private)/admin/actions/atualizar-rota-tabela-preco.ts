"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage, extractFieldErrors } from "@/src/utils/http-error";
import { ResultadoAcao } from "@/src/model/admin";
import { AtualizarRotaDto, RotaTabelaPreco } from "@/src/model/tabela-preco";
import { getToken } from "@/src/utils/token/get-token";

/** Troca os seis valores e as observações; cidades e empresa não mudam. */
export async function atualizarRotaTabelaPreco(
  empresaId: string,
  rotaId: string,
  dados: AtualizarRotaDto,
): Promise<ResultadoAcao<RotaTabelaPreco>> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/tabela-preco/${rotaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify(dados),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errors = await extractFieldErrors(response);
      const message = await extractErrorMessage(response);
      return {
        success: false,
        message: message ?? "Erro ao atualizar a rota. Tente novamente.",
        errors,
      };
    }

    revalidatePath(`/admin/empresas/${empresaId}`);
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Erro ao atualizar rota da tabela de preços:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
