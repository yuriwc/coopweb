import RealtimeMonitor from "@/src/components/RealtimeMonitor";
import { getNomeCooperativa, getNomeMotorista } from "@/src/services/monitoramento";

type Params = { id: string; motorista: string; viagem: string; cooperativa: string };

const Page = async (props: { params: Promise<Params> }) => {
  const { id, motorista, cooperativa } = await props.params;

  const [motoristaNome, cooperativaNome] = await Promise.all([
    getNomeMotorista(cooperativa, motorista),
    getNomeCooperativa(id, cooperativa),
  ]);

  return (
    <RealtimeMonitor
      cooperativaId={cooperativa}
      motoristaId={motorista}
      motoristaNome={motoristaNome}
      cooperativaNome={cooperativaNome}
    />
  );
};

export default Page;
