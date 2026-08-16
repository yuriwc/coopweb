"use server";

import { revalidateTag } from "next/cache";
import { extractErrorMessage } from "../../../../../../src/utils/http-error";
import { ImportacaoMotoristasResumo } from "../../../../../../src/model/motorista";

export async function importarMotoristas({
  cooperativaCode,
  arquivo,
  token,
}: {
  cooperativaCode: string;
  arquivo: File;
  token: string;
}): Promise<{ success: boolean; resumo?: ImportacaoMotoristasResumo; message?: string }> {
  const url = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/motorista/import/${cooperativaCode}`;

  const formData = new FormData();
  formData.append("file", arquivo);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message };
    }

    const resumo: ImportacaoMotoristasResumo = await response.json();
    revalidateTag("motoristas-cooperativa", "");
    return { success: true, resumo };
  } catch (error) {
    console.error("Erro ao importar planilha de motoristas:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
