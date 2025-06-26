import {
  CompanyConfig,
  CompanyConfigsUpdateDto,
} from "../model/company-config";

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
  throw new Error(
    "getCompanyConfigs is deprecated. Use getCompanyConfigsServer or getCompanyConfigsClient instead."
  );
}

/**
 * Atualiza as configurações da empresa
 * PUT /api/company-configs/empresa/{empresaId}
 *
 * @deprecated Use updateCompanyConfigsServer ou updateCompanyConfigsClient
 */
export async function updateCompanyConfigs(
  empresaId: string,
  data: CompanyConfigsUpdateDto
): Promise<CompanyConfig | null> {
  throw new Error(
    "updateCompanyConfigs is deprecated. Use updateCompanyConfigsServer or updateCompanyConfigsClient instead."
  );
}
