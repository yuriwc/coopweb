"use client";

import { useState, useEffect } from "react";

interface GoogleMapsState {
  isLoaded: boolean;
  error: string | null;
}

const useGoogleMaps = () => {
  const [state, setState] = useState<GoogleMapsState>({
    isLoaded: false,
    error: null,
  });

  useEffect(() => {
    // Para este hook, sempre consideramos "carregado" pois usamos APIs server-side
    // Isso mantém compatibilidade com componentes existentes
    setState({ isLoaded: true, error: null });
  }, []);

  return state;
};

export default useGoogleMaps;