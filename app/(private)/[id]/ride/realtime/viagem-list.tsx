"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../../../../scripts/firebase-config";
import ViagemCard from "../../../../../src/components/ViagemCard";
import { useRouter } from "next/navigation";
import { ISelect } from "../../../../../src/interface/ISelect";
import { Passageiro, ViagemRealTime } from "../../../../../src/model/viagem";

interface Props {
  empresaId: string;
  token: string;
}

export default function ViagemList({ empresaId, token }: Props) {
  const [viagens, setViagens] = useState<ViagemRealTime[]>([]);
  const [cooperativas, setCooperativas] = useState<ISelect[]>([]);
  const [cooperativaId, setCooperativaId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchCooperativas = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/${empresaId}/cooperativas`,
          {
            next: { tags: ["getViagens"] },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Erro na requisição:",
            response.status,
            response.statusText
          );
          return;
        }

        const data: ISelect[] = await response.json();
        setCooperativas(data);
      } catch (err) {
        console.error("Erro ao buscar cooperativas:", err);
      }
    };

    fetchCooperativas();
  }, [empresaId, token]);

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
    <div className="p-4">
      <button
        className="mb-4 px-4 py-2 border uppercase tracking-widest text-xs rounded-none hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white transition"
        onClick={() => router.back()}
      >
        Voltar
      </button>
      <h1 className="text-xl font-bold mb-4">Viagens em Andamento</h1>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">
          Selecione a Cooperativa:
        </label>
        <select
          className="border px-2 py-1 rounded"
          value={cooperativaId}
          onChange={(e) => setCooperativaId(e.target.value)}
        >
          <option value="">Selecione...</option>
          {cooperativas.map((coop) => (
            <option key={coop.value} value={coop.value}>
              {coop.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {viagens.map((viagem) => (
          <ViagemCard
            cooperativaId={cooperativaId}
            key={viagem.id}
            viagem={viagem}
            motoristaId={viagem.motoristaId}
          />
        ))}
      </div>
    </div>
  );
}
