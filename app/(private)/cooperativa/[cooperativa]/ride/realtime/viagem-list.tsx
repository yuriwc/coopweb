"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../../../../../scripts/firebase-config";
import ViagemCard from "../../../../../../src/components/ViagemCard";
import { useRouter } from "next/navigation";
import { Passageiro, ViagemRealTime } from "../../../../../../src/model/viagem";
import { Button } from "@heroui/button";

interface Props {
  cooperativaId: string;
}

export default function ViagemList({ cooperativaId }: Props) {
  const [viagens, setViagens] = useState<ViagemRealTime[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!cooperativaId) return;
    
    const motoristasRef = ref(database, `${cooperativaId}/motorista`);
    const unsubscribe = onValue(motoristasRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const viagensArray: ViagemRealTime[] = [];

      type DadosDaViagem = {
        idViagem: string;
        statusViagem?: string;
        enderecoEmpresa?: string;
        latitudeOrigem?: number;
        longitudeOrigem?: number;
        latitudeDestino?: number;
        longitudeDestino?: number;
        latitudeMotorista?: number;
        longitudeMotorista?: number;
        passageiros?: Record<string, Passageiro> | Passageiro[];
      };
      type MotoristaValue = {
        dadosDaViagem?: DadosDaViagem;
      };

      Object.entries(data as Record<string, MotoristaValue>).forEach(
        ([motoristaId, motoristaValue]) => {
          const dados = motoristaValue.dadosDaViagem;
          if (!dados) return;

          let passageiros: Passageiro[] = [];
          if (dados.passageiros) {
            if (Array.isArray(dados.passageiros)) {
              passageiros = dados.passageiros;
            } else {
              passageiros = Object.values(dados.passageiros);
            }
          }

          viagensArray.push({
            id: dados.idViagem,
            motoristaId, // adiciona o id do motorista
            passageiros,
            statusViagem: dados.statusViagem ?? "",
            enderecoEmpresa: dados.enderecoEmpresa ?? "",
            latitudeOrigem: dados.latitudeOrigem ?? 0,
            longitudeOrigem: dados.longitudeOrigem ?? 0,
            latitudeDestino: dados.latitudeDestino ?? 0,
            longitudeDestino: dados.longitudeDestino ?? 0,
            latitudeMotorista: dados.latitudeMotorista,
            longitudeMotorista: dados.longitudeMotorista,
          });
        }
      );

      setViagens(viagensArray);
    });

    return () => unsubscribe();
  }, [cooperativaId]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-blue-50/50 dark:bg-gray-900">
      {/* Liquid Glass Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100/40 via-cyan-50/30 to-sky-100/40 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40" />
      <div className="fixed inset-0 backdrop-blur-[2px]" />

      {/* Dynamic Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-32 right-20 w-24 h-24 bg-cyan-200/20 dark:bg-purple-400/10 rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-sky-200/20 dark:bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-300/15 dark:bg-blue-500/8 rounded-full blur-2xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-cyan-300/15 dark:bg-cyan-500/8 rounded-full blur-2xl animate-pulse delay-1200" />
      </div>

      <div className="relative z-10 container mx-auto p-4 sm:p-8 max-w-7xl">
        {/* Liquid Glass Header */}
        <header className="pb-4 mb-8 relative group">
          {/* Glass Effect Background */}
          <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-500/15 dark:shadow-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/[0.08] via-cyan-400/[0.08] to-sky-400/[0.08] dark:from-blue-500/[0.03] dark:via-purple-500/[0.03] dark:to-emerald-500/[0.03] rounded-xl" />

          {/* Crystalline Border Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-300/30 dark:via-white/10 to-transparent p-[1px]">
            <div className="h-full w-full rounded-xl bg-transparent" />
          </div>

          {/* Header Content */}
          <div className="relative p-6 rounded-xl transition-all duration-700 group-hover:backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="bordered"
                  onPress={() => router.back()}
                  className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border-blue-200/40 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 uppercase tracking-widest text-xs"
                >
                  ← Voltar
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
                    Viagens em Tempo Real
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium drop-shadow-lg">
                    Acompanhe as viagens em andamento da cooperativa
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-full border border-blue-200/30 dark:border-white/10">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium drop-shadow-lg">
                    Monitoramento ativo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {/* Statistics Header - só aparece quando há viagens */}
          {viagens.length > 0 && (
            <section className="relative">
              <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-blue-200/25 dark:border-white/5" />
              <div className="relative p-4 rounded-2xl">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white drop-shadow-lg">
                    Viagens Ativas
                  </h2>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 backdrop-blur-sm rounded-full border border-emerald-200/30 dark:border-emerald-800/30">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                      {viagens.length} {viagens.length === 1 ? "viagem" : "viagens"}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Grid de Viagens com Glass Effect */}
          <section className="relative">
            {viagens.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {viagens.map((viagem, index) => (
                  <div key={viagem.id + index} className="group relative">
                    {/* Glass Background */}
                    <div className="absolute inset-0 bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-white/10 shadow-xl shadow-blue-400/15 dark:shadow-blue-500/5" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.06] via-cyan-400/[0.04] to-sky-400/[0.06] dark:from-blue-500/[0.02] dark:via-cyan-500/[0.02] dark:to-sky-500/[0.02] rounded-2xl" />

                    {/* Crystalline Highlight */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-300/50 dark:via-white/30 to-transparent" />

                    <div className="relative p-6 rounded-2xl transition-all duration-500 hover:backdrop-blur-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-400/20">
                      <ViagemCard
                        cooperativaId={cooperativaId}
                        viagem={viagem}
                        motoristaId={viagem.motoristaId}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-blue-200/25 dark:border-white/5" />
                <div className="relative p-12 rounded-3xl text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-blue-500 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Nenhuma viagem em andamento
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Não há viagens ativas no momento para esta cooperativa
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Spacer with Glass Effect */}
          <div className="pb-20 relative">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-100/[0.08] to-transparent dark:from-white/[0.01] backdrop-blur-sm rounded-t-3xl" />
          </div>
        </main>
      </div>
    </div>
  );
}