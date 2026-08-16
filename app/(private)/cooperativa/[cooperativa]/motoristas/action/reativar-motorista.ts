"use server";

import { revalidateTag } from "next/cache";
import { extractErrorMessage } from "../../../../../../src/utils/http-error";

export async function reativarMotorista({
  motoristaId,
  token,
}: {
  motoristaId: string;
  token: string;
}): Promise<{ success: boolean; message?: string }> {
  const url = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/motorista/${motoristaId}/reativar`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message };
    }

    revalidateTag("motoristas-cooperativa", "");
    return { success: true };
  } catch (error) {
    console.error("Erro ao reativar motorista:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
