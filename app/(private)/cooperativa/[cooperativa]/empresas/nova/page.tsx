import { getToken } from "../../../../../../src/utils/token/get-token";
import EmpresaForm from "./empresa-form";

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;
  const token = await getToken();

  return <EmpresaForm cooperativaId={params.cooperativa} token={token} />;
};

export default App;
