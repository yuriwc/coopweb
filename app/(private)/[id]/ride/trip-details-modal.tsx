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

export default function TripDetailsModal({ viagem, isOpen, onClose }: Props) {
  if (!viagem) return null;

  const formatarData = (dataString: string | null) => {
    return formatDateTimeBR(dataString);
  };

  const calcularTempo = (inicio: string | null, fim: string | null) => {
    if (!inicio || !fim) return "-";

    try {
      const dataInicio = parseISO(inicio);
      const dataFim = parseISO(fim);

      if (!isValid(dataInicio) || !isValid(dataFim)) return "-";

      const minutos = differenceInMinutes(dataFim, dataInicio);

      if (minutos < 1) return "< 1min";
      if (minutos < 60) return `${minutos}min`;

      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      return `${horas}h ${mins}min`;
    } catch {
      return "-";
    }
  };

  const formatarValor = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        backdrop: "bg-black/50",
        base: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl",
        header: "border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800",
        footer: "border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800",
        closeButton: "hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all duration-300",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="relative p-6">
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shadow-md">
                  <Icon
                    icon="solar:map-point-linear"
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Detalhes da Viagem
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Análise completa do percurso e timing
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="relative p-6">
              <div className="relative space-y-8">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Status Card */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-700">
                        <Icon icon="solar:shield-check-linear" className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                      </div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">Status</span>
                    </div>
                    <Chip
                      color={statusColorMap[viagem.status] || "default"}
                      size="md"
                      variant="flat"
                      className="capitalize shadow-sm"
                    >
                      {viagem.status}
                    </Chip>
                  </div>

                  {/* Valor Card */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center shadow-sm border border-emerald-200 dark:border-emerald-700">
                        <Icon icon="solar:wallet-money-linear" className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">Valor</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {formatarValor(viagem.preco)}
                    </div>
                  </div>

                  {/* Tempo de Atendimento Card */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center shadow-sm border border-orange-200 dark:border-orange-700">
                        <Icon icon="solar:clock-circle-bold" className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                      </div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">Atendimento</span>
                    </div>
                    <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                      {calcularTempo(viagem.horaSolicitacao, viagem.horaChegadaOrigem)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Solicitação → Origem
                    </div>
                  </div>

                  {/* Tempo de Espera Card */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center shadow-sm border border-purple-200 dark:border-purple-700">
                        <Icon icon="solar:hourglass-line-bold" className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                      </div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">Espera</span>
                    </div>
                    <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      {calcularTempo(viagem.horaChegadaOrigem, viagem.horaInicioPercurso)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Origem → Início
                    </div>
                  </div>
                </div>

                {/* Solid Divider */}
                <div className="h-px bg-gray-200 dark:bg-gray-700" />

                {/* Timeline Section */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-md" />

                  <div className="relative p-6 rounded-3xl transition-all duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shadow-sm">
                        <Icon
                          icon="solar:route-linear"
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Timeline da Viagem
                      </h3>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                      <div className="space-y-6">
                        {/* Solicitação */}
                        <div className="relative flex items-start gap-4">
                          <div className="relative z-10 w-12 h-12 bg-amber-50 dark:bg-amber-900 rounded-xl border border-amber-200 dark:border-amber-700 flex items-center justify-center shadow-md">
                            <Icon icon="solar:phone-calling-bold" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-base font-semibold text-gray-800 dark:text-white">Solicitação</h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {formatarData(viagem.horaSolicitacao)}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-xs">
                              Viagem solicitada por <span className="font-medium text-gray-800 dark:text-white">{viagem.solicitante}</span>
                            </p>
                          </div>
                        </div>

                        {/* Saída do Motorista */}
                        <div className="relative flex items-start gap-4">
                          <div className="relative z-10 w-12 h-12 bg-blue-50 dark:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-700 flex items-center justify-center shadow-md">
                            <Icon icon="solar:car-linear" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-base font-semibold text-gray-800 dark:text-white">Saída do Motorista</h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {formatarData(viagem.horaSaida)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-gray-600 dark:text-gray-300 text-xs">
                                Motorista iniciou deslocamento
                              </p>
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Icon icon="solar:clock-circle-linear" className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                  Tempo até saída: {calcularTempo(viagem.horaSolicitacao, viagem.horaSaida)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chegada na Origem */}
                        {viagem.horaChegadaOrigem && (
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-12 h-12 bg-green-50 dark:bg-green-900 rounded-xl border border-green-200 dark:border-green-700 flex items-center justify-center shadow-md">
                              <Icon icon="solar:map-point-wave-bold" className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-semibold text-gray-800 dark:text-white">Chegada na Origem</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {formatarData(viagem.horaChegadaOrigem)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-gray-600 dark:text-gray-300 text-xs">
                                  Motorista chegou ao ponto de origem
                                </p>
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                                  <Icon icon="solar:route-linear" className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                    Tempo de deslocamento: {calcularTempo(viagem.horaSaida, viagem.horaChegadaOrigem)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Início do Percurso */}
                        {viagem.horaInicioPercurso && (
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-12 h-12 bg-purple-50 dark:bg-purple-900 rounded-xl border border-purple-200 dark:border-purple-700 flex items-center justify-center shadow-md">
                              <Icon icon="solar:play-circle-bold" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-semibold text-gray-800 dark:text-white">Início do Percurso</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {formatarData(viagem.horaInicioPercurso)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-gray-600 dark:text-gray-300 text-xs">
                                  Passageiro embarcou, viagem iniciada
                                </p>
                                {viagem.horaChegadaOrigem && (
                                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full">
                                    <Icon icon="solar:hourglass-line-linear" className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                      Tempo de espera: {calcularTempo(viagem.horaChegadaOrigem, viagem.horaInicioPercurso)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Chegada no Destino */}
                        {viagem.horaChegada && (
                          <div className="relative flex items-start gap-4">
                            <div className="relative z-10 w-12 h-12 bg-emerald-50 dark:bg-emerald-900 rounded-xl border border-emerald-200 dark:border-emerald-700 flex items-center justify-center shadow-md">
                              <Icon icon="solar:flag-bold" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-base font-semibold text-gray-800 dark:text-white">Chegada no Destino</h4>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  {formatarData(viagem.horaChegada)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-gray-600 dark:text-gray-300 text-xs">
                                  Viagem finalizada com sucesso
                                </p>
                                {viagem.horaInicioPercurso && (
                                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                                    <Icon icon="solar:speedometer-linear" className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                      Tempo de viagem: {calcularTempo(viagem.horaInicioPercurso, viagem.horaChegada)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solid Divider */}
                <div className="h-px bg-gray-200 dark:bg-gray-700" />

                {/* Informações Adicionais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações do Percurso */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md" />

                    <div className="relative p-6 rounded-2xl transition-all duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Icon icon="solar:route-linear" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Percurso</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Origem</div>
                          <div className="text-sm text-gray-800 dark:text-white font-medium">{viagem.origem}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Destino</div>
                          <div className="text-sm text-gray-800 dark:text-white font-medium">{viagem.destino}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações dos Participantes */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md" />

                    <div className="relative p-6 rounded-2xl transition-all duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Icon icon="solar:users-group-rounded-linear" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Participantes</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Solicitante</div>
                          <div className="text-sm text-gray-800 dark:text-white font-medium">{viagem.solicitante}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Motorista</div>
                          <div className="text-sm text-gray-800 dark:text-white font-medium">{viagem.motorista}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Passageiros ({viagem.passageiros.length})
                          </div>
                          <div className="space-y-1">
                            {viagem.passageiros.map((passageiro, index) => (
                              <div key={index} className="text-sm text-gray-800 dark:text-white font-medium">
                                {passageiro}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="relative p-6">
              <div className="relative flex gap-3 w-full justify-end">
                <Button color="danger" variant="light" onPress={onClose}>
                  Fechar
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="solar:download-linear" className="w-4 h-4" />}
                >
                  Exportar
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
