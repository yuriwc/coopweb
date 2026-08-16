"use server";

import { extractErrorMessage } from "../../../../../../src/utils/http-error";
import { AplicarDescontoVoucherDto } from "../../../../../../src/model/relatorio-vouchers";

export async function aplicarDescontoVoucher({
  voucherId,
  dados,
  token,
}: {
  voucherId: string;
  dados: AplicarDescontoVoucherDto;
  token: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/voucher/${voucherId}/desconto`,
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
    console.error("Erro ao aplicar desconto no voucher:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
