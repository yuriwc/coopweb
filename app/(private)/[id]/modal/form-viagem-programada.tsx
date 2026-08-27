"use client";

import { Funcionario } from "@/src/model/funcionario";
import { Button } from "@heroui/react";
import TipoViagem from "../tipoViagem";
import { useState } from "react";
import { DateValue, RangeCalendar, RangeValue } from "@heroui/react";
import {
  today,
  getLocalTimeZone,
  isWeekend,
  getDayOfWeek,
} from "@internationalized/date";
import {
  Checkbox,
  TimeField,
  Label,
  type TimeValue,
} from "@heroui/react";
import { DateInputGroup } from "@heroui/react/date-input-group";
import type { DateSegment } from "@react-stately/datepicker";
import { Switch } from "@heroui/react";
import { useLocale } from "@react-aria/i18n";
import SelectCooperativas from "../select/cooperativas";
import SelectCentrosCusto from "../select/centros-custo";
import LocationEntry, {
  EMPTY_LOCATION,
  LocationFormState,
} from "../components/location-entry";
import { Modal } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Avatar } from "@heroui/react";
import { Card } from "@heroui/react";
import ShowToast from "@/src/components/Toast";
import { fetchComLog } from "@/src/utils/log-fetch";

interface LocationDTO {
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

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

const DEFAULT_PERIOD = {
  start: today(getLocalTimeZone()),
  end: today(getLocalTimeZone()).add({ weeks: 4 }),
};

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
  const [horaViagem, setHoraViagem] = useState<TimeValue | null>(null);
  const [horaRetorno, setHoraRetorno] = useState<TimeValue | null>(null);
  const [cooperativa, setCooperativa] = useState<string>("");
  const [centroCusto, setCentroCusto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<RangeValue<DateValue> | null>(DEFAULT_PERIOD);

  // Locais da rota (opcionais — se omitidos, o backend usa endereços cadastrados)
  const [isFlexibleTrip, setIsFlexibleTrip] = useState(false);
  const [origin, setOrigin] = useState<LocationFormState>({ ...EMPTY_LOCATION });
  const [destination, setDestination] = useState<LocationFormState>({ ...EMPTY_LOCATION });
  const [intermediateStops, setIntermediateStops] = useState<LocationFormState[]>([]);

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

  const buildLocationDTO = (loc: LocationFormState): LocationDTO => {
    if (!loc.place) throw new Error("Place is required");

    const dto: LocationDTO = {
      lat: loc.place.geometry.location.lat,
      lng: loc.place.geometry.location.lng,
      name: loc.place.name,
      address: loc.place.formatted_address,
    };

    if (loc.place.place_id) dto.placeId = loc.place.place_id;
    if (loc.nome.trim()) dto.nome = loc.nome.trim();
    if (loc.whatsapp.trim()) dto.whatsapp = loc.whatsapp.trim();
    if (loc.email.trim()) dto.email = loc.email.trim();
    if (loc.observacoes.trim()) dto.observacoes = loc.observacoes.trim();

    return dto;
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

    if (isFlexibleTrip) {
      if (!origin.place) {
        ShowToast({ color: "danger", title: "Selecione o local de origem!" });
        return false;
      }
      if (!destination.place) {
        ShowToast({ color: "danger", title: "Selecione o local de destino!" });
        return false;
      }
      for (let i = 0; i < intermediateStops.length; i++) {
        if (!intermediateStops[i].place) {
          ShowToast({
            color: "danger",
            title: `Selecione o local da parada ${i + 1}!`,
          });
          return false;
        }
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
      horaViagem: TimeValue | null;
      horaRetorno?: TimeValue | null;
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
      horaRetorno: selectedPlan === "APANHA_E_RETORNO" ? horaRetorno : undefined,
    };

    if (isFlexibleTrip) {
      requestData.origin = buildLocationDTO(origin);
      requestData.destination = buildLocationDTO(destination);

      if (intermediateStops.length > 0) {
        requestData.intermediateCoordinates = intermediateStops.map(buildLocationDTO);
      }
    }

    if (centroCusto) {
      requestData.centroCustoId = parseInt(centroCusto);
    }

    return requestData;
  }

  const resetForm = () => {
    setSelectedPlan("");
    setCooperativa("");
    setCentroCusto("");
    setEvitarFinsDeSemana(false);
    setEvitarDomingos(false);
    setHoraViagem(null);
    setHoraRetorno(null);
    setValue(DEFAULT_PERIOD);
    setIsFlexibleTrip(false);
    setOrigin({ ...EMPTY_LOCATION });
    setDestination({ ...EMPTY_LOCATION });
    setIntermediateStops([]);
  };

  async function requestViagem() {
    setIsLoading(true);
    const data = generateDataToRequest();

    try {
      const response = await fetchComLog(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/criar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        ShowToast({
          color: "danger",
          title: "Erro ao programar a viagem. Tente novamente mais tarde.",
        });
        return;
      }

      ShowToast({ color: "success", title: "Programação criada com sucesso!" });
      resetForm();
      onOpen(false);
    } catch (error) {
      console.error("Erro ao programar viagem:", error);
      ShowToast({
        color: "danger",
        title: "Erro ao programar a viagem. Tente novamente mais tarde.",
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
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpen}>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>
                    Programar Viagem
                    <p className="text-sm text-muted font-normal">
                      Configure uma viagem recorrente para os passageiros selecionados
                    </p>
                  </Modal.Heading>
                </Modal.Header>

                <Modal.Body className="gap-6">
              {/* Passageiros selecionados */}
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:users-group-rounded-linear" className="text-lg" />
                    <span className="text-sm font-medium">
                      Passageiros ({passagers.length})
                    </span>
                  </div>
                </Card.Header>
                <Card.Content className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {passagers.map((passager) => (
                      <Chip key={passager.id} variant="tertiary" color="accent">
                        <Avatar size="sm">
                          <Avatar.Fallback>
                            {passager.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </Avatar.Fallback>
                        </Avatar>
                        {passager.name}
                      </Chip>
                    ))}
                  </div>
                </Card.Content>
              </Card>

              {/* Cooperativa e tipo de viagem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectCooperativas
                  setCooperativa={setCooperativa}
                  empresa={empresa}
                  token={token}
                />
                <TipoViagem selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
              </div>

              {/* Toggle para viagem personalizada */}
              <div className="flex items-center justify-between p-4 bg-default rounded-lg">
                <div>
                  <h4 className="text-sm font-medium">Viagem Personalizada</h4>
                  <p className="text-xs text-muted">
                    Definir locais de origem e destino personalizados
                  </p>
                </div>
                <Switch
                  isSelected={isFlexibleTrip}
                  onChange={setIsFlexibleTrip}
                  aria-label="Ativar viagem personalizada"
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
              </div>

              {!isFlexibleTrip ? (
                <p className="text-xs text-muted">
                  <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5 inline mr-1" />
                  O sistema usará automaticamente o endereço cadastrado dos passageiros e da
                  empresa conforme o tipo de viagem.
                </p>
              ) : (
                <div className="space-y-4">
                  <LocationEntry
                    label="Origem"
                    placeholder="Buscar local de origem..."
                    icon="solar:routing-2-linear"
                    location={origin}
                    onPlaceSelect={(place) => updateLocation(setOrigin, { place })}
                    onUpdate={(updates) => updateLocation(setOrigin, updates)}
                  />

                  {intermediateStops.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <Icon icon="solar:map-point-wave-linear" className="text-muted" />
                        <span className="text-xs font-medium text-muted">
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
                          onPlaceSelect={(place) => updateIntermediateStop(index, { place })}
                          onUpdate={(updates) => updateIntermediateStop(index, updates)}
                          onRemove={() => removeIntermediateStop(index)}
                        />
                      ))}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="tertiary"
                    onPress={addIntermediateStop}
                    className="w-full"
                  >
                    <Icon icon="solar:add-circle-linear" />
                    Adicionar parada intermediária
                  </Button>

                  <LocationEntry
                    label="Destino"
                    placeholder="Buscar local de destino..."
                    icon="solar:flag-linear"
                    location={destination}
                    onPlaceSelect={(place) => updateLocation(setDestination, { place })}
                    onUpdate={(updates) => updateLocation(setDestination, updates)}
                  />
                </div>
              )}

              <SelectCentrosCusto
                empresa={empresa}
                setCentroCusto={setCentroCusto}
                initialCentroCusto={centroCusto}
                token={token}
              />

              <div className="h-px bg-gray-200 dark:bg-gray-700" />

              {/* Período e horários */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                    Período da Viagem
                  </h3>
                  <div className="space-y-4">
                    <RangeCalendar
                      aria-label="Data da Viagem"
                      value={value}
                      onChange={setValue}
                      isDateUnavailable={(date) =>
                        (evitarFinsDeSemana && isWeekend(date, locale)) ||
                        (evitarDomingos && getDayOfWeek(date, locale) === 0)
                      }
                      className="w-full"
                    >
                      <RangeCalendar.Header>
                        <RangeCalendar.Heading />
                        <RangeCalendar.NavButton slot="previous" />
                        <RangeCalendar.NavButton slot="next" />
                      </RangeCalendar.Header>
                      <RangeCalendar.Grid className="w-full">
                        <RangeCalendar.GridHeader>
                          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                        </RangeCalendar.GridHeader>
                        <RangeCalendar.GridBody>
                          {(date) => <RangeCalendar.Cell date={date} />}
                        </RangeCalendar.GridBody>
                      </RangeCalendar.Grid>
                    </RangeCalendar>
                    <div className="space-y-2">
                      <Checkbox
                        id="evitar-fins-de-semana"
                        onChange={() => setEvitarFinsDeSemana(!evitarFinsDeSemana)}
                        isSelected={evitarFinsDeSemana}
                      >
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <span className="text-sm">Evitar fins de semana</span>
                        </Checkbox.Content>
                      </Checkbox>
                      <Checkbox
                        id="evitar-domingos"
                        onChange={() => setEvitarDomingos(!evitarDomingos)}
                        isSelected={evitarDomingos}
                      >
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <span className="text-sm">Evitar domingos</span>
                        </Checkbox.Content>
                      </Checkbox>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                    Horários
                  </h3>
                  <div className="space-y-4">
                    <TimeField
                      hourCycle={24}
                      isRequired
                      onChange={setHoraViagem}
                      value={horaViagem}
                    >
                      <Label>
                        {selectedPlan === "RETORNO"
                          ? "Hora do retorno"
                          : selectedPlan === "APANHA_E_RETORNO"
                            ? "Hora da apanha"
                            : "Hora da viagem"}
                      </Label>
                      <DateInputGroup variant="secondary">
                        <DateInputGroup.Input>
                          {(segment: DateSegment) => <DateInputGroup.Segment segment={segment} />}
                        </DateInputGroup.Input>
                      </DateInputGroup>
                    </TimeField>
                    {selectedPlan === "APANHA_E_RETORNO" && (
                      <TimeField
                        hourCycle={24}
                        isRequired
                        onChange={setHoraRetorno}
                        value={horaRetorno}
                      >
                        <Label>Hora do retorno</Label>
                        <DateInputGroup variant="secondary">
                          <DateInputGroup.Input>
                            {(segment: DateSegment) => <DateInputGroup.Segment segment={segment} />}
                          </DateInputGroup.Input>
                        </DateInputGroup>
                      </TimeField>
                    )}
                  </div>
                </div>
              </div>
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="tertiary" onPress={close} isDisabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleSolicitarViagem}
                    isPending={isLoading}
                  >
                    {!isLoading && <Icon icon="solar:calendar-add-linear" className="w-4 h-4" />}
                    {isLoading ? "Programando..." : "Programar Viagem"}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
