"use client";

import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input, Textarea } from "@heroui/input";
import PlacesAutocomplete from "./places-autocomplete";

export interface PlaceDetails {
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

export interface LocationFormState {
  place: PlaceDetails | null;
  showContactFields: boolean;
  nome: string;
  whatsapp: string;
  email: string;
  observacoes: string;
}

export const EMPTY_LOCATION: LocationFormState = {
  place: null,
  showContactFields: false,
  nome: "",
  whatsapp: "",
  email: "",
  observacoes: "",
};

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})/, "$1-$2")
    .slice(0, 15);
};

interface Props {
  label: string;
  placeholder: string;
  location: LocationFormState;
  onPlaceSelect: (place: PlaceDetails | null) => void;
  onUpdate: (updates: Partial<LocationFormState>) => void;
  icon: string;
  onRemove?: () => void;
}

export default function LocationEntry({
  label,
  placeholder,
  location,
  onPlaceSelect,
  onUpdate,
  icon,
  onRemove,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon icon={icon} className="text-lg text-primary" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          {onRemove && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={onRemove}
              aria-label={`Remover ${label}`}
            >
              <Icon icon="solar:trash-bin-minimalistic-linear" className="text-lg" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody className="pt-0 gap-3">
        <PlacesAutocomplete
          label={label}
          onPlaceSelect={onPlaceSelect}
          placeholder={placeholder}
        />

        {location.place && (
          <Chip
            variant="flat"
            color="success"
            startContent={<Icon icon="solar:map-point-linear" className="text-sm" />}
          >
            {location.place.name}
          </Chip>
        )}

        <Button
          size="sm"
          variant="light"
          color="primary"
          startContent={
            <Icon
              icon={
                location.showContactFields
                  ? "solar:minimize-square-linear"
                  : "solar:user-plus-rounded-linear"
              }
            />
          }
          onPress={() => onUpdate({ showContactFields: !location.showContactFields })}
          className="self-start"
        >
          {location.showContactFields ? "Ocultar contato" : "Adicionar contato"}
        </Button>

        {location.showContactFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-default-50 rounded-lg">
            <Input
              label="Nome do contato"
              placeholder="Nome de quem recebe"
              value={location.nome}
              onChange={(e) => onUpdate({ nome: e.target.value })}
              variant="bordered"
              size="sm"
              startContent={
                <Icon icon="solar:user-linear" className="w-4 h-4 text-default-400" />
              }
            />
            <Input
              label="WhatsApp"
              placeholder="(00) 00000-0000"
              value={location.whatsapp}
              onChange={(e) => onUpdate({ whatsapp: formatPhone(e.target.value) })}
              variant="bordered"
              size="sm"
              startContent={
                <Icon icon="solar:chat-round-dots-linear" className="w-4 h-4 text-default-400" />
              }
            />
            <Input
              label="Email"
              placeholder="contato@email.com"
              value={location.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              variant="bordered"
              size="sm"
              type="email"
              startContent={
                <Icon icon="solar:letter-linear" className="w-4 h-4 text-default-400" />
              }
            />
            <Textarea
              label="Observações"
              placeholder="Informações adicionais..."
              value={location.observacoes}
              onChange={(e) => onUpdate({ observacoes: e.target.value })}
              variant="bordered"
              size="sm"
              minRows={2}
              maxRows={3}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
