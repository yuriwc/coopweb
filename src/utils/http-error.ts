export async function extractErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body = await response.clone().json();
    if (typeof body?.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // corpo não é JSON — tenta texto puro abaixo
  }

  try {
    const text = await response.text();
    return text.length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Erros por campo do 400 de validação do backend (`{ errors: { campo: mensagem } }`), com os
 * nomes de campo do DTO. Chame antes de `extractErrorMessage`, que consome o corpo.
 */
export async function extractFieldErrors(
  response: Response,
): Promise<Record<string, string> | undefined> {
  try {
    const body = await response.clone().json();
    if (body?.errors && typeof body.errors === "object" && Object.keys(body.errors).length > 0) {
      return body.errors;
    }
  } catch {
    // corpo não é JSON — não há erros por campo
  }
  return undefined;
}
