"use client";

import { useState, useEffect, useCallback } from "react";
import { Funcionario } from "@/src/model/funcionario";
import TipoViagemSimples from "../components/tipo-viagem-simples";
import ShowToast from "@/src/components/Toast";
import SelectCooperativas from "../select/cooperativas";
import SelectCentrosCusto from "../select/centros-custo";
import PlacesAutocomplete from "../components/places-autocomplete";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input, Textarea } from "@heroui/input";

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

interface LocationCoordinate {
  lat: number;
  lng: number;
  name: string;
  address: string;
  placeId?: string;
  nome?: string;
  whatsapp?: string;
  email?: string;
  observacoes?: string;
}

interface LocationFormState {
  place: PlaceDetails | null;
  showContactFields: boolean;
  nome: string;
  whatsapp: string;
  email: string;
  observacoes: string;
}

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

const EMPTY_LOCATION: LocationFormState = {
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

function LocationEntry({
  label,
  placeholder,
  location,
  onPlaceSelect,
  onUpdate,
  icon,
  onRemove,
}: {
  label: string;
  placeholder: string;
  location: LocationFormState;
  onPlaceSelect: (place: PlaceDetails | null) => void;
  onUpdate: (updates: Partial<LocationFormState>) => void;
  icon: string;
  onRemove?: () => void;
}) {
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

export default function UnifiedTripModal({
  isOpen,
  onOpen,
  passagers,
  empresa,
  token,
}: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("Apanha");
  const [cooperativa, setCooperativa] = useState<string>("");
  const [centroCusto, setCentroCusto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados para viagem personalizada
  const [isFlexibleTrip, setIsFlexibleTrip] = useState(false);
  const [origin, setOrigin] = useState<LocationFormState>({ ...EMPTY_LOCATION });
  const [destination, setDestination] = useState<LocationFormState>({ ...EMPTY_LOCATION });
  const [intermediateStops, setIntermediateStops] = useState<LocationFormState[]>([]);

  const getCommonCentroCusto = useCallback(async () => {
    if (passagers.length === 0) {
      return "";
    }

    const firstCentroCusto = passagers[0].centroCustoCodigo;

    if (!firstCentroCusto) {
      return "";
    }

    const allHaveSameCentroCusto = passagers.every(
      (passager) => passager.centroCustoCodigo === firstCentroCusto
    );

    if (!allHaveSameCentroCusto) {
      return "";
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/centro-custo/labels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Erro ao buscar centros de custo");
        return "";
      }

      const centrosCusto = await response.json();

      const centroCustoEncontrado = centrosCusto.find(
        (centro: { label: string; value: number }) =>
          centro.label === firstCentroCusto
      );

      if (centroCustoEncontrado) {
        const valueString = centroCustoEncontrado.value.toString();
        return valueString;
      }

      return "";
    } catch (error) {
      console.error("Erro ao buscar centros de custo:", error);
      return "";
    }
  }, [passagers, token]);

  useEffect(() => {
    if (isOpen) {
      const updateCentroCusto = async () => {
        const centroCustoComum = await getCommonCentroCusto();
        setCentroCusto(centroCustoComum);
      };

      updateCentroCusto();
    }
  }, [isOpen, getCommonCentroCusto]);

  const updateLocation = (
    setter: React.Dispatch<React.SetStateAction<LocationFormState>>,
    updates: Partial<LocationFormState>
  ) => {
    setter((prev) => ({ ...prev, ...updates }));
  };

  const addIntermediateStop = () => {
    setIntermediateStops((prev) => [...prev, { ...EMPTY_LOCATION }]);
  };

  const removeIntermediateStop = (index: number) => {
    setIntermediateStops((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIntermediateStop = (index: number, updates: Partial<LocationFormState>) => {
    setIntermediateStops((prev) =>
      prev.map((stop, i) => (i === index ? { ...stop, ...updates } : stop))
    );
  };

  const buildLocationCoordinate = (loc: LocationFormState): LocationCoordinate => {
    if (!loc.place) throw new Error("Place is required");

    const coord: LocationCoordinate = {
      lat: loc.place.geometry.location.lat,
      lng: loc.place.geometry.location.lng,
      name: loc.place.name,
      address: loc.place.formatted_address,
    };

    if (loc.place.place_id) coord.placeId = loc.place.place_id;
    if (loc.nome.trim()) coord.nome = loc.nome.trim();
    if (loc.whatsapp.trim()) coord.whatsapp = loc.whatsapp.trim();
    if (loc.email.trim()) coord.email = loc.email.trim();
    if (loc.observacoes.trim()) coord.observacoes = loc.observacoes.trim();

    return coord;
  };

  const validateForm = (): boolean => {
    if (!cooperativa) {
      ShowToast({ color: "danger", title: "Selecione uma cooperativa" });
      return false;
    }

    if (isFlexibleTrip) {
      if (!origin.place) {
        ShowToast({ color: "danger", title: "Selecione o local de origem" });
        return false;
      }
      if (!destination.place) {
        ShowToast({ color: "danger", title: "Selecione o local de destino" });
        return false;
      }
      for (let i = 0; i < intermediateStops.length; i++) {
        if (!intermediateStops[i].place) {
          ShowToast({
            color: "danger",
            title: `Selecione o local da parada ${i + 1}`,
          });
          return false;
        }
      }
    }

    return true;
  };

  const resetForm = () => {
    setSelectedPlan("Apanha");
    setCooperativa("");
    setCentroCusto("");
    setIsFlexibleTrip(false);
    setOrigin({ ...EMPTY_LOCATION });
    setDestination({ ...EMPTY_LOCATION });
    setIntermediateStops([]);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestBody: Record<string, any> = {
        empresaID: empresa,
        cooperativaID: cooperativa,
        passageiros: passagers.map((p) => ({ passageiroID: p.id })),
      };

      if (centroCusto) {
        requestBody.centroCustoId = parseInt(centroCusto);
      }

      if (isFlexibleTrip) {
        // Formato 2: com coordenadas explicitas
        requestBody.origin = buildLocationCoordinate(origin);
        requestBody.destination = buildLocationCoordinate(destination);

        if (intermediateStops.length > 0) {
          requestBody.intermediateCoordinates = intermediateStops.map(buildLocationCoordinate);
        }
      } else {
        // Formato 1: viagem normal
        requestBody.tipoViagem = selectedPlan;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/viagem`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        ShowToast({ color: "success", title: "Viagem criada com sucesso!" });
        onOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        ShowToast({ color: "danger", title: error.message || "Erro ao criar viagem" });
      }
    } catch (error) {
      console.error("Erro ao criar viagem:", error);
      ShowToast({ color: "danger", title: "Erro interno do servidor" });
    } finally {
      setIsLoading(false);
    }
  };

  const getTripTypeDescription = (): string => {
    if (isFlexibleTrip) {
      const originName = origin.place?.name || "Origem";
      const destName = destination.place?.name || "Destino";
      const stopsCount = intermediateStops.length;
      const stopsText =
        stopsCount > 0
          ? ` (${stopsCount} parada${stopsCount > 1 ? "s" : ""})`
          : "";
      return `${originName} → ${destName}${stopsText}`;
    }

    return selectedPlan === "Apanha" ? "Casa → Trabalho" : "Trabalho → Casa";
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpen}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:car-linear"
                  className="text-2xl text-primary"
                />
                <span>Solicitar Viagem</span>
              </div>
              <p className="text-sm text-default-500 font-normal">
                {getTripTypeDescription()}
              </p>
            </ModalHeader>

            <ModalBody className="gap-6">
              {/* Passageiros selecionados */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:users-group-rounded-linear" className="text-lg" />
                    <span className="text-sm font-medium">
                      Passageiros ({passagers.length})
                    </span>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {passagers.map((passager) => (
                      <Chip
                        key={passager.id}
                        avatar={
                          <Avatar
                            name={passager.name}
                            size="sm"
                            getInitials={(name) =>
                              name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                            }
                          />
                        }
                        variant="flat"
                        color="primary"
                      >
                        {passager.name}
                      </Chip>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Toggle para viagem personalizada */}
              <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium">Viagem Personalizada</h4>
                  <p className="text-xs text-default-500">
                    Definir locais de origem e destino personalizados
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={isFlexibleTrip ? "solid" : "bordered"}
                  color={isFlexibleTrip ? "primary" : "default"}
                  onPress={() => setIsFlexibleTrip(!isFlexibleTrip)}
                >
                  {isFlexibleTrip ? "Ativado" : "Desativado"}
                </Button>
              </div>

              {!isFlexibleTrip ? (
                /* Viagem normal */
                <TipoViagemSimples setSelectedPlan={setSelectedPlan} />
              ) : (
                /* Viagem personalizada */
                <div className="space-y-4">
                  {/* Origem */}
                  <LocationEntry
                    label="Origem"
                    placeholder="Buscar local de origem..."
                    icon="solar:routing-2-linear"
                    location={origin}
                    onPlaceSelect={(place) =>
                      updateLocation(setOrigin, { place })
                    }
                    onUpdate={(updates) =>
                      updateLocation(setOrigin, updates)
                    }
                  />

                  {/* Paradas intermediárias */}
                  {intermediateStops.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <Icon icon="solar:map-point-wave-linear" className="text-default-500" />
                        <span className="text-xs font-medium text-default-500">
                          Paradas intermediárias ({intermediateStops.length})
                        </span>
                      </div>
                      {intermediateStops.map((stop, index) => (
                        <LocationEntry
                          key={index}
                          label={`Parada ${index + 1}`}
                          placeholder="Buscar local da parada..."
                          icon="solar:map-point-linear"
                          location={stop}
                          onPlaceSelect={(place) =>
                            updateIntermediateStop(index, { place })
                          }
                          onUpdate={(updates) =>
                            updateIntermediateStop(index, updates)
                          }
                          onRemove={() => removeIntermediateStop(index)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Botão adicionar parada */}
                  <Button
                    size="sm"
                    variant="flat"
                    color="default"
                    startContent={<Icon icon="solar:add-circle-linear" />}
                    onPress={addIntermediateStop}
                    className="w-full"
                  >
                    Adicionar parada intermediária
                  </Button>

                  {/* Destino */}
                  <LocationEntry
                    label="Destino"
                    placeholder="Buscar local de destino..."
                    icon="solar:flag-linear"
                    location={destination}
                    onPlaceSelect={(place) =>
                      updateLocation(setDestination, { place })
                    }
                    onUpdate={(updates) =>
                      updateLocation(setDestination, updates)
                    }
                  />
                </div>
              )}

              {/* Cooperativa */}
              <SelectCooperativas
                empresa={empresa}
                setCooperativa={setCooperativa}
                token={token}
              />

              {/* Centro de custo */}
              <SelectCentrosCusto
                empresa={empresa}
                setCentroCusto={setCentroCusto}
                initialCentroCusto={centroCusto}
                token={token}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isLoading}
                startContent={
                  !isLoading && <Icon icon="solar:car-linear" />
                }
              >
                {isLoading ? "Criando..." : "Criar Viagem"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
