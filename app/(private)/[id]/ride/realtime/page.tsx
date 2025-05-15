// app/viagens/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/scripts/firebase-config";
import ViagemCard from "@/src/components/ViagemCard";

interface Viagem {
  id: string;
  nomePassageiro: string;
  statusViagem: string;
  enderecoOrigem: string;
  enderecoDestino: string;
  latitudeOrigem: number;
  longitudeOrigem: number;
  latitudeDestino: number;
  longitudeDestino: number;
  latitudeMotorista?: number;
  longitudeMotorista?: number;
}

export default function Page() {
  const [viagens, setViagens] = useState<Viagem[]>([]);

  useEffect(() => {
    const motoristasRef = ref(database, "/motoristas");
    const unsubscribe = onValue(motoristasRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const viagensArray = Object.entries(data).map(
        ([id, value]: [string, any]) => ({
          id,
          nomePassageiro: value.nomePassageiro,
          statusViagem: value.statusViagem,
          enderecoOrigem: value.enderecoOrigem,
          enderecoDestino: value.enderecoDestino,
          latitudeOrigem: value.latitudeOrigem,
          longitudeOrigem: value.longitudeOrigem,
          latitudeDestino: value.latitudeDestino,
          longitudeDestino: value.longitudeDestino,
          latitudeMotorista: value.latitudeMotorista,
          longitudeMotorista: value.longitudeMotorista,
        }),
      );

      setViagens(viagensArray);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Viagens em Andamento</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {viagens.map((viagem) => (
          <ViagemCard key={viagem.id} viagem={viagem} />
        ))}
      </div>
    </div>
  );
}
