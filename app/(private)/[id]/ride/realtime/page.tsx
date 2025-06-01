import { getToken } from "../../../../../src/utils/token/get-token";
import ViagemList from "./viagem-list";
import { ISelect } from "../../../../../src/interface/ISelect";

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const token = await getToken();

  // Buscar cooperativas no servidor
  let cooperativas: ISelect[] = [];

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${params.id}/cooperativas`,
      {
        next: { tags: ["getViagens"] },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      cooperativas = await response.json();
    }
  } catch (err) {
    console.error("Erro ao buscar cooperativas:", err);
  }

  return <ViagemList cooperativas={cooperativas} />;
};

export default App;
