"use client";
import { useCallback } from "react";
import { database } from "@/scripts/firebase-config";
import { ref, onValue, off } from "firebase/database";

export interface RideCoordinate {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  placeId?: string;
  nome?: string;
  whatsapp?: string;
}

export interface RideEmpresa {
  nome: string;
}

export interface RidePassenger {
  nome: string;
  whatsapp: string;
  email?: string;
  observacoes?: string;
}

export interface IntermediateCoordinate {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  placeId?: string;
  nome?: string;
  whatsapp?: string;
}

export interface PendingRide {
  // 📍 CAMPOS OBRIGATÓRIOS
  id: string;
  status: "aguardando_motorista";
  timestamp: number;
  scheduleDate: string;
  category: string;
  origin: RideCoordinate;
  destination: RideCoordinate;
  empresa: RideEmpresa;

  // 🔧 CAMPOS OPCIONAIS
  passengers?: RidePassenger[];
  nomePassageiro?: string;
  whatsappPassageiro?: string;
  externalId?: string;
  observations?: string;
  observacao?: string;
  distance?: number;
  duration?: number;
  path?: string;
  intermediateCoordinates?: IntermediateCoordinate[];
}

export const useFirebaseRides = (
  cooperativaId: string,
  onRidesUpdate: (rides: PendingRide[]) => void
) => {
  const ridesRef = ref(database, `rides/${cooperativaId}`);

  const startListening = useCallback(() => {
    onValue(ridesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rides: PendingRide[] = Object.keys(data).map((rideId) => ({
          id: rideId,
          ...data[rideId],
          // Map paradas to intermediateCoordinates for compatibility
          intermediateCoordinates: data[rideId].paradas || data[rideId].intermediateCoordinates,
        }));
        onRidesUpdate(rides);
      } else {
        onRidesUpdate([]);
      }
    });
  }, [ridesRef, onRidesUpdate]);

  const stopListening = useCallback(() => {
    off(ridesRef);
  }, [ridesRef]);

  return { startListening, stopListening };
};