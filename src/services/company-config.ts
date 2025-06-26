import { CompanyConfig, CompanyConfigsUpdateDto } from "../model/company-config";
// import { getToken } from "../utils/token/get-token"; // DEPRECATED: Use company-config-server.ts ou company-config-client.ts

/**
 * DEPRECATED: Este arquivo está descontinuado.
 * Use:
 * - company-config-server.ts para server components
 * - company-config-client.ts para client components
 */

/**
 * Busca as configurações da empresa
 * GET /api/company-configs/empresa/{empresaId}
 * 
 * @deprecated Use getCompanyConfigsServer ou getCompanyConfigsClient
 */
export async function getCompanyConfigs(
  empresaId: string
): Promise<CompanyConfig | null> {
  throw new Error("getCompanyConfigs is deprecated. Use getCompanyConfigsServer or getCompanyConfigsClient instead.");
}
    return null;
  }
}

/**
 * Atualiza as configurações da empresa
 * PUT /api/company-configs/empresa/{empresaId}
 */
export async function updateCompanyConfigs(
  empresaId: string,
  data: CompanyConfigsUpdateDto
): Promise<CompanyConfig | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/company-configs/empresa/${empresaId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      console.error("Erro na requisição:", response.status, response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao atualizar configurações da empresa:", error);
    return null;
  }
}
