"use client";

import { useState, useEffect, useRef } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Icon } from "@iconify/react";
import useGoogleMaps from "@/src/hooks/useGoogleMaps";

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetails {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  place_id: string;
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

interface Props {
  label: string;
  placeholder?: string;
  onPlaceSelect: (place: PlaceDetails | null) => void;
  value?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

export default function PlacesAutocomplete({
  label,
  placeholder = "Digite para buscar...",
  onPlaceSelect,
  value = "",
  isInvalid = false,
  errorMessage,
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { isLoaded: isGoogleLoaded, error: googleMapsError } = useGoogleMaps();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Busca sugestões de lugares usando nossa API
  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`/api/google-maps/autocomplete?input=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na API');
      }

      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
        if (data.status !== 'ZERO_RESULTS') {
          console.warn('Google Places API status:', data.status);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
      setApiError('Erro ao buscar lugares');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para busca
  useEffect(() => {
    if (!isGoogleLoaded) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchPlaces(inputValue);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputValue, isGoogleLoaded]);

  // Busca detalhes do lugar selecionado usando nossa API
  const getPlaceDetails = async (placeId: string) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`/api/google-maps/place-details?place_id=${encodeURIComponent(placeId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na API');
      }

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        const placeDetails: PlaceDetails = {
          formatted_address: place.formatted_address,
          geometry: {
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            },
          },
          name: place.name,
          place_id: place.place_id,
          address_components: place.address_components?.map((component: any) => ({
            long_name: component.long_name,
            short_name: component.short_name,
            types: component.types,
          })),
        };
        onPlaceSelect(placeDetails);
      } else {
        console.warn('Dados do lugar incompletos ou status:', data.status);
        onPlaceSelect(null);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do lugar:', error);
      setApiError('Erro ao buscar detalhes do lugar');
      onPlaceSelect(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectionChange = async (key: React.Key | null) => {
    if (key) {
      const selectedPlace = suggestions.find(place => place.place_id === key);
      if (selectedPlace) {
        setSelectedKey(key as string);
        setInputValue(selectedPlace.description);
        setSuggestions([]);
        await getPlaceDetails(selectedPlace.place_id);
      }
    } else {
      setSelectedKey(null);
      onPlaceSelect(null);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setSelectedKey(null);
    setApiError(null);
    if (value === "") {
      onPlaceSelect(null);
      setSuggestions([]);
    }
  };

  const currentError = googleMapsError || apiError;
  const isDisabled = !!currentError;

  if (currentError) {
    return (
      <Autocomplete
        label={label}
        placeholder={currentError.includes("não configurada") ? "API Key não configurada" : "Erro ao carregar"}
        isDisabled={true}
        isInvalid={true}
        errorMessage={currentError}
        startContent={<Icon icon="solar:danger-triangle-linear" className="w-4 h-4 text-danger" />}
      >
        <AutocompleteItem key="error">
          {currentError.includes("não configurada") ? "Configure GOOGLE_MAPS_API_KEY" : "Erro no serviço"}
        </AutocompleteItem>
      </Autocomplete>
    );
  }

  if (!isGoogleLoaded) {
    return (
      <Autocomplete
        label={label}
        placeholder="Carregando..."
        isDisabled={true}
        startContent={<Icon icon="solar:location-linear" className="w-4 h-4 text-default-400" />}
      >
        <AutocompleteItem key="loading">Carregando...</AutocompleteItem>
      </Autocomplete>
    );
  }

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder}
      inputValue={inputValue}
      selectedKey={selectedKey}
      onInputChange={handleInputChange}
      onSelectionChange={handleSelectionChange}
      isLoading={isLoading}
      items={suggestions}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      startContent={<Icon icon="solar:location-linear" className="w-4 h-4 text-default-400" />}
      classNames={{
        base: "w-full",
        listboxWrapper: "max-h-[200px]",
      }}
    >
      {(item) => (
        <AutocompleteItem
          key={item.place_id}
          textValue={item.description}
          className="data-[hover=true]:bg-default-100"
        >
          <div className="flex flex-col">
            <span className="text-small font-medium">
              {item.structured_formatting.main_text}
            </span>
            <span className="text-tiny text-default-400">
              {item.structured_formatting.secondary_text}
            </span>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}