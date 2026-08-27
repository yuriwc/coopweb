"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/src/utils/http-error";
import { CriarMotoristaDto, MotoristaCriado, ResultadoAcao } from "@/src/model/admin";
import { getToken } from "@/src/utils/token/get-token";

/**
 * Cadastro em um passo: cria a conta de acesso (username = CPF) e o motorista, já vinculado
 * à cooperativa do `cooperativaCode`.
 */
export async function criarMotorista(
  dados: CriarMotoristaDto,
): Promise<ResultadoAcao<MotoristaCriado>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/motorista`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify({ ...dados, cpf: dados.cpf.replace(/[^0-9]/g, "") }),
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message: message ?? "Erro ao cadastrar motorista. Tente novamente." };
    }

    const data: MotoristaCriado = await response.json();
    revalidatePath(`/admin/cooperativas/${data.cooperativaId}`);
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao cadastrar motorista:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
