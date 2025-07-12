"use client";
import { useCallback } from "react";
import { database } from "@/scripts/firebase-config";
import { ref, onValue, off } from "firebase/database";

export interface MotoristaFila {
  motorista: string;
  nome: string;
  timestamp: number;
}

export interface Fila {
  id: string;
  motoristas: MotoristaFila[];
}

export const useFirebaseQueues = (
  cooperativaId: string,
  onQueuesUpdate: (queues: Fila[]) => void
) => {
  const filasRef = ref(database, `cooperativas/${cooperativaId}/filas`);

  const startListening = useCallback(() => {
    onValue(filasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const queues: Fila[] = Object.keys(data).map((filaId) => {
          const motoristasData = data[filaId].motoristas || {};
          const motoristas: MotoristaFila[] = Object.keys(motoristasData).map(
            (motoristaKey) => ({
              motorista: motoristasData[motoristaKey].motorista,
              nome: motoristasData[motoristaKey].nome,
              timestamp: motoristasData[motoristaKey].timestamp,
            })
          );

          return {
            id: filaId,
            motoristas,
          };
        });
        onQueuesUpdate(queues);
      } else {
        onQueuesUpdate([]);
      }
    });
  }, [filasRef, onQueuesUpdate]);

  const stopListening = useCallback(() => {
    off(filasRef);
  }, [filasRef]);

  return { startListening, stopListening };
};