"use client";
import { useCallback, useRef } from "react";
import { database } from "@/scripts/firebase-config";
import { ref, onValue } from "firebase/database";

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
  const listenerRef = useRef<(() => void) | null>(null);
  const callbackRef = useRef(onRidesUpdate);

  // Update callback ref when callback changes
  callbackRef.current = onRidesUpdate;

  const startListening = useCallback(() => {
    // Stop any existing listener first
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = null;
    }

    const unsubscribe = onValue(ridesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rides: PendingRide[] = Object.keys(data).map((rideId) => ({
          id: rideId,
          ...data[rideId],
          // Map paradas to intermediateCoordinates for compatibility
          intermediateCoordinates:
            data[rideId].paradas || data[rideId].intermediateCoordinates,
        }));
        callbackRef.current(rides);
      } else {
        callbackRef.current([]);
      }
    });

    // Store the unsubscribe function
    listenerRef.current = unsubscribe;
  }, [ridesRef]);

  const stopListening = useCallback(() => {
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = null;
    }
  }, []);

  return { startListening, stopListening };
};
