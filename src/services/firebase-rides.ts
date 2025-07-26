"use client";
import { useCallback } from "react";
import { database } from "@/scripts/firebase-config";
import { ref, onValue, off } from "firebase/database";

export interface RideDestination {
  address: string;
  lat: number;
  lng: number;
  name: string;
}

export interface RideOrigin {
  address: string;
  lat: number;
  lng: number;
  name: string;
}

export interface RideEmpresa {
  id: string;
  nome: string;
}

export interface RidePassenger {
  email: string;
}

export interface PendingRide {
  id: string;
  category: string;
  createdAt: number;
  destination: RideDestination;
  distance: number;
  duration: number;
  empresa: RideEmpresa;
  externalId: string;
  observations?: string;
  origin: RideOrigin;
  passenger: RidePassenger;
  scheduleDate?: string;
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