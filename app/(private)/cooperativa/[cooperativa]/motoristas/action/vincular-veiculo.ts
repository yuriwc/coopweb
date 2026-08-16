"use server";

import { revalidateTag } from "next/cache";
import { extractErrorMessage } from "../../../../../../src/utils/http-error";
import { VincularVeiculoDto } from "../../../../../../src/model/motorista";

// Backend hoje devolve erro técnico de banco para placa duplicada (RN-10), sem
// mensagem de negócio amigável — ver PRD-T03 FR-T03-005 / Achados. Detectamos o
// padrão típico de erro de constraint/SQL e trocamos por uma mensagem legível;
// qualquer outra mensagem do backend é repassada como veio.
function humanizeVeiculoError(rawMessage: string | undefined): string {
  const looksLikeTechnicalError =
    !rawMessage ||
    /sqlexception|constraint|duplicate entry|data integrity|violat/i.test(rawMessage);

  return looksLikeTechnicalError
    ? "Não foi possível cadastrar o veículo — verifique se a placa já está em uso."
    : rawMessage;
}

export async function vincularVeiculo({
  motoristaId,
  dados,
  token,
}: {
  motoristaId: string;
  dados: VincularVeiculoDto;
  token: string;
}): Promise<{ success: boolean; message?: string }> {
  const url = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/motorista/${motoristaId}/veiculo`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
      cache: "no-store",
    });

    if (!response.ok) {
      const rawMessage = await extractErrorMessage(response);
      return { success: false, message: humanizeVeiculoError(rawMessage) };
    }

    revalidateTag("motoristas-cooperativa", "");
    return { success: true };
  } catch (error) {
    console.error("Erro ao vincular veículo:", error);
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}
