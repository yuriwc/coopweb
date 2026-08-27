import { UsuarioAutenticado } from "../model/admin";
import { getToken } from "../utils/token/get-token";

/**
 * Quem está logado. O JWT não carrega a role, então essa informação só vem do backend —
 * é o que decide se a área administrativa aparece.
 */
export async function getUsuarioAtual(): Promise<UsuarioAutenticado | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Erro ao buscar usuário atual:", response.status, response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error);
    return null;
  }
}
