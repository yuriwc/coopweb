import { Cooperativa } from "../model/cooperativas";
import { EmpresaResumo, UsuarioEmpresa } from "../model/admin";
import { Empresa } from "../model/empresa";
import { Funcionario } from "../model/funcionario";
import { MotoristaResumo } from "../model/admin";
import { getToken } from "../utils/token/get-token";

/**
 * GET autenticado para as telas do painel. Lista vazia (ou null) em vez de exceção: a tela
 * mostra o estado vazio em vez de quebrar quando um dos blocos falha.
 */
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Erro em GET ${path}:`, response.status, response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Erro em GET ${path}:`, error);
    return null;
  }
}

/** ADMIN recebe todas as empresas neste endpoint, não só as vinculadas a ele. */
export async function listarEmpresas(): Promise<EmpresaResumo[]> {
  return (await getJson<EmpresaResumo[]>("/api/v1/empresa/findByUser")) ?? [];
}

export async function listarCooperativas(): Promise<Cooperativa[]> {
  return (await getJson<Cooperativa[]>("/api/v1/cooperativa")) ?? [];
}

export async function buscarEmpresa(empresaId: string): Promise<Empresa | null> {
  return getJson<Empresa>(`/api/v1/empresa/${empresaId}`);
}

export async function listarFuncionarios(empresaId: string): Promise<Funcionario[]> {
  return (await getJson<Funcionario[]>(`/api/v1/empresa/${empresaId}/funcionarios`)) ?? [];
}

export async function listarUsuariosDaEmpresa(empresaId: string): Promise<UsuarioEmpresa[]> {
  return (await getJson<UsuarioEmpresa[]>(`/api/v1/empresa/${empresaId}/usuarios`)) ?? [];
}

/** Cooperativas já vinculadas à empresa, no formato label/value do backend. */
export async function listarCooperativasDaEmpresa(
  empresaId: string,
): Promise<{ label: string; value: string }[]> {
  return (
    (await getJson<{ label: string; value: string }[]>(
      `/api/v1/empresa/${empresaId}/cooperativas`,
    )) ?? []
  );
}

/** O backend devolve apenas id e nome nesta rota (MotoristaBasicDTO). */
export async function listarMotoristasDaCooperativa(
  cooperativaId: string,
): Promise<MotoristaResumo[]> {
  return (await getJson<MotoristaResumo[]>(`/api/v1/cooperativa/${cooperativaId}/motoristas`)) ?? [];
}
