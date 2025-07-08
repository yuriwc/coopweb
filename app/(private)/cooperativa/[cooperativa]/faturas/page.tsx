import { getToken } from "../../../../../src/utils/token/get-token";
import FaturasClient from "./faturas-client";
import { RelatorioCooperativaMes, EmpresaLabelValue } from "../../../../../src/model/relatorio-vouchers";

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;
  const token = await getToken();
  const cooperativaId = params.cooperativa;

  // Buscar dados de faturas do mês atual
  let relatorio: RelatorioCooperativaMes | null = null;
  let empresas: EmpresaLabelValue[] = [];
  let error: string | null = null;

  try {
    // Buscar empresas em paralelo
    const [faturasResponse, empresasResponse] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/voucher/cooperativa/${cooperativaId}/mes`,
        {
          next: { tags: ["getFaturas"] },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/cooperativa/${cooperativaId}/label-value`,
        {
          next: { tags: ["getEmpresas"] },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
    ]);

    if (faturasResponse.ok) {
      relatorio = await faturasResponse.json();
    } else {
      error = `Erro ao buscar faturas: ${faturasResponse.status}`;
    }

    if (empresasResponse.ok) {
      empresas = await empresasResponse.json();
    } else {
      console.warn("Erro ao buscar empresas:", empresasResponse.status);
    }
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    error = "Erro ao conectar com o servidor";
  }

  return (
    <FaturasClient 
      cooperativaId={cooperativaId}
      relatorioInicial={relatorio}
      empresasDisponiveis={empresas}
      errorInicial={error}
      token={token}
    />
  );
};

export default App;