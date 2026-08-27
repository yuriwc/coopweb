"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/src/utils/http-error";
import { CadastroCooperativaDto, CooperativaCriada, ResultadoAcao } from "@/src/model/admin";
import { getToken } from "@/src/utils/token/get-token";

export async function criarCooperativa(
  dados: CadastroCooperativaDto,
): Promise<ResultadoAcao<CooperativaCriada>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(dados),
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message: message ?? "Erro ao cadastrar cooperativa. Tente novamente." };
    }

    revalidatePath("/admin/cooperativas");
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Erro ao cadastrar cooperativa:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
