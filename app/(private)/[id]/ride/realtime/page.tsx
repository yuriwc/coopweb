import { getToken } from "../../../../../src/utils/token/get-token";
import ViagemList from "./viagem-list";

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const token = await getToken();

  return <ViagemList empresaId={params.id} token={token} />;
};

export default App;
