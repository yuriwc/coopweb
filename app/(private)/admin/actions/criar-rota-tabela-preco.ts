"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage, extractFieldErrors } from "@/src/utils/http-error";
import { ResultadoAcao } from "@/src/model/admin";
import { CriarRotaDto, RotaTabelaPreco } from "@/src/model/tabela-preco";
import { getToken } from "@/src/utils/token/get-token";

export async function criarRotaTabelaPreco(
  dados: CriarRotaDto,
): Promise<ResultadoAcao<RotaTabelaPreco>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/tabela-preco`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(dados),
      cache: "no-store",
    });

    if (!response.ok) {
      // Rota duplicada (em qualquer sentido, sem acento/caixa) chega aqui como 400 com a mensagem pronta
      const errors = await extractFieldErrors(response);
      const message = await extractErrorMessage(response);
      return {
        success: false,
        message: message ?? "Erro ao cadastrar a rota. Tente novamente.",
        errors,
      };
    }

    revalidatePath(`/admin/empresas/${dados.empresaId}`);
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Erro ao cadastrar rota da tabela de preços:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
