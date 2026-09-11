import ViagensRealtimeList from "@/src/components/ViagensRealtimeList";

// Na área da cooperativa o id vem da rota: sem seletor.
const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const { cooperativa } = await props.params;

  return (
    <ViagensRealtimeList
      basePath={`/cooperativa/${cooperativa}/ride/realtime`}
      cooperativaId={cooperativa}
    />
  );
};

export default App;
