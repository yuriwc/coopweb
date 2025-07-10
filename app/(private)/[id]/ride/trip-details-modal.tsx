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
import { format, parseISO, isValid, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

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
    if (!dataString) return "-";

    try {
      const data = parseISO(dataString);
      if (!isValid(data)) return "-";
      return format(data, "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
    } catch {
      return "-";
    }
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
        backdrop: "bg-gradient-to-br from-white/60 via-blue-50/40 to-gray-50/50 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40 backdrop-blur-[2px]",
        base: "bg-white/[0.85] dark:bg-white/[0.05] backdrop-blur-xl border border-blue-200/20 dark:border-white/10 shadow-2xl shadow-gray-500/10 dark:shadow-black/20",
        header: "border-b-[1px] border-blue-200/20 dark:border-white/10 bg-white/[0.90] dark:bg-white/[0.02] backdrop-blur-xl",
        footer: "border-t-[1px] border-blue-200/20 dark:border-white/10 bg-white/[0.90] dark:bg-white/[0.02] backdrop-blur-xl",
        closeButton: "hover:bg-blue-100/20 dark:hover:bg-white/5 active:bg-blue-200/30 dark:active:bg-white/10 transition-all duration-300",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="relative p-6">
              {/* Liquid Glass Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.15] via-blue-50/[0.10] to-gray-50/[0.12] dark:from-blue-500/[0.03] dark:via-purple-500/[0.03] dark:to-emerald-500/[0.03]" />
              
              {/* Crystalline Border Effect */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-300/50 dark:via-white/30 to-transparent" />
              
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-lg shadow-blue-400/20">
                  <Icon 
                    icon="solar:map-point-linear" 
                    className="w-6 h-6 text-blue-600 dark:text-blue-400" 
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
                    Detalhes da Viagem
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Análise completa do percurso e timing
                  </p>
                </div>
              </div>
            </ModalHeader>
            
            <ModalBody className="relative p-6">
              {/* Dynamic Background Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/10 dark:bg-blue-400/5 rounded-full blur-xl animate-pulse" />
                <div className="absolute top-32 right-20 w-16 h-16 bg-cyan-200/10 dark:bg-purple-400/5 rounded-full blur-xl animate-pulse delay-700" />
                <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-sky-200/10 dark:bg-emerald-400/5 rounded-full blur-xl animate-pulse delay-1000" />
              </div>

              <div className="relative space-y-8">
                {/* Enhanced Liquid Glass Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Status Card */}
                  <div className="relative group cursor-pointer">
                    {/* Multiple Glass Layers */}
                    <div className="absolute inset-0 bg-white/[0.25] dark:bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-blue-200/40 dark:border-white/15 shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.12] via-cyan-400/[0.08] to-sky-400/[0.06] dark:from-blue-500/[0.06] dark:via-cyan-500/[0.04] dark:to-sky-500/[0.03] rounded-2xl" />
                    
                    {/* Glass Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent dark:from-white/20 dark:via-white/5 dark:to-transparent rounded-2xl opacity-60" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent dark:from-white/10 dark:to-transparent rounded-t-2xl" />
                    
                    {/* Crystalline Border Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-300/50 via-transparent to-cyan-300/30 dark:from-blue-400/30 dark:via-transparent dark:to-cyan-400/20 p-[1px] group-hover:from-blue-400/70 group-hover:to-cyan-400/50 transition-all duration-500">
                      <div className="h-full w-full rounded-2xl bg-transparent" />
                    </div>
                    
                    <div className="relative p-4 rounded-2xl transition-all duration-700 group-hover:backdrop-blur-2xl group-hover:transform group-hover:scale-[1.02]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-200/60 to-cyan-200/40 dark:from-blue-900/40 dark:to-cyan-900/30 rounded-full flex items-center justify-center shadow-lg shadow-blue-400/30 backdrop-blur-sm border border-blue-300/30 dark:border-blue-600/30">
                          <Icon icon="solar:shield-check-linear" className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                        </div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">Status</span>
                      </div>
                      <Chip
                        color={statusColorMap[viagem.status] || "default"}
                        size="md"
                        variant="flat"
                        className="capitalize shadow-lg"
                      >
                        {viagem.status}
                      </Chip>
                    </div>
                  </div>

                  {/* Valor Card */}
                  <div className="relative group cursor-pointer">
                    {/* Multiple Glass Layers */}
                    <div className="absolute inset-0 bg-white/[0.25] dark:bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-emerald-200/40 dark:border-white/15 shadow-2xl shadow-emerald-500/20 dark:shadow-emerald-500/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/[0.12] via-teal-400/[0.08] to-cyan-400/[0.06] dark:from-emerald-500/[0.06] dark:via-teal-500/[0.04] dark:to-cyan-500/[0.03] rounded-2xl" />
                    
                    {/* Glass Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent dark:from-white/20 dark:via-white/5 dark:to-transparent rounded-2xl opacity-60" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent dark:from-white/10 dark:to-transparent rounded-t-2xl" />
                    
                    {/* Crystalline Border Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-300/50 via-transparent to-teal-300/30 dark:from-emerald-400/30 dark:via-transparent dark:to-teal-400/20 p-[1px] group-hover:from-emerald-400/70 group-hover:to-teal-400/50 transition-all duration-500">
                      <div className="h-full w-full rounded-2xl bg-transparent" />
                    </div>
                    
                    <div className="relative p-4 rounded-2xl transition-all duration-700 group-hover:backdrop-blur-2xl group-hover:transform group-hover:scale-[1.02]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-200/60 to-teal-200/40 dark:from-emerald-900/40 dark:to-teal-900/30 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/30 backdrop-blur-sm border border-emerald-300/30 dark:border-emerald-600/30">
                          <Icon icon="solar:wallet-money-linear" className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                        </div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">Valor</span>
                      </div>
                      <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 drop-shadow-lg">
                        {formatarValor(viagem.preco)}
                      </div>
                    </div>
                  </div>

                  {/* Tempo de Atendimento Card */}
                  <div className="relative group cursor-pointer">
                    {/* Multiple Glass Layers */}
                    <div className="absolute inset-0 bg-white/[0.25] dark:bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-orange-200/40 dark:border-white/15 shadow-2xl shadow-orange-500/20 dark:shadow-orange-500/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/[0.12] via-amber-400/[0.08] to-red-400/[0.06] dark:from-orange-500/[0.06] dark:via-amber-500/[0.04] dark:to-red-500/[0.03] rounded-2xl" />
                    
                    {/* Glass Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent dark:from-white/20 dark:via-white/5 dark:to-transparent rounded-2xl opacity-60" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent dark:from-white/10 dark:to-transparent rounded-t-2xl" />
                    
                    {/* Crystalline Border Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-300/50 via-transparent to-amber-300/30 dark:from-orange-400/30 dark:via-transparent dark:to-amber-400/20 p-[1px] group-hover:from-orange-400/70 group-hover:to-amber-400/50 transition-all duration-500">
                      <div className="h-full w-full rounded-2xl bg-transparent" />
                    </div>
                    
                    <div className="relative p-4 rounded-2xl transition-all duration-700 group-hover:backdrop-blur-2xl group-hover:transform group-hover:scale-[1.02]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-200/60 to-amber-200/40 dark:from-orange-900/40 dark:to-amber-900/30 rounded-full flex items-center justify-center shadow-lg shadow-orange-400/30 backdrop-blur-sm border border-orange-300/30 dark:border-orange-600/30">
                          <Icon icon="solar:clock-circle-bold" className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                        </div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">Atendimento</span>
                      </div>
                      <div className="text-xl font-bold text-orange-700 dark:text-orange-300 drop-shadow-lg">
                        {calcularTempo(viagem.horaSolicitacao, viagem.horaChegadaOrigem)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Solicitação → Origem
                      </div>
                    </div>
                  </div>

                  {/* Tempo de Espera Card */}
                  <div className="relative group cursor-pointer">
                    {/* Multiple Glass Layers */}
                    <div className="absolute inset-0 bg-white/[0.25] dark:bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-purple-200/40 dark:border-white/15 shadow-2xl shadow-purple-500/20 dark:shadow-purple-500/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/[0.12] via-violet-400/[0.08] to-pink-400/[0.06] dark:from-purple-500/[0.06] dark:via-violet-500/[0.04] dark:to-pink-500/[0.03] rounded-2xl" />
                    
                    {/* Glass Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent dark:from-white/20 dark:via-white/5 dark:to-transparent rounded-2xl opacity-60" />
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent dark:from-white/10 dark:to-transparent rounded-t-2xl" />
                    
                    {/* Crystalline Border Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-300/50 via-transparent to-violet-300/30 dark:from-purple-400/30 dark:via-transparent dark:to-violet-400/20 p-[1px] group-hover:from-purple-400/70 group-hover:to-violet-400/50 transition-all duration-500">
                      <div className="h-full w-full rounded-2xl bg-transparent" />
                    </div>
                    
                    <div className="relative p-4 rounded-2xl transition-all duration-700 group-hover:backdrop-blur-2xl group-hover:transform group-hover:scale-[1.02]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-200/60 to-violet-200/40 dark:from-purple-900/40 dark:to-violet-900/30 rounded-full flex items-center justify-center shadow-lg shadow-purple-400/30 backdrop-blur-sm border border-purple-300/30 dark:border-purple-600/30">
                          <Icon icon="solar:hourglass-line-bold" className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                        </div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">Espera</span>
                      </div>
                      <div className="text-xl font-bold text-purple-700 dark:text-purple-300 drop-shadow-lg">
                        {calcularTempo(viagem.horaChegadaOrigem, viagem.horaInicioPercurso)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Origem → Início
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crystalline Divider */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-300/30 dark:via-white/10 to-transparent" />

                {/* Timeline Section */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-blue-200/30 dark:border-white/10 shadow-xl shadow-blue-400/15 dark:shadow-blue-500/5" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.06] via-cyan-400/[0.04] to-sky-400/[0.06] dark:from-blue-500/[0.02] dark:via-cyan-500/[0.02] dark:to-sky-500/[0.02] rounded-3xl" />

                  {/* Crystalline Highlight */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-300/50 dark:via-white/30 to-transparent" />

                  <div className="relative p-6 rounded-3xl transition-all duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-lg shadow-blue-400/20">
                        <Icon
                          icon="solar:route-linear"
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
                        Timeline da Viagem
                      </h3>
                    </div>

                    {/* Enhanced Timeline */}
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/60 via-cyan-400/60 to-emerald-400/60 dark:from-blue-500/40 dark:via-cyan-500/40 dark:to-emerald-500/40"></div>
                      
                      <div className="space-y-6">
                        {/* Solicitação */}
                        <div className="relative flex items-start gap-4">
                          <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-400/20 dark:from-amber-500/10 dark:to-orange-500/10 rounded-xl border border-amber-300/40 dark:border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-400/20">
                            <Icon icon="solar:phone-calling-bold" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 bg-white/[0.12] dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-amber-200/30 dark:border-white/10 p-4 shadow-lg shadow-amber-400/5">
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
                          <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-xl border border-blue-300/40 dark:border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-400/20">
                            <Icon icon="solar:car-linear" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 bg-white/[0.12] dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-blue-200/30 dark:border-white/10 p-4 shadow-lg shadow-blue-400/5">
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
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100/50 dark:bg-blue-900/30 rounded-full">
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
                            <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-xl border border-green-300/40 dark:border-green-500/20 flex items-center justify-center shadow-lg shadow-green-400/20">
                              <Icon icon="solar:map-point-wave-bold" className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 bg-white/[0.12] dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-green-200/30 dark:border-white/10 p-4 shadow-lg shadow-green-400/5">
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
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100/50 dark:bg-green-900/30 rounded-full">
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
                            <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-xl border border-purple-300/40 dark:border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-400/20">
                              <Icon icon="solar:play-circle-bold" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 bg-white/[0.12] dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-purple-200/30 dark:border-white/10 p-4 shadow-lg shadow-purple-400/5">
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
                                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100/50 dark:bg-purple-900/30 rounded-full">
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
                            <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl border border-emerald-300/40 dark:border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-400/20">
                              <Icon icon="solar:flag-bold" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 bg-white/[0.12] dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-emerald-200/30 dark:border-white/10 p-4 shadow-lg shadow-emerald-400/5">
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
                                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-full">
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

                {/* Crystalline Divider */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-300/30 dark:via-white/10 to-transparent" />

                {/* Informações Adicionais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações do Percurso */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-white/10 shadow-lg shadow-blue-400/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.05] to-cyan-400/[0.05] dark:from-blue-500/[0.02] dark:to-cyan-500/[0.02] rounded-2xl" />
                    
                    <div className="relative p-6 rounded-2xl transition-all duration-500 group-hover:backdrop-blur-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
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
                    <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-white/10 shadow-lg shadow-blue-400/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.05] to-cyan-400/[0.05] dark:from-blue-500/[0.02] dark:to-cyan-500/[0.02] rounded-2xl" />
                    
                    <div className="relative p-6 rounded-2xl transition-all duration-500 group-hover:backdrop-blur-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
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
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.10] via-blue-50/[0.08] to-gray-50/[0.10] dark:from-blue-500/[0.02] dark:via-purple-500/[0.02] dark:to-emerald-500/[0.02]" />
              
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