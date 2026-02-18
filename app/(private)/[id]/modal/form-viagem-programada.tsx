import { Funcionario } from "@/src/model/funcionario";
import { Button } from "@heroui/button";
import TipoViagem from "../tipoViagem";
import { useState } from "react";
import { DateValue, RangeCalendar, RangeValue } from "@heroui/calendar";
import {
  today,
  getLocalTimeZone,
  isWeekend,
  getDayOfWeek,
} from "@internationalized/date";
import { Checkbox } from "@heroui/checkbox";
import { useLocale } from "@react-aria/i18n";
import { TimeInput, TimeInputValue } from "@heroui/date-input";
import SelectCooperativas from "../select/cooperativas";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import ShowToast from "@/src/components/Toast";
import PlacesAutocomplete from "../components/places-autocomplete";

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

interface LocationDTO {
  lat: number;
  lng: number;
  name: string;
  address: string;
  placeId?: string;
}

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

export default function ScheduledTripModal({
  isOpen,
  onOpen,
  passagers,
  empresa,
  token,
}: Props) {
  const { locale } = useLocale();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [evitarFinsDeSemana, setEvitarFinsDeSemana] = useState(false);
  const [evitarDomingos, setEvitarDomingos] = useState(false);
  const [horaViagem, setHoraViagem] = useState<TimeInputValue | null>(null);
  const [horaRetorno, setHoraRetorno] = useState<TimeInputValue | null>(null);
  const [cooperativa, setCooperativa] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<RangeValue<DateValue> | null>({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 4 }),
  });

  // Locais da rota (opcionais — se omitidos, o backend usa endereços cadastrados)
  const [useCustomRoute, setUseCustomRoute] = useState(false);
  const [origin, setOrigin] = useState<PlaceDetails | null>(null);
  const [destination, setDestination] = useState<PlaceDetails | null>(null);
  const [intermediateStops, setIntermediateStops] = useState<
    (PlaceDetails | null)[]
  >([]);
  const [centroCustoId, setCentroCustoId] = useState<string>("");

  const placeToLocationDTO = (place: PlaceDetails): LocationDTO => ({
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    name: place.name,
    address: place.formatted_address,
    placeId: place.place_id,
  });

  const addIntermediateStop = () => {
    setIntermediateStops([...intermediateStops, null]);
  };

  const removeIntermediateStop = (index: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  const updateIntermediateStop = (
    index: number,
    place: PlaceDetails | null
  ) => {
    const updated = [...intermediateStops];
    updated[index] = place;
    setIntermediateStops(updated);
  };

  function validate() {
    const cidades = passagers.map((passager) => passager.cidade);

    if (!selectedPlan) {
      ShowToast({ color: "danger", title: "Selecione um plano de viagem!" });
      return false;
    }

    if (new Set(cidades).size !== 1) {
      ShowToast({
        color: "danger",
        title: "Todos os passageiros devem ser da mesma cidade!",
      });
      return false;
    }

    if (useCustomRoute) {
      if (!origin) {
        ShowToast({ color: "danger", title: "Selecione o local de origem!" });
        return false;
      }

      if (!destination) {
        ShowToast({ color: "danger", title: "Selecione o local de destino!" });
        return false;
      }

      if (intermediateStops.some((stop) => stop === null)) {
        ShowToast({
          color: "danger",
          title:
            "Preencha todas as paradas intermediárias ou remova as vazias!",
        });
        return false;
      }
    }

    if (!horaViagem) {
      ShowToast({
        color: "danger",
        title:
          selectedPlan === "RETORNO"
            ? "Informe a hora do retorno!"
            : "Informe a hora da viagem!",
      });
      return false;
    }

    if (selectedPlan === "APANHA_E_RETORNO" && !horaRetorno) {
      ShowToast({ color: "danger", title: "Informe a hora do retorno!" });
      return false;
    }

    return true;
  }

  function generateDataToRequest() {
    const passagersID = passagers.map((passager) => passager.id);

    const requestData: {
      empresaID: string;
      tipoViagem: string;
      cooperativaID: string;
      passageiros: string[];
      dataInicial: DateValue | undefined;
      dataFinal: DateValue | undefined;
      horaViagem: TimeInputValue | null;
      horaRetorno?: TimeInputValue | null;
      origin?: LocationDTO;
      destination?: LocationDTO;
      intermediateCoordinates?: LocationDTO[];
      centroCustoId?: number;
    } = {
      empresaID: empresa,
      tipoViagem: selectedPlan,
      cooperativaID: cooperativa,
      passageiros: passagersID,
      dataInicial: value?.start,
      dataFinal: value?.end,
      horaViagem,
      horaRetorno:
        selectedPlan === "APANHA_E_RETORNO" ? horaRetorno : undefined,
    };

    if (useCustomRoute && origin) {
      requestData.origin = placeToLocationDTO(origin);
    }

    if (useCustomRoute && destination) {
      requestData.destination = placeToLocationDTO(destination);
    }

    if (useCustomRoute && intermediateStops.length > 0) {
      requestData.intermediateCoordinates = (
        intermediateStops.filter(Boolean) as PlaceDetails[]
      ).map(placeToLocationDTO);
    }

    if (centroCustoId) {
      requestData.centroCustoId = Number(centroCustoId);
    }

    return requestData;
  }

  async function requestViagem() {
    setIsLoading(true);
    const data = generateDataToRequest();

    console.log("[Programação] JSON enviado:", JSON.stringify(data, null, 2));

    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/criar`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      try {
        const responseBody = await response.clone().json();
        console.log("[Programação] Body da resposta:", responseBody);
      } catch {
        try {
          const responseBody = await response.clone().text();
          console.log("[Programação] Body da resposta (texto):", responseBody);
        } catch {
          console.log("[Programação] Não foi possível ler o corpo da resposta.");
        }
      }

      if (!response.ok) {
        ShowToast({
          color: "danger",
          title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
        });
        return;
      }

      onOpen(false);
      return ShowToast({
        color: "success",
        title: "Programação solicitada com sucesso!",
      });
    } catch (error) {
      console.error("[Programação] Exceção:", error);
      ShowToast({
        color: "danger",
        title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSolicitarViagem() {
    if (validate()) {
      await requestViagem();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpen}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50",
        wrapper: "items-center justify-center",
        base: "max-h-[90vh] my-4",
        body: "p-6",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-4">
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:calendar-date-linear"
                  className="w-6 h-6 text-primary"
                />
                <div>
                  <h3 className="text-lg font-semibold">Programar Viagem</h3>
                  <p className="text-sm text-default-500">
                    Configure uma viagem programada
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Icon
                      icon="solar:buildings-3-linear"
                      className="w-4 h-4 inline mr-2"
                    />
                    Cooperativa
                  </label>
                  <SelectCooperativas
                    setCooperativa={setCooperativa}
                    empresa={empresa}
                    token={token}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Icon
                      icon="solar:route-linear"
                      className="w-4 h-4 inline mr-2"
                    />
                    Tipo de Viagem
                  </label>
                  <TipoViagem setSelectedPlan={setSelectedPlan} />
                </div>
              </div>

              {/* Passageiros */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Icon
                    icon="solar:users-group-two-rounded-linear"
                    className="w-4 h-4 inline mr-2"
                  />
                  Passageiros ({passagers.length})
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-default-50 rounded-lg border">
                  {passagers.map((passager) => (
                    <Chip
                      key={passager.id}
                      avatar={
                        <Avatar
                          size="sm"
                          name={passager.name?.charAt(0).toUpperCase()}
                          className="bg-primary text-white"
                        />
                      }
                      variant="flat"
                      color="primary"
                      size="sm"
                    >
                      {passager.name}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Rota */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">
                    <Icon
                      icon="solar:route-linear"
                      className="w-4 h-4 inline mr-2"
                    />
                    Rota Personalizada
                  </label>
                  <Button
                    size="sm"
                    variant={useCustomRoute ? "solid" : "bordered"}
                    color={useCustomRoute ? "primary" : "default"}
                    onPress={() => {
                      setUseCustomRoute(!useCustomRoute);
                      setOrigin(null);
                      setDestination(null);
                      setIntermediateStops([]);
                    }}
                  >
                    {useCustomRoute ? "Ativada" : "Desativada"}
                  </Button>
                </div>

                {!useCustomRoute && (
                  <p className="text-xs text-default-400">
                    <Icon
                      icon="solar:info-circle-linear"
                      className="w-3.5 h-3.5 inline mr-1"
                    />
                    O sistema usará automaticamente o endereço cadastrado dos
                    passageiros e da empresa conforme o tipo de viagem.
                  </p>
                )}

                {useCustomRoute && (
                  <div className="space-y-3 p-4 bg-default-50 rounded-lg border">
                    {/* Origem */}
                    <PlacesAutocomplete
                      label="Origem"
                      onPlaceSelect={setOrigin}
                      placeholder="Buscar local de origem..."
                    />

                    {/* Paradas intermediárias */}
                    {intermediateStops.map((_, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <PlacesAutocomplete
                            label={`Parada ${index + 1}`}
                            onPlaceSelect={(place) =>
                              updateIntermediateStop(index, place)
                            }
                            placeholder={`Buscar parada ${index + 1}...`}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => removeIntermediateStop(index)}
                          className="mb-0.5"
                        >
                          <Icon
                            icon="solar:trash-bin-trash-linear"
                            className="w-4 h-4"
                          />
                        </Button>
                      </div>
                    ))}

                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={addIntermediateStop}
                      startContent={
                        <Icon
                          icon="solar:add-circle-linear"
                          className="w-4 h-4"
                        />
                      }
                    >
                      Adicionar parada intermediária
                    </Button>

                    {/* Destino */}
                    <PlacesAutocomplete
                      label="Destino"
                      onPlaceSelect={setDestination}
                      placeholder="Buscar local de destino..."
                    />
                  </div>
                )}
              </div>

              {/* Centro de Custo */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Icon
                    icon="solar:wallet-linear"
                    className="w-4 h-4 inline mr-2"
                  />
                  Centro de Custo{" "}
                  <span className="text-default-400 font-normal">
                    (opcional)
                  </span>
                </label>
                <Input
                  type="number"
                  variant="bordered"
                  placeholder="ID do centro de custo"
                  value={centroCustoId}
                  onValueChange={setCentroCustoId}
                  size="sm"
                />
              </div>

              {/* Período e Horários */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Período */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Icon
                      icon="solar:calendar-mark-linear"
                      className="w-4 h-4 inline mr-2"
                    />
                    Período da Viagem
                  </label>
                  <div className="space-y-4">
                    <RangeCalendar
                      aria-label="Data da Viagem"
                      value={value}
                      onChange={setValue}
                      isDateUnavailable={(date) =>
                        (evitarFinsDeSemana && isWeekend(date, locale)) ||
                        (evitarDomingos && getDayOfWeek(date, locale) === 0)
                      }
                      classNames={{
                        content: "w-full",
                        base: "w-full",
                      }}
                    />
                    <div className="space-y-2">
                      <Checkbox
                        onChange={() =>
                          setEvitarFinsDeSemana(!evitarFinsDeSemana)
                        }
                        isSelected={evitarFinsDeSemana}
                        size="sm"
                      >
                        <span className="text-sm">Evitar fins de semana</span>
                      </Checkbox>
                      <Checkbox
                        onChange={() => setEvitarDomingos(!evitarDomingos)}
                        isSelected={evitarDomingos}
                        size="sm"
                      >
                        <span className="text-sm">Evitar domingos</span>
                      </Checkbox>
                    </div>
                  </div>
                </div>

                {/* Horários */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Icon
                      icon="solar:clock-circle-linear"
                      className="w-4 h-4 inline mr-2"
                    />
                    Horários
                  </label>
                  <div className="space-y-4">
                    <TimeInput
                      variant="bordered"
                      hourCycle={24}
                      isRequired
                      label={
                        selectedPlan === "RETORNO"
                          ? "Hora do retorno"
                          : selectedPlan === "APANHA_E_RETORNO"
                          ? "Hora da apanha"
                          : "Hora da viagem"
                      }
                      onChange={setHoraViagem}
                      value={horaViagem}
                      startContent={
                        <Icon
                          icon="solar:clock-linear"
                          className="w-4 h-4 text-default-400"
                        />
                      }
                    />
                    {selectedPlan === "APANHA_E_RETORNO" && (
                      <TimeInput
                        variant="bordered"
                        hourCycle={24}
                        isRequired
                        label="Hora do retorno"
                        onChange={setHoraRetorno}
                        value={horaRetorno}
                        startContent={
                          <Icon
                            icon="solar:clock-linear"
                            className="w-4 h-4 text-default-400"
                          />
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="bg-default-50 dark:bg-default-100/50 py-3 px-6">
              <Button
                variant="light"
                onPress={onClose}
                startContent={
                  <Icon icon="solar:close-circle-linear" className="w-4 h-4" />
                }
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSolicitarViagem}
                isLoading={isLoading}
                startContent={
                  !isLoading ? (
                    <Icon
                      icon="solar:calendar-add-linear"
                      className="w-4 h-4"
                    />
                  ) : null
                }
                className="bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold"
              >
                {isLoading ? "Programando..." : "Programar Viagem"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
