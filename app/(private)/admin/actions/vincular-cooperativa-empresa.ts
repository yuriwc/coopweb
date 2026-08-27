"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/src/utils/http-error";
import { ResultadoAcao } from "@/src/model/admin";
import { getToken } from "@/src/utils/token/get-token";

export async function vincularCooperativaAEmpresa(
  empresaId: string,
  cooperativaId: string,
): Promise<ResultadoAcao> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${empresaId}/cooperativas/${cooperativaId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message: message ?? "Erro ao vincular cooperativa. Tente novamente." };
    }

    revalidatePath(`/admin/empresas/${empresaId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao vincular cooperativa à empresa:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
