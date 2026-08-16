/**
 * Substituto de `fetch` que loga método, URL e status no console — no terminal
 * quando chamado em Server Component/Server Action, no console do navegador
 * quando chamado em Client Component. Uso: trocar `fetch(url, init)` por
 * `fetchComLog(url, init)`, mantendo o resto do código igual.
 */
export async function fetchComLog(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method ?? "GET";
  console.log(`[fetch] → ${method} ${url}`);

  try {
    const response = await fetch(url, init);
    console.log(`[fetch] ← ${response.status} ${method} ${url}`);
    return response;
  } catch (error) {
    console.error(`[fetch] ✕ erro de rede em ${method} ${url}`, error);
    throw error;
  }
}
