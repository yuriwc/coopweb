"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/src/utils/http-error";
import { ResultadoAcao } from "@/src/model/admin";
import { getToken } from "@/src/utils/token/get-token";

export async function vincularMotoristaACooperativa(
  cooperativaId: string,
  motoristaId: string,
): Promise<ResultadoAcao> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${cooperativaId}/motoristas/${motoristaId}`,
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
      return { success: false, message: message ?? "Erro ao vincular motorista. Tente novamente." };
    }

    revalidatePath(`/admin/cooperativas/${cooperativaId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao vincular motorista à cooperativa:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
