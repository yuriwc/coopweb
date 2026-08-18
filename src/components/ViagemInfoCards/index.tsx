"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { cn } from "@heroui/react";
import { ViagemRealTime } from "@/src/model/viagem";

// Tipo para as cores aceitas pelos componentes HeroUI
type ChipColorType =
  | "success"
  | "warning"
  | "danger"
  | "primary"
  | "default"
  | "secondary";

// ChipColorType também dirige classes Tailwind geradas pelo plugin v2 do HeroUI
// (bg-accent-*, etc); só a cor passada para o componente Chip (v3) precisa do
// mapeamento primary->accent / secondary->default.
function toChipColor(
  color: ChipColorType
): "success" | "warning" | "danger" | "accent" | "default" {
  if (color === "primary") return "accent";
  if (color === "secondary") return "default";
  return color;
}

interface ViagemInfoCardsProps {
  viagem: ViagemRealTime;
}

// Deixa um status cru tipo "EM_PERCURSO" legível: "Em percurso".
function humanizeStatus(raw: string): string {
  const texto = raw.replace(/_/g, " ").trim().toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const ViagemInfoCards: React.FC<ViagemInfoCardsProps> = ({ viagem }) => {
  // Função para obter informações do status
  const getStatusInfo = () => {
    const statusBruto = viagem.statusViagem || "";
    // Normaliza "EM_PERCURSO", "Em Andamento", "ativa" etc. para o mesmo formato de comparação.
    const status = statusBruto.replace(/_/g, " ").trim().toLowerCase();

    if (
      status === "ativa" ||
      status === "em andamento" ||
      status === "em percurso" ||
      status === "iniciada" ||
      status === "embarcado"
    ) {
      return {
        color: "success" as ChipColorType,
        icon: "solar:car-linear",
        change: "Em movimento",
        changeType: "positive" as const,
      };
    }

    if (
      status === "aguardando passageiro" ||
      status === "aguardando" ||
      status === "pendente"
    ) {
      return {
        color: "warning" as ChipColorType,
        icon: "solar:hourglass-linear",
        change: "Aguardando passageiro",
        changeType: "neutral" as const,
      };
    }

    if (status === "finalizada" || status === "concluida" || status === "concluída") {
      return {
        color: "primary" as ChipColorType,
        icon: "solar:check-circle-linear",
        change: "Concluída",
        changeType: "neutral" as const,
      };
    }

    if (status === "pausada") {
      return {
        color: "warning" as ChipColorType,
        icon: "solar:pause-circle-linear",
        change: "Pausada",
        changeType: "neutral" as const,
      };
    }

    if (status === "cancelada") {
      return {
        color: "danger" as ChipColorType,
        icon: "solar:close-circle-linear",
        change: "Cancelada",
        changeType: "negative" as const,
      };
    }

    // Status não mapeado: mostra o valor real de forma legível em vez de "Indefinido".
    return {
      color: "default" as ChipColorType,
      icon: "solar:question-circle-linear",
      change: statusBruto ? humanizeStatus(statusBruto) : "Sem status",
      changeType: "neutral" as const,
    };
  };

  // Função para obter informações da velocidade
  const getVelocidadeInfo = () => {
    const velocidade = viagem.velocidadeKMH || viagem.velocidade || 0;

    if (velocidade < 5) {
      return {
        color: "warning" as ChipColorType,
        icon: "solar:speedometer-linear",
        status: "Parado",
        changeType: "neutral" as const,
      };
    }

    if (velocidade < 30) {
      return {
        color: "success" as ChipColorType,
        icon: "solar:speedometer-linear",
        status: "Moderada",
        changeType: "positive" as const,
      };
    }

    if (velocidade < 60) {
      return {
        color: "primary" as ChipColorType,
        icon: "solar:speedometer-linear",
        status: "Rápida",
        changeType: "positive" as const,
      };
    }

    return {
      color: "danger" as ChipColorType,
      icon: "solar:speedometer-linear",
      status: "Muito Rápida",
      changeType: "negative" as const,
    };
  };

  // Função para obter informações dos passageiros
  const getPassageirosInfo = () => {
    // Para provider mobicity, contar paradas + destino
    if (viagem.provider === "mobicity") {
      const names: string[] = [];
      let count = 0;

      // Adicionar passageiros das paradas
      if (viagem.paradas) {
        viagem.paradas.forEach(parada => {
          if (parada.nome) {
            names.push(parada.nome);
            count++;
          }
        });
      }

      // Adicionar passageiro do destino
      if (viagem.destination?.nome) {
        names.push(viagem.destination.nome);
        count++;
      }

      return { count, names };
    }

    // Para estrutura padrão
    if (!viagem.passageiros) return { count: 0, names: [] };

    const passageirosArray = Array.isArray(viagem.passageiros)
      ? viagem.passageiros
      : Object.values(viagem.passageiros);

    const names = (
      passageirosArray as Array<{
        nome?: string;
        sobrenome?: string;
      }>
    )
      .map((p) => (p.nome ? `${p.nome} ${p.sobrenome ?? ""}`.trim() : ""))
      .filter(Boolean);

    return {
      count: passageirosArray.length,
      names,
    };
  };

  const statusInfo = getStatusInfo();
  const velocidadeInfo = getVelocidadeInfo();
  const passageirosInfo = getPassageirosInfo();
  const velocidade = viagem.velocidadeKMH || viagem.velocidade || 0;
  const direcao = viagem.direcaoGraus || viagem.direcao || 0;

  // Função para obter informações da qualidade do GPS
  const getQualidadeGPSInfo = () => {
    const precisao = viagem.precisaoMetros || viagem.precisao || 0;

    if (precisao <= 5) {
      return {
        color: "success" as ChipColorType,
        status: "Excelente",
        changeType: "positive" as const,
      };
    }

    if (precisao <= 10) {
      return {
        color: "primary" as ChipColorType,
        status: "Muito Boa",
        changeType: "positive" as const,
      };
    }

    if (precisao <= 20) {
      return {
        color: "warning" as ChipColorType,
        status: "Boa",
        changeType: "neutral" as const,
      };
    }

    if (precisao <= 50) {
      return {
        color: "warning" as ChipColorType,
        status: "Moderada",
        changeType: "neutral" as const,
      };
    }

    return {
      color: "danger" as ChipColorType,
      status: "Baixa",
      changeType: "negative" as const,
    };
  };

  // Função para obter informações da última atualização
  const getUltimaAtualizacaoInfo = () => {
    const timestamp = viagem.timestampUltimaLocalizacao || viagem.timestamp;

    if (!timestamp) {
      return {
        color: "default" as ChipColorType,
        tempoFormatado: "Nunca",
        horaFormatada: "--:--",
        changeType: "neutral" as const,
      };
    }

    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    let tempoFormatado = "";
    let color: ChipColorType = "success";
    let changeType: "positive" | "negative" | "neutral" = "positive";

    if (diffSecs < 30) {
      tempoFormatado = "Agora";
      color = "success";
      changeType = "positive";
    } else if (diffSecs < 60) {
      tempoFormatado = `${diffSecs}s atrás`;
      color = "success";
      changeType = "positive";
    } else if (diffMins < 5) {
      tempoFormatado = `${diffMins}min atrás`;
      color = "warning";
      changeType = "neutral";
    } else if (diffMins < 15) {
      tempoFormatado = `${diffMins}min atrás`;
      color = "danger";
      changeType = "negative";
    } else {
      tempoFormatado = `+${Math.floor(diffMins / 60)}h`;
      color = "danger";
      changeType = "negative";
    }

    const horaFormatada = new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      color,
      tempoFormatado,
      horaFormatada,
      changeType,
    };
  };

  const qualidadeGPSInfo = getQualidadeGPSInfo();
  const ultimaAtualizacaoInfo = getUltimaAtualizacaoInfo();
  const precisao = viagem.precisaoMetros || viagem.precisao || 0;

  const data = [
    {
      title: "Status da Viagem",
      value: viagem.statusViagem?.toUpperCase() || "INDEFINIDO",
      change: statusInfo.change,
      changeType: statusInfo.changeType,
      iconName: statusInfo.icon,
      color: statusInfo.color,
    },
    {
      title: "Passageiros",
      value: passageirosInfo.count.toString(),
      change: passageirosInfo.count > 0 ? "Ativos" : "Nenhum",
      changeType: passageirosInfo.count > 0 ? "positive" : ("neutral" as const),
      iconName: "solar:users-group-rounded-linear",
      color: (passageirosInfo.count > 0
        ? "success"
        : "default") as ChipColorType,
      passageiros: passageirosInfo.names,
    },
    {
      title: "Velocidade",
      value: `${velocidade.toFixed(1)} km/h`,
      change: velocidadeInfo.status,
      changeType: velocidadeInfo.changeType,
      iconName: velocidadeInfo.icon,
      color: velocidadeInfo.color,
    },
    {
      title: "Direção",
      value: `${direcao.toFixed(0)}°`,
      change: getDirecaoCardinal(direcao),
      changeType: "neutral" as const,
      iconName: "solar:compass-linear",
      color: "secondary" as ChipColorType,
    },
    {
      title: "Qualidade GPS",
      value: `±${precisao.toFixed(0)}m`,
      change: qualidadeGPSInfo.status,
      changeType: qualidadeGPSInfo.changeType,
      iconName: "solar:gps-linear",
      color: qualidadeGPSInfo.color,
    },
    {
      title: "Última Atualização",
      value: ultimaAtualizacaoInfo.horaFormatada,
      change: ultimaAtualizacaoInfo.tempoFormatado,
      changeType: ultimaAtualizacaoInfo.changeType,
      iconName: "solar:clock-circle-linear",
      color: ultimaAtualizacaoInfo.color,
    },
  ];

  // Helper functions to extract coordinates based on provider
  const getDestinoCoordinates = (viagem: ViagemRealTime): [number, number] | null => {
    if (viagem.provider === "mobicity" && viagem.destination) {
      return [viagem.destination.lat, viagem.destination.lng];
    }
    if (viagem.latitudeDestino !== undefined && viagem.longitudeDestino !== undefined) {
      return [viagem.latitudeDestino, viagem.longitudeDestino];
    }
    return null;
  };

  // Funções para calcular estimativas da viagem
  const calcularDistancia = () => {
    if (!viagem.latitudeMotorista || !viagem.longitudeMotorista) return 0;

    const destinoCoords = getDestinoCoordinates(viagem);
    if (!destinoCoords) return 0;

    const lat1 = viagem.latitudeMotorista;
    const lon1 = viagem.longitudeMotorista;
    const lat2 = destinoCoords[0];
    const lon2 = destinoCoords[1];

    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  };

  const calcularTempoEstimado = () => {
    const velocidade = viagem.velocidadeKMH || viagem.velocidade || 0;
    if (velocidade === 0) return "N/A";

    const distanciaKm = calcularDistancia();
    const tempoHoras = distanciaKm / velocidade;
    const tempoMinutos = Math.round(tempoHoras * 60);

    if (tempoMinutos < 60) {
      return `${tempoMinutos}min`;
    }
    return `${Math.floor(tempoMinutos / 60)}h ${tempoMinutos % 60}min`;
  };

  const calcularProgresso = () => {
    const distanciaAtual = calcularDistancia();
    // Estimativa: assumindo viagem de até 50km como base
    const progressoPercentual = Math.max(
      10,
      Math.min(90, 100 - (distanciaAtual / 50) * 100)
    );
    return Math.round(progressoPercentual);
  };

  const distancia = calcularDistancia();
  const tempoEstimado = calcularTempoEstimado();
  const progresso = calcularProgresso();

  const estimativasData = [
    {
      title: "Distância ao Destino",
      value:
        distancia < 1
          ? `${(distancia * 1000).toFixed(0)}m`
          : `${distancia.toFixed(2)}km`,
      change:
        distancia < 0.5 ? "Chegando" : distancia < 5 ? "Próximo" : "Distante",
      changeType:
        distancia < 1 ? "positive" : distancia < 5 ? "neutral" : "negative",
      iconName: "solar:map-point-linear",
      color: (distancia < 1
        ? "success"
        : distancia < 5
        ? "warning"
        : "danger") as ChipColorType,
      progresso: Math.min(100, 100 - (distancia / 50) * 100),
    },
    {
      title: "Tempo Estimado",
      value: tempoEstimado,
      change: "Chegada",
      changeType: "neutral" as const,
      iconName: "solar:clock-circle-linear",
      color: "primary" as ChipColorType,
      progresso: tempoEstimado !== "N/A" ? 75 : 0,
    },
    {
      title: "Progresso da Viagem",
      value: `${progresso}%`,
      change:
        progresso > 70 ? "Quase lá" : progresso > 40 ? "Metade" : "Iniciando",
      changeType: progresso > 70 ? "positive" : "neutral",
      iconName: "solar:chart-square-linear",
      color: (progresso > 70
        ? "success"
        : progresso > 40
        ? "primary"
        : "warning") as ChipColorType,
      progresso: progresso,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Grid principal com 6 cards - máximo 2 colunas para evitar sobreposição */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {data.map((item, index) => (
          <Card
            key={index}
            className="border border-transparent dark:border-default-100 relative overflow-hidden"
          >
            <div className="p-2 relative z-10">
              {/* Linha única: ícone + título/valor + indicador */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
                    {
                      "bg-success-soft text-success":
                        item.color === "success",
                      "bg-warning-soft text-warning":
                        item.color === "warning",
                      "bg-danger-soft text-danger": item.color === "danger",
                      "bg-accent-soft text-accent":
                        item.color === "primary",
                      "bg-default text-accent":
                        item.color === "secondary",
                      "bg-default-100 text-default-600":
                        item.color === "default",
                    }
                  )}
                >
                  <Icon icon={item.iconName} width={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-[11px] font-medium text-default-500 truncate leading-tight">
                    {item.title}
                  </dt>
                  <dd className="text-sm font-semibold text-default-700 leading-tight truncate">
                    {item.value}
                  </dd>
                </div>
                <Chip
                  className="h-5 rounded-full shrink-0"
                  color={toChipColor(item.color)}
                  size="sm"
                  variant="tertiary"
                >
                  {item.changeType === "positive" ? (
                    <Icon height={8} icon="solar:arrow-up-linear" width={8} />
                  ) : item.changeType === "negative" ? (
                    <Icon height={8} icon="solar:arrow-down-linear" width={8} />
                  ) : (
                    <Icon height={8} icon="solar:minus-linear" width={8} />
                  )}
                  {item.change}
                </Chip>
              </div>

              {/* Lista de passageiros se existir */}
              {item.passageiros && item.passageiros.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 ml-9">
                  {item.passageiros
                    .slice(0, 2)
                    .map((nome, passengerIndex) => (
                      <Chip
                        key={passengerIndex}
                        className="h-5 rounded-full"
                        color="accent"
                        size="sm"
                        variant="tertiary"
                      >
                        <Icon height={8} icon="solar:user-circle-linear" width={8} />
                        {nome.split(" ")[0]}
                      </Chip>
                    ))}
                  {item.passageiros.length > 2 && (
                    <Chip
                      className="h-5 rounded-full"
                      color="default"
                      size="sm"
                      variant="tertiary"
                    >
                      +{item.passageiros.length - 2}
                    </Chip>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Cards de Estimativas - apenas se houver localização do motorista e destino */}
      {viagem.latitudeMotorista && viagem.longitudeMotorista && getDestinoCoordinates(viagem) && (
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-muted flex items-center gap-2">
              <Icon icon="solar:chart-linear" className="w-4 h-4" />
              Estimativas da Viagem
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {estimativasData.map((item, index) => (
              <Card
                key={index}
                className="border border-transparent dark:border-default-100 hover:shadow-md transition-shadow duration-200 relative overflow-hidden"
              >
                {/* Background baseado no progresso */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-10 transition-all duration-1000 ease-out",
                    {
                      "bg-success": item.color === "success",
                      "bg-warning": item.color === "warning",
                      "bg-danger": item.color === "danger",
                      "bg-accent": item.color === "primary",
                    }
                  )}
                  style={{ width: `${item.progresso}%` }}
                />

                <div className="p-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
                        {
                          "bg-success-soft text-success":
                            item.color === "success",
                          "bg-warning-soft text-warning":
                            item.color === "warning",
                          "bg-danger-soft text-danger":
                            item.color === "danger",
                          "bg-accent-soft text-accent":
                            item.color === "primary",
                        }
                      )}
                    >
                      <Icon icon={item.iconName} width={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="text-[11px] font-medium text-default-500 truncate leading-tight">
                        {item.title}
                      </dt>
                      <dd className="text-sm font-semibold text-default-700 leading-tight truncate">
                        {item.value}
                      </dd>
                    </div>
                  </div>

                  <div className="flex justify-end mt-1">
                    <Chip
                      className="h-5 rounded-full"
                      color={toChipColor(item.color)}
                      size="sm"
                      variant="tertiary"
                    >
                      {item.changeType === "positive" ? (
                        <Icon height={8} icon="solar:arrow-up-linear" width={8} />
                      ) : item.changeType === "negative" ? (
                        <Icon height={8} icon="solar:arrow-down-linear" width={8} />
                      ) : (
                        <Icon height={8} icon="solar:minus-linear" width={8} />
                      )}
                      {item.change}
                    </Chip>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Função auxiliar para converter graus em direção cardinal
function getDirecaoCardinal(graus: number): string {
  const directions = [
    "Norte",
    "Nordeste",
    "Leste",
    "Sudeste",
    "Sul",
    "Sudoeste",
    "Oeste",
    "Noroeste",
  ];

  const index = Math.round(graus / 45) % 8;
  return directions[index];
}

export default ViagemInfoCards;
