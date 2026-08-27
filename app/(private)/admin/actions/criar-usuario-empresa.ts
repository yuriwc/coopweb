"use server";

import { revalidatePath } from "next/cache";
import { extractErrorMessage } from "@/src/utils/http-error";
import { CriarUsuarioEmpresaDto, ResultadoAcao, UsuarioEmpresa } from "@/src/model/admin";
import { getToken } from "@/src/utils/token/get-token";

/** Cria a conta de acesso já vinculada à empresa. */
export async function criarUsuarioEmpresa(
  empresaId: string,
  dados: CriarUsuarioEmpresaDto,
): Promise<ResultadoAcao<UsuarioEmpresa>> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${empresaId}/usuarios`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify(dados),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message: message ?? "Erro ao criar usuário. Tente novamente." };
    }

    revalidatePath(`/admin/empresas/${empresaId}`);
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Erro ao criar usuário da empresa:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
