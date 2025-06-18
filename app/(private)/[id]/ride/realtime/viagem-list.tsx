"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../../../../scripts/firebase-config";
import ViagemCard from "../../../../../src/components/ViagemCard";
import { useRouter } from "next/navigation";
import { ISelect } from "../../../../../src/interface/ISelect";
import { Passageiro, ViagemRealTime } from "../../../../../src/model/viagem";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";

interface Props {
  cooperativas: ISelect[];
}

export default function ViagemList({ cooperativas }: Props) {
  const [viagens, setViagens] = useState<ViagemRealTime[]>([]);
  const [cooperativaId, setCooperativaId] = useState<string>(() => {
    // Seleciona automaticamente a primeira cooperativa se houver apenas uma
    return cooperativas.length === 1 ? cooperativas[0].value : "";
  });
  const router = useRouter();

  // Remover o useEffect que buscava cooperativas pois agora vem como props

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
    <div className="p-4 pb-24 space-y-6">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="bordered"
          onPress={() => router.back()}
          className="uppercase tracking-widest text-xs"
        >
          ← Voltar
        </Button>
        <h1 className="text-xl font-bold">Viagens em Andamento</h1>
      </div>

      {/* Select de Cooperativas */}
      <div className="max-w-xs">
        <Select
          label="Selecione a Cooperativa"
          placeholder={
            cooperativas.length === 0
              ? "Nenhuma cooperativa disponível"
              : "Escolha uma cooperativa"
          }
          selectedKeys={cooperativaId ? [cooperativaId] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setCooperativaId(selected || "");
          }}
          isDisabled={cooperativas.length === 0}
          className="w-full"
        >
          {cooperativas.map((coop) => (
            <SelectItem key={coop.value}>{coop.label}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Grid de Viagens */}
      {cooperativaId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {viagens.length > 0 ? (
            viagens.map((viagem, index) => (
              <ViagemCard
                cooperativaId={cooperativaId}
                key={viagem.id + index}
                viagem={viagem}
                motoristaId={viagem.motoristaId}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nenhuma viagem em andamento encontrada
            </div>
          )}
        </div>
      )}

      {/* Mensagem quando nenhuma cooperativa está selecionada */}
      {!cooperativaId && cooperativas.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          Selecione uma cooperativa para visualizar as viagens
        </div>
      )}

      {/* Mensagem quando não há cooperativas */}
      {cooperativas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma cooperativa encontrada para esta empresa
        </div>
      )}
    </div>
  );
}
