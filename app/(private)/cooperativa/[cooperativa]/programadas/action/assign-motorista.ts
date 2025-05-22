"use server";

import { revalidateTag } from "next/cache";

export async function assignMotorista({
  idProgramacao,
  idMotorista,
  token,
}: {
  idProgramacao: string;
  idMotorista: string;
  token: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/${idProgramacao}/motorista/${idMotorista}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return { success: false };
    }
    revalidateTag("programacoes");
    return { success: true };
  } catch {
    return { success: false };
  }
}
