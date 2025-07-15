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
import { Select, SelectItem } from "@heroui/select";

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

interface ViagemUnificadaRequest {
  empresaID: string;
  cooperativaID: string;
  passageiros: { passageiroID: string }[];
  tipoViagem?: "Apanha" | "Retorno";
  centroCustoId?: number;
  origem?: LocalDTO;
  destino?: LocalDTO;
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
  { key: "ALTERNATIVO", label: "Local Personalizado", icon: "solar:location-linear" },
];

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
  
  // Estados para viagem flexível
  const [isFlexibleTrip, setIsFlexibleTrip] = useState(false);
  const [origemTipo, setOrigemTipo] = useState<string>("PASSAGEIRO");
  const [destinoTipo, setDestinoTipo] = useState<string>("EMPRESA");
  const [origemCustom, setOrigemCustom] = useState<PlaceDetails | null>(null);
  const [destinoCustom, setDestinoCustom] = useState<PlaceDetails | null>(null);

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

  const createLocalDTO = (tipo: string, customPlace?: PlaceDetails | null): LocalDTO => {
    const local: LocalDTO = { tipo: tipo as LocalDTO["tipo"] };

    if (tipo === "ALTERNATIVO" && customPlace) {
      local.placeId = customPlace.place_id;
      local.nome = customPlace.name;
      local.latitude = customPlace.geometry.location.lat;
      local.longitude = customPlace.geometry.location.lng;

      // Usa componentes de endereço estruturados se disponíveis
      if (customPlace.address_components) {
        const getAddressComponent = (types: string[]) => {
          const component = customPlace.address_components?.find(comp =>
            types.some(type => comp.types.includes(type))
          );
          return component?.long_name || "";
        };

        const getShortAddressComponent = (types: string[]) => {
          const component = customPlace.address_components?.find(comp =>
            types.some(type => comp.types.includes(type))
          );
          return component?.short_name || "";
        };

        // Mapeia os componentes corretamente
        local.rua = getAddressComponent(['route']) || getAddressComponent(['street_address']);
        local.numero = getAddressComponent(['street_number']);
        local.bairro = getAddressComponent(['sublocality', 'sublocality_level_1']);
        local.cidade = getAddressComponent(['locality', 'administrative_area_level_2']);
        local.estado = getShortAddressComponent(['administrative_area_level_1']);
        local.cep = getAddressComponent(['postal_code']);
      } else {
        // Fallback para parsing manual se não houver componentes estruturados
        const addressParts = customPlace.formatted_address.split(", ");
        if (addressParts.length >= 1) {
          local.rua = addressParts[0];
          if (addressParts.length >= 3) {
            local.cidade = addressParts[addressParts.length - 3] || "";
            local.estado = addressParts[addressParts.length - 2]?.split(" ")[0] || "";
            local.cep = addressParts[addressParts.length - 1] || "";
          }
        }
      }
    }

    return local;
  };

  const isViagemFlexivel = (): boolean => {
    return isFlexibleTrip && (origemTipo === "ALTERNATIVO" || destinoTipo === "ALTERNATIVO");
  };

  const validateFlexibleTrip = (): boolean => {
    if (!isViagemFlexivel()) return true;

    if (origemTipo === "ALTERNATIVO" && !origemCustom) {
      ShowToast({ color: "danger", title: "Selecione o local de origem personalizado" });
      return false;
    }

    if (destinoTipo === "ALTERNATIVO" && !destinoCustom) {
      ShowToast({ color: "danger", title: "Selecione o local de destino personalizado" });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!cooperativa) {
      ShowToast({ color: "danger", title: "Selecione uma cooperativa" });
      return;
    }

    if (!validateFlexibleTrip()) {
      return;
    }

    setIsLoading(true);

    try {
      const requestBody: ViagemUnificadaRequest = {
        empresaID: empresa,
        cooperativaID: cooperativa,
        passageiros: passagers.map(p => ({ passageiroID: p.id })),
      };

      // Adicionar centro de custo se selecionado
      if (centroCusto) {
        requestBody.centroCustoId = parseInt(centroCusto);
      }

      // Detectar automaticamente o tipo de viagem
      if (isViagemFlexivel()) {
        // Viagem flexível - adicionar origem e destino
        requestBody.origem = createLocalDTO(origemTipo, origemCustom);
        requestBody.destino = createLocalDTO(destinoTipo, destinoCustom);
      } else {
        // Viagem normal - apenas tipoViagem
        requestBody.tipoViagem = selectedPlan as "Apanha" | "Retorno";
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
        
        // Reset form
        setSelectedPlan("Apanha");
        setCooperativa("");
        setCentroCusto("");
        setIsFlexibleTrip(false);
        setOrigemTipo("PASSAGEIRO");
        setDestinoTipo("EMPRESA");
        setOrigemCustom(null);
        setDestinoCustom(null);
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
    if (isViagemFlexivel()) {
      const origem = origemTipo === "ALTERNATIVO" ? origemCustom?.name || "Local personalizado" :
                    origemTipo === "PASSAGEIRO" ? "Casa do passageiro" : "Empresa";
      const destino = destinoTipo === "ALTERNATIVO" ? destinoCustom?.name || "Local personalizado" :
                     destinoTipo === "PASSAGEIRO" ? "Casa do passageiro" : "Empresa";
      return `${origem} → ${destino}`;
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
                            getInitials={(name) => name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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

              {/* Toggle para viagem flexível */}
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
                // Viagem normal
                <TipoViagemSimples
                  setSelectedPlan={setSelectedPlan}
                />
              ) : (
                // Viagem flexível
                <div className="space-y-4">
                  {/* Origem */}
                  <div>
                    <Select
                      label="Origem"
                      placeholder="Selecione o tipo de origem"
                      selectedKeys={new Set([origemTipo])}
                      defaultSelectedKeys={new Set(["PASSAGEIRO"])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setOrigemTipo(selected);
                        if (selected !== "ALTERNATIVO") {
                          setOrigemCustom(null);
                        }
                      }}
                      aria-label="Selecionar tipo de origem da viagem"
                    >
                      {LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.key} textValue={option.label}>
                          <div className="flex items-center gap-2">
                            <Icon icon={option.icon} className="text-lg" />
                            <span>{option.label}</span>
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
                      defaultSelectedKeys={new Set(["EMPRESA"])}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setDestinoTipo(selected);
                        if (selected !== "ALTERNATIVO") {
                          setDestinoCustom(null);
                        }
                      }}
                      aria-label="Selecionar tipo de destino da viagem"
                    >
                      {LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.key} textValue={option.label}>
                          <div className="flex items-center gap-2">
                            <Icon icon={option.icon} className="text-lg" />
                            <span>{option.label}</span>
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
                startContent={!isLoading && <Icon icon="solar:paper-bin-trash-linear" />}
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