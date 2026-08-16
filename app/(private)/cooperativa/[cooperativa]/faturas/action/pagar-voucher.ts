"use server";

import { extractErrorMessage } from "../../../../../../src/utils/http-error";
import { PagarVoucherDto } from "../../../../../../src/model/relatorio-vouchers";

export async function pagarVoucher({
  voucherId,
  dados,
  token,
}: {
  voucherId: string;
  dados: PagarVoucherDto;
  token: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/voucher/${voucherId}/pagar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const message = await extractErrorMessage(response);
      return { success: false, message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar pagamento do voucher:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
