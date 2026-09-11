"use client";

import { useState, useEffect, useCallback } from "react";
import { Funcionario } from "@/src/model/funcionario";
import ShowToast from "@/src/components/Toast";
import SelectCooperativas from "../select/cooperativas";
import SelectCentrosCusto from "../select/centros-custo";
import { EMPTY_LOCATION, LocationFormState } from "../components/location-entry";
import { Modal } from "@heroui/react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { fetchComLog } from "@/src/utils/log-fetch";
import {
  BlocoTrajeto,
  ListaPassageiros,
  OpcaoViagem,
  Secao,
  SeletorTipoViagem,
} from "./partes";

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

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

// Os valores são os que a API espera — o texto visível fica só no título.
const TIPOS_VIAGEM: OpcaoViagem[] = [
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
      const response = await fetchComLog(
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

      const response = await fetchComLog(
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
        stopsCount > 0 ? ` (${stopsCount} parada${stopsCount > 1 ? "s" : ""})` : "";
      return `${originName} → ${destName}${stopsText}`;
    }

    return selectedPlan === "Apanha" ? "Casa → Trabalho" : "Trabalho → Casa";
  };

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpen}>
        <Modal.Container scroll="inside">
          {/* A largura fica no Dialog: é ele que carrega o max-w do tamanho,
              o Container é só o wrapper externo. */}
          <Modal.Dialog className="w-full max-w-4xl">
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>
                    Solicitar viagem
                    <p className="text-sm font-normal text-muted">
                      {passagers.length}{" "}
                      {passagers.length === 1 ? "passageiro" : "passageiros"} ·{" "}
                      {getTripTypeDescription()}
                    </p>
                  </Modal.Heading>
                </Modal.Header>

                {/* @container: as colunas reagem à largura do modal, não à da janela. */}
                <Modal.Body className="@container gap-6">
                  <Secao titulo="Passageiros">
                    <ListaPassageiros passageiros={passagers} />
                  </Secao>

                  {!isFlexibleTrip && (
                    <Secao titulo="Tipo de viagem">
                      <SeletorTipoViagem
                        opcoes={TIPOS_VIAGEM}
                        valor={selectedPlan}
                        onChange={setSelectedPlan}
                        rotulo="Tipo de viagem"
                        className="@xl:grid-cols-2"
                      />
                    </Secao>
                  )}

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
                    <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                      <SelectCooperativas
                        empresa={empresa}
                        setCooperativa={setCooperativa}
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
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="tertiary" onPress={close} isDisabled={isLoading}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onPress={handleSubmit} isPending={isLoading}>
                    {!isLoading && <Icon icon="solar:car-linear" className="size-4" />}
                    {isLoading ? "Criando..." : "Criar viagem"}
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
