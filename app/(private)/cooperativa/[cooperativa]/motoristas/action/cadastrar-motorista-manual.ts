"use server";

import { revalidateTag } from "next/cache";
import { extractErrorMessage } from "../../../../../../src/utils/http-error";
import { CadastroMotoristaManualDto } from "../../../../../../src/model/motorista";

export async function cadastrarMotoristaManual({
  cpf,
  cooperativaCode,
  dados,
  token,
}: {
  cpf: string;
  cooperativaCode: string;
  dados: CadastroMotoristaManualDto;
  token: string;
}): Promise<{ success: boolean; message?: string }> {
  const cpfDigits = cpf.replace(/\D/g, "");
  const url = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/motorista/${cpfDigits}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...dados, cooperativaCode }),
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message };
    }

    revalidateTag("motoristas-cooperativa", "");
    return { success: true };
  } catch (error) {
    console.error("Erro ao cadastrar motorista:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
