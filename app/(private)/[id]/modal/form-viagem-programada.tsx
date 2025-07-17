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
import { Select, SelectItem } from "@heroui/select";
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
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

interface LocalDTO {
  tipo: "PASSAGEIRO" | "EMPRESA" | "ALTERNATIVO";
  empresaId?: string;
  placeId?: string;
  nome?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

const LOCATION_OPTIONS = [
  { key: "EMPRESA", label: "Empresa", icon: "solar:buildings-3-linear" },
  { key: "PASSAGEIRO", label: "Casa do Passageiro", icon: "solar:home-linear" },
  {
    key: "ALTERNATIVO",
    label: "Local Personalizado",
    icon: "solar:location-linear",
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
  const [horaViagem, setHoraViagem] = useState<TimeInputValue | null>(null);
  const [horaRetorno, setHoraRetorno] = useState<TimeInputValue | null>(null);
  const [cooperativa, setCooperativa] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<RangeValue<DateValue> | null>({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 4 }),
  });

  // Estados para locais personalizados
  const [isFlexibleTrip, setIsFlexibleTrip] = useState(false);
  const [origemTipo, setOrigemTipo] = useState<string>("PASSAGEIRO");
  const [destinoTipo, setDestinoTipo] = useState<string>("EMPRESA");
  const [origemCustom, setOrigemCustom] = useState<PlaceDetails | null>(null);
  const [destinoCustom, setDestinoCustom] = useState<PlaceDetails | null>(null);

  const createLocalDTO = (
    tipo: string,
    customPlace?: PlaceDetails | null
  ): LocalDTO => {
    const local: LocalDTO = { tipo: tipo as LocalDTO["tipo"] };

    if (tipo === "EMPRESA") {
      local.empresaId = empresa;
    } else if (tipo === "ALTERNATIVO" && customPlace) {
      local.placeId = customPlace.place_id;
      local.nome = customPlace.name;
      local.latitude = customPlace.geometry.location.lat;
      local.longitude = customPlace.geometry.location.lng;

      // Usa componentes de endereço estruturados se disponíveis
      if (customPlace.address_components) {
        const getAddressComponent = (types: string[]) => {
          const component = customPlace.address_components?.find((comp) =>
            types.some((type) => comp.types.includes(type))
          );
          return component?.long_name || "";
        };

        const getShortAddressComponent = (types: string[]) => {
          const component = customPlace.address_components?.find((comp) =>
            types.some((type) => comp.types.includes(type))
          );
          return component?.short_name || "";
        };

        // Mapeia os componentes corretamente
        local.rua =
          getAddressComponent(["route"]) ||
          getAddressComponent(["street_address"]);
        local.numero = getAddressComponent(["street_number"]);
        local.bairro = getAddressComponent([
          "sublocality",
          "sublocality_level_1",
        ]);
        local.cidade = getAddressComponent([
          "locality",
          "administrative_area_level_2",
        ]);
        local.estado = getShortAddressComponent([
          "administrative_area_level_1",
        ]);
        local.cep = getAddressComponent(["postal_code"]);
      } else {
        // Fallback para parsing manual se não houver componentes estruturados
        const addressParts = customPlace.formatted_address.split(", ");
        if (addressParts.length >= 1) {
          local.rua = addressParts[0];
          if (addressParts.length >= 3) {
            local.cidade = addressParts[addressParts.length - 3] || "";
            local.estado =
              addressParts[addressParts.length - 2]?.split(" ")[0] || "";
            local.cep = addressParts[addressParts.length - 1] || "";
          }
        }
      }
    }

    return local;
  };

  const isProgramacaoFlexivel = (): boolean => {
    return isFlexibleTrip;
  };

  const validateFlexibleTrip = (): boolean => {
    if (!isProgramacaoFlexivel()) return true;

    if (origemTipo === "ALTERNATIVO" && !origemCustom) {
      ShowToast({
        color: "danger",
        title: "Selecione o local de origem personalizado",
      });
      return false;
    }

    if (destinoTipo === "ALTERNATIVO" && !destinoCustom) {
      ShowToast({
        color: "danger",
        title: "Selecione o local de destino personalizado",
      });
      return false;
    }

    return true;
  };

  // Função de validação
  function validate() {
    const cidades = passagers.map((passager) => passager.cidade);

    if (!selectedPlan) {
      ShowToast({
        color: "danger",
        title: "Selecione um plano de viagem!",
      });
      return false;
    }

    if (new Set(cidades).size !== 1) {
      ShowToast({
        color: "danger",
        title: "Todos os passageiros devem ser da mesma cidade!",
      });
      return false;
    }

    if (!validateFlexibleTrip()) {
      return false;
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
      ShowToast({
        color: "danger",
        title: "Informe a hora do retorno!",
      });
      return false;
    }

    return true;
  }

  // Função para gerar os dados do request
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
      origens?: LocalDTO[];
      destinos?: LocalDTO[];
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

    // Adiciona locais personalizados se for programação flexível
    if (isProgramacaoFlexivel()) {
      // Origens
      const origens = [];
      if (origemTipo === "EMPRESA") {
        origens.push(createLocalDTO("EMPRESA"));
      } else if (origemTipo === "ALTERNATIVO" && origemCustom) {
        origens.push(createLocalDTO("ALTERNATIVO", origemCustom));
      } else if (origemTipo === "PASSAGEIRO") {
        // Para passageiros múltiplos, criamos uma origem para cada um
        passagers.forEach(() => {
          origens.push(createLocalDTO("PASSAGEIRO"));
        });
      }

      // Destinos
      const destinos = [];
      if (destinoTipo === "EMPRESA") {
        destinos.push(createLocalDTO("EMPRESA"));
      } else if (destinoTipo === "ALTERNATIVO" && destinoCustom) {
        destinos.push(createLocalDTO("ALTERNATIVO", destinoCustom));
      } else if (destinoTipo === "PASSAGEIRO") {
        // Para passageiros múltiplos, criamos um destino para cada um
        passagers.forEach(() => {
          destinos.push(createLocalDTO("PASSAGEIRO"));
        });
      }

      requestData.origens = origens;
      requestData.destinos = destinos;
    }

    return requestData;
  }

  // Função para realizar a solicitação da viagem
  async function requestViagem() {
    setIsLoading(true);
    const data = generateDataToRequest();

    console.log("[Programação] JSON enviado:", JSON.stringify(data, null, 2));

    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/criar`;
      console.log(`[Programação] POST para: ${url}`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log(
        "[Programação] Status da resposta:",
        response.status,
        response.statusText
      );
      let responseBody = null;
      try {
        responseBody = await response.clone().json();
        console.log("[Programação] Body da resposta:", responseBody);
      } catch {
        try {
          responseBody = await response.clone().text();
          console.log("[Programação] Body da resposta (texto):", responseBody);
        } catch {
          console.log(
            "[Programação] Body da resposta: não foi possível ler o corpo."
          );
        }
      }

      if (!response.ok) {
        console.error("[Programação] Erro na resposta:", response.statusText);
        ShowToast({
          color: "danger",
          title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
        });
        return;
      }
      // Se a resposta for bem-sucedida, faça algo com os dados retornados
      if (response.ok) {
        // fechar o modal
        onOpen(false);
        return ShowToast({
          color: "success",
          title: "Programação solicitada com sucesso!",
        });
      }

      // Se a resposta não for bem-sucedida, trate o erro
      console.error(
        "[Programação] Erro ao solicitar a viagem:",
        response.statusText
      );
      ShowToast({
        color: "danger",
        title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
      });
      return null;
    } catch (error) {
      console.error("[Programação] Exceção:", error);
      ShowToast({
        color: "danger",
        title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
      console.log("[Programação] Fim do ciclo de requisição POST.");
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
                {/* Cooperativa */}
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

                {/* Tipo de Viagem */}
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

              {/* Programação Personalizada */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">
                    <Icon
                      icon="solar:settings-linear"
                      className="w-4 h-4 inline mr-2"
                    />
                    Programação Personalizada
                  </label>
                  <Button
                    size="sm"
                    variant={isFlexibleTrip ? "solid" : "bordered"}
                    color={isFlexibleTrip ? "primary" : "default"}
                    onPress={() => setIsFlexibleTrip(!isFlexibleTrip)}
                  >
                    {isFlexibleTrip ? "Ativado" : "Desativado"}
                  </Button>
                </div>

                {isFlexibleTrip && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-default-50 rounded-lg border">
                    {/* Origem */}
                    <div>
                      <Select
                        label="Origem"
                        placeholder="Selecione o tipo de origem"
                        selectedKeys={new Set([origemTipo])}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;
                          setOrigemTipo(selected);
                          if (selected !== "ALTERNATIVO") {
                            setOrigemCustom(null);
                          }
                        }}
                        size="sm"
                        variant="bordered"
                      >
                        {LOCATION_OPTIONS.map((option) => (
                          <SelectItem key={option.key} textValue={option.label}>
                            <div className="flex items-center gap-2">
                              <Icon icon={option.icon} className="text-sm" />
                              <span className="text-sm">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>

                      {origemTipo === "ALTERNATIVO" && (
                        <div className="mt-2">
                          <PlacesAutocomplete
                            label="Local de origem"
                            onPlaceSelect={setOrigemCustom}
                            placeholder="Buscar local de origem..."
                          />
                        </div>
                      )}
                    </div>

                    {/* Destino */}
                    <div>
                      <Select
                        label="Destino"
                        placeholder="Selecione o tipo de destino"
                        selectedKeys={new Set([destinoTipo])}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;
                          setDestinoTipo(selected);
                          if (selected !== "ALTERNATIVO") {
                            setDestinoCustom(null);
                          }
                        }}
                        size="sm"
                        variant="bordered"
                      >
                        {LOCATION_OPTIONS.map((option) => (
                          <SelectItem key={option.key} textValue={option.label}>
                            <div className="flex items-center gap-2">
                              <Icon icon={option.icon} className="text-sm" />
                              <span className="text-sm">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>

                      {destinoTipo === "ALTERNATIVO" && (
                        <div className="mt-2">
                          <PlacesAutocomplete
                            label="Local de destino"
                            onPlaceSelect={setDestinoCustom}
                            placeholder="Buscar local de destino..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
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
