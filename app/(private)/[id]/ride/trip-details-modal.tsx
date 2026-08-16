"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Viagem } from "@/src/model/viagem";
import { parseISO, isValid, differenceInMinutes } from "date-fns";
import { formatDateTimeBR } from "@/src/utils/date";

interface Props {
  viagem: Viagem | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColorMap: Record<string, "success" | "primary" | "danger" | "warning" | "default"> = {
  Finalizada: "success",
  "Em Andamento": "primary",
  Iniciada: "primary",
  Cancelada: "danger",
  Agendada: "warning",
};

interface TimelineStep {
  key: string;
  label: string;
  icon: string;
  time: string | null;
}

export default function TripDetailsModal({ viagem, isOpen, onClose }: Props) {
  if (!viagem) return null;

  const formatarData = (dataString: string | null) => formatDateTimeBR(dataString);

  const calcularTempo = (inicio: string | null, fim: string | null) => {
    if (!inicio || !fim) return null;

    try {
      const dataInicio = parseISO(inicio);
      const dataFim = parseISO(fim);

      if (!isValid(dataInicio) || !isValid(dataFim)) return null;

      const minutos = differenceInMinutes(dataFim, dataInicio);

      if (minutos < 1) return "< 1min";
      if (minutos < 60) return `${minutos}min`;

      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      return `${horas}h ${mins}min`;
    } catch {
      return null;
    }
  };

  const formatarValor = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const timelineSteps: TimelineStep[] = [
    { key: "solicitacao", label: "Solicitação", icon: "solar:phone-calling-linear", time: viagem.horaSolicitacao },
    { key: "saida", label: "Saída do Motorista", icon: "solar:car-linear", time: viagem.horaSaida },
    { key: "chegadaOrigem", label: "Chegada na Origem", icon: "solar:map-point-linear", time: viagem.horaChegadaOrigem },
    { key: "inicioPercurso", label: "Início do Percurso", icon: "solar:play-circle-linear", time: viagem.horaInicioPercurso },
    { key: "chegadaDestino", label: "Chegada no Destino", icon: "solar:flag-linear", time: viagem.horaChegada },
  ].filter((step) => Boolean(step.time));

  const stats = [
    { label: "Status", value: <Chip color={statusColorMap[viagem.status] || "default"} size="sm" variant="flat" className="capitalize">{viagem.status}</Chip> },
    { label: "Valor", value: formatarValor(viagem.preco) },
    { label: "Atendimento", value: calcularTempo(viagem.horaSolicitacao, viagem.horaChegadaOrigem) ?? "—" },
    { label: "Espera", value: calcularTempo(viagem.horaChegadaOrigem, viagem.horaInicioPercurso) ?? "—" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Detalhes da Viagem
            </ModalHeader>

            <ModalBody className="gap-6 pb-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700" />

              {/* Timeline horizontal */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  Timeline da Viagem
                </h3>
                <div className="overflow-x-auto">
                  <div className="flex items-start min-w-full px-1">
                    {timelineSteps.map((step, index) => (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center text-center w-24 shrink-0">
                          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0">
                            <Icon icon={step.icon} className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white mt-2">
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatarData(step.time)}
                          </p>
                        </div>

                        {index < timelineSteps.length - 1 && (
                          <div className="flex flex-col items-center justify-center pt-[18px] flex-1 min-w-8">
                            <div className="w-full h-px bg-gray-300 dark:bg-gray-600" />
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 whitespace-nowrap">
                              {calcularTempo(step.time, timelineSteps[index + 1].time) ?? ""}
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700" />

              {/* Percurso e participantes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Percurso</h3>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Origem</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viagem.origem}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Destino</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viagem.destino}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Participantes</h3>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Solicitante</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viagem.solicitante}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Motorista</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viagem.motorista}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Passageiros ({viagem.passageiros.length})
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {viagem.passageiros.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Fechar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
