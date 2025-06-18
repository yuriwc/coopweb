import Link from "next/link";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

interface Passageiro {
  nome?: string;
  sobrenome?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  latitude?: number;
  longitude?: number;
}

interface Viagem {
  id: string;
  passageiros: Passageiro[];
  statusViagem: string;
  enderecoEmpresa: string;
  latitudeOrigem: number;
  longitudeOrigem: number;
  latitudeDestino: number;
  longitudeDestino: number;
  latitudeMotorista?: number;
  longitudeMotorista?: number;
}

// Tipo para as cores aceitas pelos componentes HeroUI
type ChipColorType =
  | "success"
  | "warning"
  | "danger"
  | "primary"
  | "default"
  | "secondary";

export default function ViagemCard({
  viagem,
  cooperativaId,
  motoristaId,
}: {
  viagem: Viagem;
  cooperativaId: string;
  motoristaId: string;
}) {
  // Concatena nomes dos passageiros
  const nomesPassageiros = viagem.passageiros
    .map((p) => (p.nome ? `${p.nome} ${p.sobrenome ?? ""}`.trim() : ""))
    .filter(Boolean);

  // Endereço destino do primeiro passageiro
  const p0 = viagem.passageiros[0] || {};
  const enderecoDestino = [p0.rua, p0.numero, p0.bairro, p0.cidade, p0.estado]
    .filter(Boolean)
    .join(", ");

  // Função para obter informações do status
  const getStatusInfo = () => {
    const status = viagem.statusViagem?.toLowerCase() || "";

    if (status === "Iniciada" || status === "Embarcado") {
      return {
        color: "success" as ChipColorType,
        icon: "solar:car-linear",
        label: "Em Andamento",
      };
    }

    if (status === "finalizada") {
      return {
        color: "primary" as ChipColorType,
        icon: "solar:check-circle-linear",
        label: "Finalizada",
      };
    }

    if (status === "pausada") {
      return {
        color: "warning" as ChipColorType,
        icon: "solar:pause-circle-linear",
        label: "Pausada",
      };
    }

    return {
      color: "default" as ChipColorType,
      icon: "solar:question-circle-linear",
      label: "Indefinido",
    };
  };

  const statusInfo = getStatusInfo();
  const temLocalizacao = viagem.latitudeMotorista && viagem.longitudeMotorista;
  console.log(viagem);

  return (
    <Card className="border border-transparent dark:border-default-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardBody className="p-6 space-y-5">
        {/* Header com ID da viagem e status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <Icon icon="solar:route-linear" width={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-default-700">
                Viagem #{viagem.id.slice(0, 8)}
              </h3>
              <p className="text-xs text-default-500">ID: {viagem.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip
              color={statusInfo.color}
              variant="flat"
              size="sm"
              startContent={<Icon icon={statusInfo.icon} width={14} />}
              classNames={{
                base: "h-7",
                content: "font-medium text-xs px-2",
              }}
            >
              {statusInfo.label}
            </Chip>
            {temLocalizacao && (
              <Chip
                color="success"
                variant="dot"
                size="sm"
                classNames={{
                  base: "h-6",
                  content: "font-medium text-xs px-2",
                }}
              >
                Online
              </Chip>
            )}
          </div>
        </div>

        {/* Informações principais */}
        <div className="space-y-4">
          {/* Passageiros */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-linear"
                  width={16}
                  className="text-default-500"
                />
                <span className="text-sm font-medium text-default-600">
                  Passageiros
                </span>
              </div>
              <Chip
                color="secondary"
                variant="flat"
                size="sm"
                classNames={{
                  base: "h-6 min-w-unit-6",
                  content: "font-bold text-xs px-1",
                }}
              >
                {nomesPassageiros.length}
              </Chip>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-6">
              {nomesPassageiros.length > 0 ? (
                nomesPassageiros.slice(0, 3).map((nome, index) => (
                  <Chip
                    key={index}
                    color="primary"
                    variant="flat"
                    size="sm"
                    classNames={{
                      base: "h-6",
                      content: "font-medium text-xs px-2",
                    }}
                  >
                    {nome}
                  </Chip>
                ))
              ) : (
                <span className="text-xs text-default-400">
                  Nenhum passageiro
                </span>
              )}
              {nomesPassageiros.length > 3 && (
                <Chip
                  color="default"
                  variant="flat"
                  size="sm"
                  classNames={{
                    base: "h-6",
                    content: "font-medium text-xs px-2",
                  }}
                >
                  +{nomesPassageiros.length - 3}
                </Chip>
              )}
            </div>
          </div>

          {/* Rota */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:routing-linear"
                width={16}
                className="text-primary-500"
              />
              <span className="text-sm font-medium text-default-600">Rota</span>
            </div>

            <div className="ml-6 space-y-3">
              {/* Origem */}
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-success-500"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-success-600 uppercase tracking-wide mb-1">
                    Origem
                  </p>
                  <p className="text-sm text-default-600 leading-relaxed truncate">
                    {viagem.enderecoEmpresa || "Endereço não informado"}
                  </p>
                </div>
              </div>

              {/* Linha conectora */}
              <div className="ml-3 h-4 w-px bg-gradient-to-b from-success-300 to-danger-300"></div>

              {/* Destino */}
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-100 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-danger-500"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-danger-600 uppercase tracking-wide mb-1">
                    Destino
                  </p>
                  <p className="text-sm text-default-600 leading-relaxed truncate">
                    {enderecoDestino || "Destino não informado"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>

      <CardFooter className="px-6 py-4 bg-default-50 dark:bg-default-100/50">
        <Button
          as={Link}
          href={`./realtime/${motoristaId}/1/${cooperativaId}`}
          color="primary"
          variant="solid"
          fullWidth
          startContent={<Icon icon="solar:eye-linear" width={16} />}
          className="font-medium"
        >
          Acompanhar Viagem
        </Button>
      </CardFooter>
    </Card>
  );
}
