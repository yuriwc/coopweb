export type CategoriaVeiculo =
  | "BASICO"
  | "PREMIUM"
  | "EXECUTIVO"
  | "VAN"
  | "MICRO_ONIBUS"
  | "ADAPTADO";

export interface VeiculoResumo {
  id: string;
  placa: string;
  modelo: string;
}

export interface MotoristaCooperativa {
  id: string;
  nome: string | null;
  cpf: string;
  cnhNumero: string;
  ativo: boolean;
  motivoBloqueio: string | null;
  veiculo: VeiculoResumo | null;
}

export interface CadastroMotoristaManualDto {
  cnh: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  cep: string;
  estado: string;
  telefone: string;
  email?: string;
  referencia?: string;
}

export interface VincularVeiculoDto {
  marca: string;
  modelo: string;
  placa: string;
  cor: string;
  capacidade: number;
  categoria: CategoriaVeiculo;
  ano: number;
  chassi: string;
}

export interface BloquearMotoristaDto {
  motivo: string;
}

export interface ImportacaoMotoristasResumo {
  totalLinhas: number;
  sucesso: number;
  erro: number;
}

export const CATEGORIA_VEICULO_LABEL: Record<CategoriaVeiculo, string> = {
  BASICO: "Básico",
  PREMIUM: "Premium",
  EXECUTIVO: "Executivo",
  VAN: "Van",
  MICRO_ONIBUS: "Micro-ônibus",
  ADAPTADO: "Adaptado",
};

export function isCadastroCompleto(motorista: MotoristaCooperativa): boolean {
  return motorista.nome !== null && motorista.nome.trim().length > 0;
}
