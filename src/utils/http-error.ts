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
