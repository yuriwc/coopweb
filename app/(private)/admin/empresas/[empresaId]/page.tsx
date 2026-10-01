import {
  buscarEmpresa,
  listarCooperativas,
  listarCooperativasDaEmpresa,
  listarFuncionarios,
  listarTabelaPreco,
  listarUsuariosDaEmpresa,
} from "@/src/services/admin";
import EmpresaDetalheClient from "./empresa-detalhe-client";

export default async function EmpresaDetalhePage(props: {
  params: Promise<{ empresaId: string }>;
}) {
  const { empresaId } = await props.params;

  const [
    empresa,
    funcionarios,
    usuarios,
    cooperativasVinculadas,
    todasCooperativas,
    tabelaPreco,
  ] = await Promise.all([
    buscarEmpresa(empresaId),
    listarFuncionarios(empresaId),
    listarUsuariosDaEmpresa(empresaId),
    listarCooperativasDaEmpresa(empresaId),
    listarCooperativas(),
    listarTabelaPreco(empresaId),
  ]);

  return (
    <EmpresaDetalheClient
      empresaId={empresaId}
      empresa={empresa}
      funcionarios={funcionarios}
      usuarios={usuarios}
      cooperativasVinculadas={cooperativasVinculadas}
      todasCooperativas={todasCooperativas}
      tabelaPreco={tabelaPreco}
    />
  );
}
