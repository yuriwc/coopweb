import { Viagem } from "@/src/model/viagem";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TravelCardProps {
  viagem: Viagem;
}

export function TravelCard({ viagem }: TravelCardProps) {
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return format(data, "dd MMM yyyy, HH:mm", { locale: ptBR });
  };

  const calcularDuracao = () => {
    const inicio = new Date(viagem.dataInicio);
    const fim = new Date(viagem.dataFim);
    const diff = Math.abs(fim.getTime() - inicio.getTime());
    const minutos = Math.floor(diff / (1000 * 60));
    return `${minutos} min`;
  };

  const formatarValor = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl">
      <CardBody className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {viagem.passageiros.join(", ")}
            </h3>
            <p className="text-sm mt-1">Motorista: {viagem.motorista}</p>
          </div>
          <div className="text-right space-y-1">
            <Chip
              size="sm"
              variant="flat"
              color={viagem.status === "Finalizada" ? "success" : "warning"}
              className="uppercase"
            >
              {viagem.status}
            </Chip>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              {formatarValor(viagem.preco)}
            </p>
          </div>
        </div>

        <Divider className="my-3 bg-neutral-200 dark:bg-neutral-800" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase mb-1">Origem</p>
            <p className="text-sm">{viagem.origem}</p>
          </div>
          <div>
            <p className="text-xs uppercase mb-1">Destino</p>
            <p className="text-sm">{viagem.destino}</p>
          </div>
        </div>
      </CardBody>

      <Divider className="bg-neutral-200 dark:bg-neutral-800" />

      <CardFooter className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm">
        <div>
          <p className="text-xs uppercase">Início</p>
          <p>{formatarData(viagem.dataInicio)}</p>
        </div>
        <div>
          <p className="text-xs uppercase">Duração</p>
          <p className="font-medium">{calcularDuracao()}</p>
        </div>
        <div>
          <p className="text-xs uppercase">Término</p>
          <p>{formatarData(viagem.dataFim)}</p>
        </div>
        <div>
          <p className="text-xs uppercase">Valor</p>
          <p className="font-semibold text-green-600 dark:text-green-400">
            {formatarValor(viagem.preco)}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
