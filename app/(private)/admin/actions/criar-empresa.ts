"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/src/utils/http-error";
import { CadastroEmpresaDto } from "@/src/model/empresa";
import { ResultadoAcao } from "@/src/model/admin";
import { getToken } from "@/src/utils/token/get-token";

export async function criarEmpresa(dados: CadastroEmpresaDto): Promise<ResultadoAcao> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa`, {
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
      return { success: false, message: message ?? "Erro ao cadastrar empresa. Tente novamente." };
    }

    revalidatePath("/admin/empresas");
    return { success: true };
  } catch (error) {
    console.error("Erro ao cadastrar empresa:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
