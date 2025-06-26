import {
  CompanyConfig,
  CompanyConfigsUpdateDto,
} from "../model/company-config";

/**
 * Versão client-side do serviço de configurações da empresa
 * Não utiliza server-side cookies, espera o token como parâmetro
 */

/**
 * Busca as configurações da empresa (client-side)
 * GET /api/company-configs/empresa/{empresaId}
 */
export async function getCompanyConfigsClient(
  empresaId: string,
  token: string
): Promise<CompanyConfig | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/company-configs/empresa/${empresaId}`,
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
 * Atualiza as configurações da empresa (client-side)
 * PUT /api/company-configs/empresa/{empresaId}
 */
export async function updateCompanyConfigsClient(
  empresaId: string,
  data: CompanyConfigsUpdateDto,
  token: string
): Promise<CompanyConfig | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/company-configs/empresa/${empresaId}`,
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
