"use server";

import { extractErrorMessage } from "../../../../../../src/utils/http-error";

export async function cancelarVoucher({
  voucherId,
  token,
}: {
  voucherId: string;
  token: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/voucher/${voucherId}/cancelar`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar voucher:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
