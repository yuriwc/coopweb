import { cookies } from "next/headers";
import { getCompanyConfigsServer } from "@/src/services/company-config-server";
import CompanyConfigForm from "./company-config-form";

const App = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  // Buscar configurações iniciais no server
  const initialConfig = await getCompanyConfigsServer(params.id, token);

  return (
    <CompanyConfigForm
      empresaId={params.id}
      token={token}
      initialConfig={initialConfig}
    />
  );
};

export default App;
