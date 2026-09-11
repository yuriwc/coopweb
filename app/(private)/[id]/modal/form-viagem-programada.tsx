"use client";

import { Funcionario } from "@/src/model/funcionario";
import { Button } from "@heroui/react";
import { useState } from "react";
import { DateValue, RangeCalendar, RangeValue } from "@heroui/react";
import {
  today,
  getLocalTimeZone,
  isWeekend,
  getDayOfWeek,
} from "@internationalized/date";
import { Checkbox, TimeField, Label, type TimeValue } from "@heroui/react";
import { DateInputGroup } from "@heroui/react/date-input-group";
import type { DateSegment } from "@react-stately/datepicker";
import { useLocale } from "@react-aria/i18n";
import SelectCooperativas from "../select/cooperativas";
import SelectCentrosCusto from "../select/centros-custo";
import { EMPTY_LOCATION, LocationFormState } from "../components/location-entry";
import { Modal } from "@heroui/react";
import { Icon } from "@iconify/react";
import ShowToast from "@/src/components/Toast";
import { fetchComLog } from "@/src/utils/log-fetch";
import {
  BlocoTrajeto,
  ListaPassageiros,
  OpcaoViagem,
  Secao,
  SeletorTipoViagem,
} from "./partes";

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

// Os valores são os que a API espera — o texto visível fica só no título.
const PLANOS: OpcaoViagem[] = [
  {
    valor: "Apanha",
    titulo: "Apanha",
    descricao: "Casa → Trabalho",
    icone: "solar:home-2-linear",
  },
  {
    valor: "Retorno",
    titulo: "Retorno",
    descricao: "Trabalho → Casa",
    icone: "solar:buildings-2-linear",
  },
  {
    valor: "APANHA_E_RETORNO",
    titulo: "Apanha e retorno",
    descricao: "Ida e volta no mesmo dia",
    icone: "solar:refresh-circle-linear",
  },
];

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

  const ehApanhaERetorno = selectedPlan === "APANHA_E_RETORNO";
  const rotuloHoraPrincipal = ehApanhaERetorno
    ? "Hora da apanha"
    : selectedPlan === "Retorno"
      ? "Hora do retorno"
      : "Hora da viagem";

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

    if (!cooperativa) {
      ShowToast({ color: "danger", title: "Selecione uma cooperativa!" });
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
      ShowToast({ color: "danger", title: `Informe a ${rotuloHoraPrincipal.toLowerCase()}!` });
      return false;
    }

    if (ehApanhaERetorno && !horaRetorno) {
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
      horaRetorno: ehApanhaERetorno ? horaRetorno : undefined,
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
        <Modal.Container scroll="inside">
          {/* A largura fica no Dialog: é ele que carrega o max-w do tamanho,
              o Container é só o wrapper externo. */}
          <Modal.Dialog className="w-full max-w-6xl">
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>
                    Programar viagem
                    <p className="text-sm font-normal text-muted">
                      Viagem recorrente para {passagers.length}{" "}
                      {passagers.length === 1 ? "passageiro" : "passageiros"}
                    </p>
                  </Modal.Heading>
                </Modal.Header>

                {/* @container: as colunas reagem à largura do modal, não à da janela. */}
                <Modal.Body className="@container gap-6">
                  <Secao titulo="Passageiros">
                    <ListaPassageiros passageiros={passagers} />
                  </Secao>

                  <Secao titulo="Plano de viagem">
                    <SeletorTipoViagem
                      opcoes={PLANOS}
                      valor={selectedPlan}
                      onChange={setSelectedPlan}
                      rotulo="Plano de viagem"
                      className="@2xl:grid-cols-3"
                    />
                  </Secao>

                  {/* Período e horários lado a lado: o calendário tem largura
                      própria e precisa de uma coluna que caiba nela. */}
                  <div className="grid gap-6 @4xl:grid-cols-[auto_minmax(0,1fr)]">
                    <Secao titulo="Período">
                      <div className="space-y-4">
                        <RangeCalendar
                          aria-label="Período da viagem"
                          value={value}
                          onChange={setValue}
                          isDateUnavailable={(date) =>
                            (evitarFinsDeSemana && isWeekend(date, locale)) ||
                            (evitarDomingos && getDayOfWeek(date, locale) === 0)
                          }
                        >
                          <RangeCalendar.Header>
                            <RangeCalendar.Heading />
                            <RangeCalendar.NavButton slot="previous" />
                            <RangeCalendar.NavButton slot="next" />
                          </RangeCalendar.Header>
                          <RangeCalendar.Grid>
                            <RangeCalendar.GridHeader>
                              {(day) => (
                                <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                              )}
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
                    </Secao>

                    <div className="space-y-6">
                      <Secao titulo="Horários">
                        <div className="grid gap-4 @4xl:grid-cols-2">
                          <TimeField
                            hourCycle={24}
                            isRequired
                            onChange={setHoraViagem}
                            value={horaViagem}
                          >
                            <Label>{rotuloHoraPrincipal}</Label>
                            <DateInputGroup variant="secondary">
                              <DateInputGroup.Input>
                                {(segment: DateSegment) => (
                                  <DateInputGroup.Segment segment={segment} />
                                )}
                              </DateInputGroup.Input>
                            </DateInputGroup>
                          </TimeField>

                          {ehApanhaERetorno && (
                            <TimeField
                              hourCycle={24}
                              isRequired
                              onChange={setHoraRetorno}
                              value={horaRetorno}
                            >
                              <Label>Hora do retorno</Label>
                              <DateInputGroup variant="secondary">
                                <DateInputGroup.Input>
                                  {(segment: DateSegment) => (
                                    <DateInputGroup.Segment segment={segment} />
                                  )}
                                </DateInputGroup.Input>
                              </DateInputGroup>
                            </TimeField>
                          )}
                        </div>
                      </Secao>

                      <Secao titulo="Trajeto">
                        <BlocoTrajeto
                          ativo={isFlexibleTrip}
                          onAtivoChange={setIsFlexibleTrip}
                          origem={origin}
                          destino={destination}
                          paradas={intermediateStops}
                          onOrigemUpdate={(updates) => updateLocation(setOrigin, updates)}
                          onDestinoUpdate={(updates) => updateLocation(setDestination, updates)}
                          onParadaUpdate={updateIntermediateStop}
                          onParadaAdd={addIntermediateStop}
                          onParadaRemove={removeIntermediateStop}
                        />
                      </Secao>

                      <Secao titulo="Cobrança">
                        <div className="grid gap-4 @4xl:grid-cols-2">
                          <SelectCooperativas
                            setCooperativa={setCooperativa}
                            empresa={empresa}
                            token={token}
                          />
                          <SelectCentrosCusto
                            empresa={empresa}
                            setCentroCusto={setCentroCusto}
                            initialCentroCusto={centroCusto}
                            token={token}
                          />
                        </div>
                      </Secao>
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
                    {!isLoading && (
                      <Icon icon="solar:calendar-add-linear" className="size-4" />
                    )}
                    {isLoading ? "Programando..." : "Programar viagem"}
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
