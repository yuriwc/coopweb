export interface CompanyConfig {
  id: string;
  dataFechamento: number;
  calcularPrecoAutomatico: boolean;
  precoPorKm: number;
  precoBase: number;
  empresaId: string;
  empresaNome: string;
}

export interface CompanyConfigsUpdateDto {
  dataFechamento?: number; // Integer (1-31) - Dia do fechamento mensal
  calcularPrecoAutomatico?: boolean; // Boolean - Ativar cálculo automático por km
  precoPorKm?: number; // BigDecimal - Valor por quilômetro
  precoBase?: number; // BigDecimal - Valor base da corrida
}
