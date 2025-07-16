"use client";

import { useState, useEffect } from "react";

interface GoogleMapsState {
  isLoaded: boolean;
  error: string | null;
}

// Global state para evitar múltiplos carregamentos
let isGoogleMapsLoading = false;
let isGoogleMapsLoaded = false;
let googleMapsError: string | null = null;

// Array de callbacks para quando o Google Maps carregar
const loadCallbacks: Array<(loaded: boolean, error?: string) => void> = [];

const useGoogleMaps = () => {
  const [state, setState] = useState<GoogleMapsState>({
    isLoaded: isGoogleMapsLoaded,
    error: googleMapsError,
  });

  useEffect(() => {
    // Se já está carregado, retorna imediatamente
    if (isGoogleMapsLoaded) {
      setState({ isLoaded: true, error: null });
      return;
    }

    // Se já há erro, retorna o erro
    if (googleMapsError) {
      setState({ isLoaded: false, error: googleMapsError });
      return;
    }

    // Adiciona callback para quando carregar
    const callback = (loaded: boolean, error?: string) => {
      setState({ isLoaded: loaded, error: error || null });
    };
    loadCallbacks.push(callback);

    // Se já está carregando, apenas aguarda
    if (isGoogleMapsLoading) {
      return () => {
        const index = loadCallbacks.indexOf(callback);
        if (index > -1) {
          loadCallbacks.splice(index, 1);
        }
      };
    }

    // Inicia o carregamento
    isGoogleMapsLoading = true;

    const loadGoogleMapsAPI = () => {
      // Verifica se a chave da API está configurada
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        googleMapsError = "Chave da API do Google Maps não configurada";
        isGoogleMapsLoading = false;
        loadCallbacks.forEach(cb => cb(false, googleMapsError || undefined));
        loadCallbacks.length = 0;
        return;
      }

      // Verifica se já existe globalmente
      if (window.google && window.google.maps) {
        isGoogleMapsLoaded = true;
        isGoogleMapsLoading = false;
        
        // Notifica todos os callbacks
        loadCallbacks.forEach(cb => cb(true));
        loadCallbacks.length = 0;
        return;
      }

      // Verifica se o script já existe no DOM
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script já existe, aguarda carregar
        existingScript.addEventListener('load', () => {
          isGoogleMapsLoaded = true;
          isGoogleMapsLoading = false;
          loadCallbacks.forEach(cb => cb(true));
          loadCallbacks.length = 0;
        });
        
        existingScript.addEventListener('error', () => {
          googleMapsError = "Erro ao carregar Google Maps API";
          isGoogleMapsLoading = false;
          loadCallbacks.forEach(cb => cb(false, googleMapsError || undefined));
          loadCallbacks.length = 0;
        });
        return;
      }

      // Cria novo script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      
      script.onload = () => {
        isGoogleMapsLoaded = true;
        isGoogleMapsLoading = false;
        
        // Notifica todos os callbacks
        loadCallbacks.forEach(cb => cb(true));
        loadCallbacks.length = 0;
      };
      
      script.onerror = () => {
        googleMapsError = "Erro ao carregar Google Maps API";
        isGoogleMapsLoading = false;
        
        // Notifica todos os callbacks
        loadCallbacks.forEach(cb => cb(false, googleMapsError || undefined));
        loadCallbacks.length = 0;
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();

    // Cleanup
    return () => {
      const index = loadCallbacks.indexOf(callback);
      if (index > -1) {
        loadCallbacks.splice(index, 1);
      }
    };
  }, []);

  return state;
};

export default useGoogleMaps;