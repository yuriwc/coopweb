"use server";

import { revalidateTag } from "next/cache";
import { extractErrorMessage } from "../../../../../../src/utils/http-error";
import { NovaFilaDto } from "../../../../../../src/model/fila";

export async function criarFila({
  cooperativaId,
  dados,
  token,
}: {
  cooperativaId: string;
  dados: NovaFilaDto;
  token: string;
}): Promise<{ success: boolean; message?: string }> {
  const url = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${cooperativaId}/fila`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message };
    }

    revalidateTag("filas-cooperativa", "");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar fila:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
