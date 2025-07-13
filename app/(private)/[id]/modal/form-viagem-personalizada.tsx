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

export default function CustomTripModal({
  isOpen,
  onOpen,
  passagers,
  empresa,
  token,
}: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [cooperativa, setCooperativa] = useState<string>("");
  const [centroCusto, setCentroCusto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para origem e destino
  const [origemTipo, setOrigemTipo] = useState<string>("");
  const [destinoTipo, setDestinoTipo] = useState<string>("");
  const [origemPersonalizada, setOrigemPersonalizada] = useState<PlaceDetails | null>(null);
  const [destinoPersonalizado, setDestinoPersonalizado] = useState<PlaceDetails | null>(null);

  // Função para calcular centro de custo comum
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
        return centroCustoEncontrado.value.toString();
      }

      return "";
    } catch (error) {
      console.error("Erro ao buscar centros de custo:", error);
      return "";
    }
  }, [passagers, token]);

  // Atualiza o centro de custo quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      const updateCentroCusto = async () => {
        const commonCentroCusto = await getCommonCentroCusto();
        if (commonCentroCusto) {
          setCentroCusto(commonCentroCusto);
        }
      };

      updateCentroCusto();
    }
  }, [isOpen, getCommonCentroCusto]);

  // Função de validação
  function validate() {
    const cidades = passagers.map((passager) => passager.cidade);

    if (!selectedPlan) {
      ShowToast({
        color: "danger",
        title: "Selecione um plano de viagem",
      });
      return false;
    }

    if (!centroCusto) {
      ShowToast({
        color: "danger",
        title: "Selecione um centro de custo",
      });
      return false;
    }

    if (!origemTipo) {
      ShowToast({
        color: "danger",
        title: "Selecione o tipo de origem",
      });
      return false;
    }

    if (!destinoTipo) {
      ShowToast({
        color: "danger",
        title: "Selecione o tipo de destino",
      });
      return false;
    }

    if (origemTipo === "ALTERNATIVO" && !origemPersonalizada) {
      ShowToast({
        color: "danger",
        title: "Selecione o local de origem",
      });
      return false;
    }

    if (destinoTipo === "ALTERNATIVO" && !destinoPersonalizado) {
      ShowToast({
        color: "danger",
        title: "Selecione o local de destino",
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

    return true;
  }

  // Função para gerar os dados do request
  function generateDataToRequest() {
    const passagersData = passagers.map((passager) => ({
      passageiroID: passager.id
    }));

    const origemData: any = { 
      tipo: origemTipo
    };
    if (origemTipo === "ALTERNATIVO" && origemPersonalizada) {
      origemData.placeId = origemPersonalizada.place_id;
      origemData.nome = origemPersonalizada.name;
    }

    const destinoData: any = { 
      tipo: destinoTipo
    };
    if (destinoTipo === "ALTERNATIVO" && destinoPersonalizado) {
      destinoData.placeId = destinoPersonalizado.place_id;
      destinoData.nome = destinoPersonalizado.name;
    }

    return {
      empresaID: empresa,
      cooperativaID: cooperativa,
      passageiros: passagersData,
      tipoViagem: selectedPlan,
      centroCustoId: parseInt(centroCusto),
      origem: origemData,
      destino: destinoData,
    };
  }

  // Função para realizar a solicitação da viagem
  async function requestViagem() {
    const data = generateDataToRequest();
    
    // Log dos dados sendo enviados ao backend
    console.log("📤 Dados enviados para o backend:", JSON.stringify(data, null, 2));
    
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/viagem/flexivel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      await response.json();

      ShowToast({
        color: "success",
        title: "Viagem personalizada solicitada com sucesso!",
      });
    } catch (error) {
      console.error(error);
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
      onOpen(false);
    }
  }

  return (
    <>
      <Button
        variant="flat"
        color="warning"
        onPress={() => onOpen(true)}
        startContent={<Icon icon="solar:route-linear" className="w-4 h-4" />}
        className="backdrop-blur-sm bg-orange-500/10 hover:bg-orange-500/20 border border-orange-200/30 dark:border-orange-800/30 text-orange-700 dark:text-orange-300 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/25"
      >
        Viagem Personalizada
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpen}
        size="4xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          wrapper: "items-center justify-center p-4",
          base: "max-w-md sm:max-w-4xl max-h-[85vh] my-4",
          body: "p-0",
          header: "border-b-0 pb-2",
          footer: "border-t-0 pt-2",
        }}
      >
        <ModalContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-white/20 dark:border-white/10">
          {(onClose) => (
            <>
              <ModalHeader className="bg-gradient-to-r from-orange-50/80 to-yellow-50/80 dark:from-orange-950/40 dark:to-yellow-950/40 backdrop-blur-sm relative">
                <div className="flex items-center gap-3 w-full pr-10">
                  <div className="p-2 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl border border-orange-200/30 dark:border-orange-800/30">
                    <Icon
                      icon="solar:route-linear"
                      className="w-5 h-5 text-orange-600 dark:text-orange-400"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Viagem Personalizada
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Configure origem e destino personalizados
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
                  aria-label="Fechar modal"
                >
                  <Icon
                    icon="solar:close-linear"
                    className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  />
                </button>
              </ModalHeader>

              <ModalBody className="px-4 sm:px-6 py-4">
                <div className="space-y-4 sm:space-y-6">
                  {/* Passageiros Selecionados */}
                  <Card className="bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200/30 dark:border-orange-800/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:users-group-rounded-linear"
                            className="w-4 h-4 text-orange-600 dark:text-orange-400"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Passageiros ({passagers.length})
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      {passagers.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {passagers.map((passager) => (
                            <div
                              key={passager.id}
                              className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/30 dark:border-gray-700/30"
                            >
                              <Avatar
                                size="sm"
                                name={passager.name?.charAt(0).toUpperCase()}
                                className="w-8 h-8 text-xs bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {passager.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {passager.phone}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-2">
                          Nenhum colaborador selecionado
                        </p>
                      )}
                    </CardBody>
                  </Card>

                  {/* Grid Layout para configurações */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Cooperativa */}
                    <Card className="bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:buildings-3-linear"
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                          />
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Cooperativa
                          </label>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <SelectCooperativas
                          setCooperativa={setCooperativa}
                          empresa={empresa}
                          token={token}
                        />
                      </CardBody>
                    </Card>

                    {/* Centro de Custo */}
                    <Card className="bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:wallet-money-linear"
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          />
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Centro de Custo
                          </label>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <SelectCentrosCusto
                          setCentroCusto={setCentroCusto}
                          empresa={empresa}
                          token={token}
                          initialCentroCusto={centroCusto}
                        />
                      </CardBody>
                    </Card>
                  </div>

                  {/* Tipo de Viagem */}
                  <Card className="bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          icon="solar:route-linear"
                          className="w-4 h-4 text-amber-600 dark:text-amber-400"
                        />
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Tipo de Viagem
                        </label>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <TipoViagemSimples setSelectedPlan={setSelectedPlan} />
                    </CardBody>
                  </Card>

                  {/* Origem e Destino */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Origem */}
                    <Card className="bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:map-point-linear"
                            className="w-4 h-4 text-green-600 dark:text-green-400"
                          />
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Origem
                          </label>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0 space-y-3">
                        <Select
                          label="Tipo de origem"
                          placeholder="Selecione o tipo"
                          selectedKeys={origemTipo ? [origemTipo] : []}
                          onSelectionChange={(keys) => {
                            const key = Array.from(keys)[0] as string;
                            setOrigemTipo(key);
                            if (key !== "ALTERNATIVO") {
                              setOrigemPersonalizada(null);
                            }
                          }}
                        >
                          {LOCATION_OPTIONS.map((option) => (
                            <SelectItem key={option.key} startContent={<Icon icon={option.icon} className="w-4 h-4" />}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                        
                        {origemTipo === "ALTERNATIVO" && (
                          <PlacesAutocomplete
                            label="Local de origem"
                            placeholder="Digite o local de origem..."
                            onPlaceSelect={setOrigemPersonalizada}
                          />
                        )}
                      </CardBody>
                    </Card>

                    {/* Destino */}
                    <Card className="bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:map-point-wave-linear"
                            className="w-4 h-4 text-red-600 dark:text-red-400"
                          />
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Destino
                          </label>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0 space-y-3">
                        <Select
                          label="Tipo de destino"
                          placeholder="Selecione o tipo"
                          selectedKeys={destinoTipo ? [destinoTipo] : []}
                          onSelectionChange={(keys) => {
                            const key = Array.from(keys)[0] as string;
                            setDestinoTipo(key);
                            if (key !== "ALTERNATIVO") {
                              setDestinoPersonalizado(null);
                            }
                          }}
                        >
                          {LOCATION_OPTIONS.map((option) => (
                            <SelectItem key={option.key} startContent={<Icon icon={option.icon} className="w-4 h-4" />}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>

                        {destinoTipo === "ALTERNATIVO" && (
                          <PlacesAutocomplete
                            label="Local de destino"
                            placeholder="Digite o local de destino..."
                            onPlaceSelect={setDestinoPersonalizado}
                          />
                        )}
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="bg-gradient-to-r from-gray-50/80 to-gray-50/80 dark:from-gray-900/40 dark:to-gray-900/40 backdrop-blur-sm border-t border-gray-200/30 dark:border-gray-700/30">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    variant="light"
                    onPress={onClose}
                    className="order-2 sm:order-1 w-full sm:w-auto backdrop-blur-sm bg-gray-500/10 hover:bg-gray-500/20 border border-gray-200/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-300"
                    startContent={
                      <Icon
                        icon="solar:close-circle-linear"
                        className="w-4 h-4"
                      />
                    }
                  >
                    Cancelar
                  </Button>
                  <Button
                    color="warning"
                    onPress={handleSolicitarViagem}
                    isLoading={isLoading}
                    className="order-1 sm:order-2 w-full sm:w-auto backdrop-blur-sm bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    startContent={
                      !isLoading ? (
                        <Icon icon="solar:route-linear" className="w-4 h-4" />
                      ) : null
                    }
                  >
                    {isLoading ? "Solicitando..." : "Solicitar Viagem"}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}