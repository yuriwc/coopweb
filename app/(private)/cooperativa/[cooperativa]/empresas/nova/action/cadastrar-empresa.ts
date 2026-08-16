"use server";

import { revalidateTag } from "next/cache";
import { extractErrorMessage } from "../../../../../../../src/utils/http-error";
import { CadastroEmpresaDto } from "../../../../../../../src/model/empresa";

export async function cadastrarEmpresa({
  dados,
  token,
}: {
  dados: CadastroEmpresaDto;
  token: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa`, {
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
      return { success: false, message: message ?? "Erro ao cadastrar empresa. Tente novamente." };
    }

    revalidateTag("empresas-cooperativa", "");
    return { success: true };
  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
