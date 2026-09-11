import RealtimeMonitor from "@/src/components/RealtimeMonitor";
import { getNomeMotorista } from "@/src/services/monitoramento";

type Params = { cooperativa: string; motorista: string; cooperativaId: string };

// Na área da cooperativa o nome dela não aparece: quem está logado já é ela.
const Page = async (props: { params: Promise<Params> }) => {
  const { motorista, cooperativaId } = await props.params;
  const motoristaNome = await getNomeMotorista(cooperativaId, motorista);

  return (
    <RealtimeMonitor
      cooperativaId={cooperativaId}
      motoristaId={motorista}
      motoristaNome={motoristaNome}
    />
  );
};

export default Page;
