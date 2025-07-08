"use server";

import { revalidateTag } from "next/cache";

export async function encerrarProgramacao({
  idProgramacao,
  token,
}: {
  idProgramacao: string;
  token: string;
}) {
  const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER;
  const url = `${serverUrl}/api/v1/programacao/${idProgramacao}/encerrar`;
  
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
      const errorData = await response.text();
      return { 
        success: false, 
        message: errorData || `Erro ${response.status}: ${response.statusText}` 
      };
    }

    const result = await response.text();
    revalidateTag("programacoes-com-motorista");
    revalidateTag("programacoes");
    
    return { 
      success: true, 
      message: result || "Programação encerrada com sucesso." 
    };
  } catch (error) {
    console.error("Erro ao encerrar programação:", error);
    return { 
      success: false, 
      message: "Erro ao conectar com o servidor" 
    };
  }
}