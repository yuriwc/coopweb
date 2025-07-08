import ViagemList from "./viagem-list";

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;

  // Para cooperativas, usamos diretamente o ID da cooperativa
  // Não precisamos buscar lista de cooperativas como no layout de empresa
  const cooperativaId = params.cooperativa;

  return <ViagemList cooperativaId={cooperativaId} />;
};

export default App;