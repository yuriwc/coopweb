import {
  CompanyConfig,
  CompanyConfigsUpdateDto,
} from "../model/company-config";

/**
 * Versão server-side do serviço de configurações da empresa
 * Recebe o token como parâmetro em vez de buscar dos cookies
 */

/**
 * Busca as configurações da empresa (server-side)
 * GET /api/company-configs/empresa/{empresaId}
 */
export async function getCompanyConfigsServer(
  empresaId: string,
  token: string
): Promise<CompanyConfig | null> {
  try {
    const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER;
    const response = await fetch(
      `${serverUrl}/api/company-configs/empresa/${empresaId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Erro na requisição:",
        response.status,
        response.statusText
      );
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao buscar configurações da empresa:", error);
    return null;
  }
}

/**
 * Atualiza as configurações da empresa (server-side)
 * PUT /api/company-configs/empresa/{empresaId}
 */
export async function updateCompanyConfigsServer(
  empresaId: string,
  data: CompanyConfigsUpdateDto,
  token: string
): Promise<CompanyConfig | null> {
  try {
    const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER;
    const response = await fetch(
      `${serverUrl}/api/company-configs/empresa/${empresaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      console.error(
        "Erro na requisição:",
        response.status,
        response.statusText
      );
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao atualizar configurações da empresa:", error);
    return null;
  }
}
