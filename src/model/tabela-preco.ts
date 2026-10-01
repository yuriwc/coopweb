import { UUID } from "crypto";

/**
 * Rota da tabela de preços de uma empresa (GET /api/v1/tabela-preco/empresa/{id}).
 * Vale nos dois sentidos, e origem e destino podem ser a mesma cidade. Cada valor tem o lado
 * da empresa (cobrado) e o da cooperativa (repassado). Rotas cadastradas antes de 2026-09-27
 * vêm com os cinco valores além de `preco` nulos até o administrador atualizá-las (UC-ADM-04, A2).
 */
export interface RotaTabelaPreco {
  id: UUID;
  cidadeOrigem: string;
  cidadeDestino: string;
  preco: number;
  precoCooperativa: number | null;
  acrescimoRoteiroExtremo: number | null;
  acrescimoRoteiroExtremoCooperativa: number | null;
  /** Valor de uma hora parada; a cobrança é proporcional aos minutos informados pelo motorista. */
  valorHoraParada: number | null;
  valorHoraParadaCooperativa: number | null;
  ativo: boolean;
  observacoes: string | null;
  empresaId: UUID;
}

/** Os seis valores são obrigatórios na criação e na atualização. */
export interface ValoresRotaDto {
  preco: number;
  precoCooperativa: number;
  acrescimoRoteiroExtremo: number;
  acrescimoRoteiroExtremoCooperativa: number;
  valorHoraParada: number;
  valorHoraParadaCooperativa: number;
  observacoes?: string;
}

export interface CriarRotaDto extends ValoresRotaDto {
  cidadeOrigem: string;
  cidadeDestino: string;
  empresaId: string;
}

/** Cidades e empresa não mudam depois de criada a rota. */
export type AtualizarRotaDto = ValoresRotaDto;

export type CampoValorRota = Exclude<keyof ValoresRotaDto, "observacoes">;

/** Os três pares empresa/cooperativa, na ordem em que aparecem na tela. */
export const PARES_VALORES: {
  rotulo: string;
  empresa: CampoValorRota;
  cooperativa: CampoValorRota;
  /** Preço da rota precisa ser maior que zero; acréscimos aceitam zero (rota sem o acréscimo). */
  minimo: number;
}[] = [
  { rotulo: "Valor da rota", empresa: "preco", cooperativa: "precoCooperativa", minimo: 0.01 },
  {
    rotulo: "Roteiro extremo",
    empresa: "acrescimoRoteiroExtremo",
    cooperativa: "acrescimoRoteiroExtremoCooperativa",
    minimo: 0,
  },
  {
    rotulo: "Hora parada",
    empresa: "valorHoraParada",
    cooperativa: "valorHoraParadaCooperativa",
    minimo: 0,
  },
];

/** Rota antiga, sem algum dos valores da cooperativa ou dos acréscimos. */
export function rotaIncompleta(rota: RotaTabelaPreco) {
  return PARES_VALORES.some((par) => rota[par.empresa] == null || rota[par.cooperativa] == null);
}
