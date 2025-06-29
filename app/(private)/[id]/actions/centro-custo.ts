"use server";

import { revalidateTag } from "next/cache";

export async function vincularCentroCusto(
  funcionarioId: string,
  centroCustoId: number,
  token: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/passageiro/${funcionarioId}/centro-custo`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          centroCustoId,
        }),
      }
    );

    if (response.ok) {
      revalidateTag("getFuncionarios");
      return { success: true };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "Erro ao vincular funcionário",
      };
    }
  } catch (_) {
    return {
      success: false,
      error: "Erro ao vincular funcionário. Tente novamente.",
    };
  }
}
