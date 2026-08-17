"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { TextField, Label, Input, InputGroup } from "@heroui/react";
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
      <Card.Header className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon icon={icon} className="text-lg text-accent" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          {onRemove && (
            <Button
              isIconOnly
              size="sm"
              variant="danger-soft"
              onPress={onRemove}
              aria-label={`Remover ${label}`}
            >
              <Icon icon="solar:trash-bin-minimalistic-linear" className="text-lg" />
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Content className="pt-0 gap-3">
        <PlacesAutocomplete
          label={label}
          onPlaceSelect={onPlaceSelect}
          placeholder={placeholder}
          hideLabel
        />

        {location.place && (
          <Chip variant="tertiary" color="success">
            <Icon icon="solar:map-point-linear" className="text-sm" />
            {location.place.name}
          </Chip>
        )}

        <Button
          size="sm"
          variant="tertiary"
          onPress={() => onUpdate({ showContactFields: !location.showContactFields })}
          className="self-start"
        >
          <Icon
            icon={
              location.showContactFields
                ? "solar:minimize-square-linear"
                : "solar:user-plus-rounded-linear"
            }
          />
          {location.showContactFields ? "Ocultar contato" : "Adicionar contato"}
        </Button>

        {location.showContactFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-default-50 rounded-lg">
            <TextField value={location.nome} onChange={(v) => onUpdate({ nome: v })}>
              <Label>Nome do contato</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <Icon icon="solar:user-linear" className="w-4 h-4 text-default-400" />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="Nome de quem recebe" />
              </InputGroup>
            </TextField>
            <TextField
              value={location.whatsapp}
              onChange={(v) => onUpdate({ whatsapp: formatPhone(v) })}
            >
              <Label>WhatsApp</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <Icon icon="solar:chat-round-dots-linear" className="w-4 h-4 text-default-400" />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="(00) 00000-0000" />
              </InputGroup>
            </TextField>
            <TextField type="email" value={location.email} onChange={(v) => onUpdate({ email: v })}>
              <Label>Email</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <Icon icon="solar:letter-linear" className="w-4 h-4 text-default-400" />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="contato@email.com" />
              </InputGroup>
            </TextField>
            <TextField value={location.observacoes} onChange={(v) => onUpdate({ observacoes: v })}>
              <Label>Observações</Label>
              <InputGroup>
                <InputGroup.TextArea placeholder="Informações adicionais..." rows={2} />
              </InputGroup>
            </TextField>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
