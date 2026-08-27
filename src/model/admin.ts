import { UUID } from "crypto";

export type Role = "ADMIN" | "MOTORISTA" | "PASSAGEIRO" | "EMPRESA" | "COOPERATIVA";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  MOTORISTA: "Motorista",
  PASSAGEIRO: "Passageiro",
  EMPRESA: "Empresa",
  COOPERATIVA: "Cooperativa",
};

/** Identidade da sessão atual, vinda de GET /api/v1/auth/me. */
export interface UsuarioAutenticado {
  id: UUID;
  username: string;
  firstname: string | null;
  lastname: string | null;
  role: Role | null;
}

export interface EmpresaResumo {
  id: UUID;
  nome: string;
}

export interface CooperativaResumo {
  id: UUID;
  nome: string;
}

/** Resultado da busca de motorista por CPF, usada na tela de vínculo com cooperativa. */
export interface MotoristaLookup {
  id: UUID;
  nome: string | null;
  cpf: string;
  ativo: boolean | null;
  cooperativaId: UUID | null;
  cooperativaNome: string | null;
}

/** Forma real de GET /api/v1/cooperativa/{id}/motoristas — o backend só devolve id e nome. */
export interface MotoristaResumo {
  id: UUID;
  nome: string | null;
}

/**
 * Usuário vinculado a uma empresa. `senhaTemporaria` só vem preenchida na resposta da criação,
 * quando nenhuma senha foi informada — é a única vez que ela aparece.
 */
export interface UsuarioEmpresa {
  id: UUID;
  username: string;
  firstname: string | null;
  lastname: string | null;
  role: Role | null;
  senhaTemporaria: string | null;
}

export interface CriarUsuarioEmpresaDto {
  firstname: string;
  lastname?: string;
  username: string;
  password?: string;
  role?: Role;
}

export interface CadastroCooperativaDto {
  nome: string;
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

export interface CooperativaCriada extends CadastroCooperativaDto {
  id: UUID;
  codigo: string;
}

export interface CriarMotoristaDto {
  cpf: string;
  firstname: string;
  lastname?: string;
  password?: string;
  cnh: string;
  cooperativaCode: string;
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

export interface MotoristaCriado {
  motoristaId: UUID;
  cooperativaId: UUID;
  usuarioId: UUID;
  username: string;
  senhaTemporaria: string | null;
}

export type ResultadoAcao<T = undefined> = {
  success: boolean;
  message?: string;
  data?: T;
};
