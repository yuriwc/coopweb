import { getToken } from "../../../../../src/utils/token/get-token";
import { FilaAdministrativa } from "../../../../../src/model/fila";
import FilasClient from "./filas-client";

async function fetchFilasAdministrativas(
  cooperativaId: string,
  token: string
): Promise<{ filas: FilaAdministrativa[]; disponivel: boolean }> {
  try {
    // A EF Macro documenta este endpoint com busca por raio (latitude/longitude
    // obrigatórios). Tentamos sem esses parâmetros para obter a lista completa da
    // cooperativa; se o backend exigir o filtro geográfico, a chamada falha e
    // degradamos para exibir só os dados em tempo real do Firebase (sem nome/
    // endereço) — ver PRD-T02, Achados para revisar.
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${cooperativaId}/fila`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { tags: ["filas-cooperativa"] },
      }
    );

    if (!response.ok) return { filas: [], disponivel: false };

    const filas: FilaAdministrativa[] = await response.json();
    return { filas, disponivel: true };
  } catch (error) {
    console.error("Erro ao buscar filas da cooperativa:", error);
    return { filas: [], disponivel: false };
  }
}

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;
  const cooperativaId = params.cooperativa;
  const token = await getToken();

  const { filas, disponivel } = await fetchFilasAdministrativas(cooperativaId, token);

  return (
    <FilasClient
      cooperativaId={cooperativaId}
      filasAdministrativas={filas}
      contagemDisponivel={disponivel}
      token={token}
    />
  );
};

export default App;
