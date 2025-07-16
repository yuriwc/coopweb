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
  
  // Use o hook personalizado para carregar Google Maps
  const { isLoaded: isGoogleLoaded, error: googleMapsError } = useGoogleMaps();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);


  // Inicializa serviços do Google Maps
  useEffect(() => {
    if (isGoogleLoaded && window.google) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
    }
  }, [isGoogleLoaded]);

  // Busca sugestões de lugares
  const searchPlaces = (query: string) => {
    if (!autocompleteService.current || query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const request = {
      input: query,
      componentRestrictions: { country: "br" }, // Restringir ao Brasil
      types: ["establishment", "geocode"], // Estabelecimentos e endereços
    };

    try {
      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
          console.warn('Google Places API status:', status);
        }
      });
    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
      setIsLoading(false);
      setSuggestions([]);
    }
  };

  // Debounce para busca
  useEffect(() => {
    if (!isGoogleLoaded || !autocompleteService.current) {
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

  // Busca detalhes do lugar selecionado usando nova API
  const getPlaceDetails = async (placeId: string) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setIsLoading(false);
      return;
    }

    try {
      // Nova API: google.maps.places.Place
      const { Place } = google.maps.places;
      
      const place = new Place({
        id: placeId,
        requestedLanguage: "pt-BR", // Define idioma português
      });

      // Busca os dados necessários incluindo componentes de endereço
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location", "id", "addressComponents"],
      });

      setIsLoading(false);

      if (place.displayName && place.formattedAddress && place.location) {
        // Mapeia os componentes de endereço para o formato esperado
        const addressComponents = place.addressComponents?.map(component => ({
          long_name: component.longText || "",
          short_name: component.shortText || "",
          types: component.types,
        }));

        const placeDetails: PlaceDetails = {
          formatted_address: place.formattedAddress,
          geometry: {
            location: {
              lat: place.location.lat(),
              lng: place.location.lng(),
            },
          },
          name: place.displayName,
          place_id: place.id || placeId,
          address_components: addressComponents,
        };
        onPlaceSelect(placeDetails);
      } else {
        console.warn('Dados do lugar incompletos');
        onPlaceSelect(null);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do lugar:', error);
      setIsLoading(false);
      onPlaceSelect(null);
    }
  };

  const handleSelectionChange = async (key: React.Key | null) => {
    if (key) {
      const selectedPlace = suggestions.find(place => place.place_id === key);
      if (selectedPlace) {
        setSelectedKey(key as string);
        setInputValue(selectedPlace.description);
        setSuggestions([]);
        setIsLoading(true);
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
    if (value === "") {
      onPlaceSelect(null);
      setSuggestions([]);
    }
  };

  if (googleMapsError) {
    return (
      <Autocomplete
        label={label}
        placeholder={googleMapsError.includes("não configurada") ? "API Key não configurada" : "Erro ao carregar mapas"}
        isDisabled={true}
        isInvalid={true}
        errorMessage={googleMapsError}
        startContent={<Icon icon="solar:danger-triangle-linear" className="w-4 h-4 text-danger" />}
      >
        <AutocompleteItem key="error">
          {googleMapsError.includes("não configurada") ? "Configure GOOGLE_MAPS_API_KEY" : "Erro no Google Maps"}
        </AutocompleteItem>
      </Autocomplete>
    );
  }

  if (!isGoogleLoaded) {
    return (
      <Autocomplete
        label={label}
        placeholder="Carregando Google Maps..."
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