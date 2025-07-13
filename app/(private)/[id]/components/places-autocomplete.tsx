"use client";

import { useState, useEffect, useRef } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Icon } from "@iconify/react";

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
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Carrega Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        setIsGoogleLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, []);

  // Inicializa serviços do Google Maps
  useEffect(() => {
    if (isGoogleLoaded && window.google) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      
      // Cria um div invisível para o PlacesService
      const mapDiv = document.createElement("div");
      const map = new google.maps.Map(mapDiv);
      placesService.current = new google.maps.places.PlacesService(map);
    }
  }, [isGoogleLoaded]);

  // Busca sugestões de lugares
  const searchPlaces = (query: string) => {
    if (!autocompleteService.current || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    const request = {
      input: query,
      componentRestrictions: { country: "br" }, // Restringir ao Brasil
      types: ["establishment", "geocode"], // Estabelecimentos e endereços
    };

    autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
      setIsLoading(false);
      
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions);
      } else {
        setSuggestions([]);
      }
    });
  };

  // Debounce para busca
  useEffect(() => {
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
  }, [inputValue]);

  // Busca detalhes do lugar selecionado
  const getPlaceDetails = (placeId: string) => {
    if (!placesService.current) return;

    const request = {
      placeId,
      fields: ["formatted_address", "geometry", "name", "place_id"],
    };

    placesService.current.getDetails(request, (place, status) => {
      setIsLoading(false);
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const placeDetails: PlaceDetails = {
          formatted_address: place.formatted_address || "",
          geometry: {
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
            },
          },
          name: place.name || "",
          place_id: place.place_id || "",
        };
        onPlaceSelect(placeDetails);
      }
    });
  };

  const handleSelectionChange = (key: React.Key | null) => {
    if (key) {
      const selectedPlace = suggestions.find(place => place.place_id === key);
      if (selectedPlace) {
        setSelectedKey(key as string);
        setInputValue(selectedPlace.description);
        setSuggestions([]);
        setIsLoading(true);
        getPlaceDetails(selectedPlace.place_id);
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