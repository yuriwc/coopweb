"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/scripts/firebase-config";
import "leaflet/dist/leaflet.css";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ViagemRealTime } from "@/src/model/viagem";
import ViagemInfoCards from "@/src/components/ViagemInfoCards";
import type { Map } from "leaflet";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { cn } from "@heroui/theme";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

// Função para criar ícone do motorista com rotação - seta de navegação
const createMotoristaIcon = (direcaoGraus: number = 0) => {
  return L.divIcon({
    html: `
      <div style="
        width: 40px; 
        height: 40px; 
        transform: rotate(${direcaoGraus}deg);
        transform-origin: center;
        transition: transform 0.3s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0070f3;
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 12px solid white;
          transform: translateY(-2px);
        "></div>
      </div>
    `,
    className: "custom-navigation-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Ícones customizados fixos
const origemIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3177/3177361.png", // Ícone de GPS
  iconSize: [44, 44],
});

const destinoIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", // Ícone de pessoa
  iconSize: [44, 44],
});

const Page = () => {
  const [viagem, setViagem] = useState<ViagemRealTime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const mapRef = useRef<Map | null>(null);
  const params = useParams();
  const motoristaID = params?.motorista as string;
  const cooperativaID = params?.cooperativa as string;
  const router = useRouter();

  // Funções de controle do mapa
  const centerOnDriver = useCallback(() => {
    if (
      mapRef.current &&
      viagem?.latitudeMotorista !== undefined &&
      viagem?.longitudeMotorista !== undefined
    ) {
      mapRef.current.setView(
        [viagem.latitudeMotorista, viagem.longitudeMotorista],
        18
      );
    }
  }, [viagem?.latitudeMotorista, viagem?.longitudeMotorista]);

  const zoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const toggleFullScreen = useCallback(() => {
    const mapElement = document.querySelector(".map-container");
    if (mapElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapElement.requestFullscreen();
      }
    }
  }, []);

  // Adicionar estilo CSS para ícone rotacionado
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .custom-navigation-icon {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Função para obter informações do status de conexão
  const getConnectionInfo = () => {
    switch (connectionStatus) {
      case "connecting":
        return {
          color: "warning" as const,
          icon: "solar:loading-circle-broken",
          text: "Conectando...",
          pulse: true,
        };
      case "connected":
        return {
          color: "success" as const,
          icon: "solar:wifi-router-bold",
          text: "Conectado",
          pulse: true,
        };
      case "disconnected":
        return {
          color: "danger" as const,
          icon: "solar:wifi-router-broken",
          text: "Desconectado",
          pulse: false,
        };
    }
  };

  const connectionInfo = getConnectionInfo();

  useEffect(() => {
    if (!motoristaID) return;

    setConnectionStatus("connecting");
    setIsLoading(true);

    const viagensRef = ref(
      database,
      `${cooperativaID}/motorista/${motoristaID}/dadosDaViagem`
    );

    const unsubscribe = onValue(
      viagensRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setViagem(snapshot.val());
          setConnectionStatus("connected");
          setLastUpdate(new Date());
        } else {
          setConnectionStatus("disconnected");
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao conectar:", error);
        setConnectionStatus("disconnected");
        setIsLoading(false);
      }
    );

    return () => {
      off(viagensRef);
      unsubscribe();
    };
  }, [motoristaID, cooperativaID]);

  // Efeito para centralizar o mapa sempre que a localização do motorista mudar
  useEffect(() => {
    if (
      mapRef.current &&
      viagem?.latitudeMotorista !== undefined &&
      viagem?.longitudeMotorista !== undefined
    ) {
      mapRef.current.setView([
        viagem.latitudeMotorista,
        viagem.longitudeMotorista,
      ]);
    }
  }, [viagem?.latitudeMotorista, viagem?.longitudeMotorista]);

  console.log(viagem);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Modernizado */}
      <Card className="mx-4 mt-4 mb-6 shadow-lg border-none bg-content1">
        <CardHeader className="flex-col items-start space-y-4 pb-6">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="bordered"
              startContent={<Icon icon="solar:arrow-left-linear" />}
              onPress={() => router.back()}
              className="font-medium"
            >
              Voltar
            </Button>

            <div className="flex items-center gap-3">
              <Chip
                startContent={
                  <Icon
                    icon={connectionInfo.icon}
                    className={cn(
                      "w-4 h-4",
                      connectionInfo.pulse && "animate-spin"
                    )}
                  />
                }
                color={connectionInfo.color}
                variant="flat"
                size="sm"
              >
                {connectionInfo.text}
              </Chip>

              {lastUpdate && connectionStatus === "connected" && (
                <Chip variant="flat" color="default" size="sm">
                  <Icon
                    icon="solar:clock-circle-linear"
                    className="w-3 h-3 mr-1"
                  />
                  {lastUpdate.toLocaleTimeString()}
                </Chip>
              )}
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center gap-3 mb-2">
              <Icon
                icon="solar:map-point-favourite-bold"
                className="w-6 h-6 text-primary"
              />
              <h1 className="text-2xl font-bold text-foreground">
                Monitoramento em Tempo Real
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-500">
              <div className="flex items-center gap-2">
                <Icon icon="solar:buildings-2-linear" className="w-4 h-4" />
                <span>
                  Cooperativa: <strong>{cooperativaID}</strong>
                </span>
              </div>
              <Divider orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Icon icon="solar:user-circle-linear" className="w-4 h-4" />
                <span>
                  Motorista: <strong>{motoristaID}</strong>
                </span>
              </div>
              {viagem?.statusViagem && (
                <>
                  <Divider orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:routing-linear" className="w-4 h-4" />
                    <span>
                      Status: <strong>{viagem.statusViagem}</strong>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="p-8 bg-content1">
            <CardBody className="text-center space-y-4">
              <Spinner size="lg" color="primary" />
              <h3 className="text-lg font-semibold">
                Carregando dados da viagem...
              </h3>
              <p className="text-foreground-500">
                Conectando ao sistema de monitoramento
              </p>
            </CardBody>
          </Card>
        </div>
      ) : viagem ? (
        <div className="px-4 pb-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Container do Mapa */}
            <Card className="map-container overflow-hidden shadow-xl border-none bg-content1">
              <CardHeader className="flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:map-linear"
                    className="w-5 h-5 text-primary"
                  />
                  <h3 className="text-lg font-semibold">
                    Localização em Tempo Real
                  </h3>
                </div>

                {/* Controles do Mapa */}
                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={centerOnDriver}
                    className="min-w-8 h-8"
                    isDisabled={!viagem.latitudeMotorista}
                  >
                    <Icon icon="solar:target-linear" className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={zoomIn}
                    className="min-w-8 h-8"
                  >
                    <Icon
                      icon="solar:magnifer-zoom-in-linear"
                      className="w-4 h-4"
                    />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={zoomOut}
                    className="min-w-8 h-8"
                  >
                    <Icon
                      icon="solar:magnifer-zoom-out-linear"
                      className="w-4 h-4"
                    />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={toggleFullScreen}
                    className="min-w-8 h-8"
                  >
                    <Icon icon="solar:full-screen-linear" className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardBody className="p-0">
                <div className="h-[400px] lg:h-[500px] xl:h-[600px] w-full">
                  {viagem.latitudeMotorista !== undefined &&
                  viagem.longitudeMotorista !== undefined ? (
                    <MapContainer
                      center={[
                        viagem.latitudeMotorista,
                        viagem.longitudeMotorista,
                      ]}
                      zoom={20}
                      scrollWheelZoom={true}
                      className="h-full w-full"
                      // @ts-expect-error react-leaflet whenReady event type is not compatible, but we need the map instance
                      whenReady={(event) => {
                        mapRef.current = event.target;
                      }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                      />

                      <Polyline
                        positions={[
                          [viagem.latitudeMotorista, viagem.longitudeMotorista],
                          [viagem.latitudeDestino, viagem.longitudeDestino],
                        ]}
                        pathOptions={{
                          color: "#0070f3",
                          dashArray: "8 12",
                          weight: 4,
                          opacity: 0.8,
                        }}
                      />

                      <Marker
                        position={[
                          viagem.latitudeMotorista,
                          viagem.longitudeMotorista,
                        ]}
                        icon={createMotoristaIcon(
                          viagem.direcaoGraus || viagem.direcao || 0
                        )}
                      >
                        <Popup className="text-sm">
                          <div className="space-y-1">
                            <div className="font-semibold text-primary">
                              🧭 MOTORISTA
                            </div>
                            <div className="text-xs text-foreground-500">
                              {viagem.latitudeMotorista.toFixed(6)},{" "}
                              {viagem.longitudeMotorista.toFixed(6)}
                            </div>
                            <div className="text-xs">
                              Velocidade: {viagem.velocidade || 0} km/h
                            </div>
                          </div>
                        </Popup>
                      </Marker>

                      <Marker
                        position={[
                          viagem.latitudeOrigem,
                          viagem.longitudeOrigem,
                        ]}
                        icon={origemIcon}
                      >
                        <Popup className="text-sm">
                          <div className="space-y-1">
                            <div className="font-semibold text-success">
                              📍 ORIGEM (GPS)
                            </div>
                            <div className="text-xs">
                              {viagem.enderecoEmpresa}
                            </div>
                          </div>
                        </Popup>
                      </Marker>

                      <Marker
                        position={[
                          viagem.latitudeDestino,
                          viagem.longitudeDestino,
                        ]}
                        icon={destinoIcon}
                      >
                        <Popup className="text-sm">
                          <div className="space-y-1">
                            <div className="font-semibold text-warning">
                              👤 DESTINO (PASSAGEIRO)
                            </div>
                            <div className="text-xs">
                              {viagem.passageiros?.[0]?.cidade || "Destino"}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-content2">
                      <div className="text-center space-y-4">
                        <Spinner size="lg" color="primary" />
                        <div>
                          <h4 className="font-semibold text-foreground">
                            Aguardando localização
                          </h4>
                          <p className="text-sm text-foreground-500">
                            Esperando dados de GPS do motorista...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Painel de Informações Modernizado */}
            <Card className="shadow-xl border-none bg-content1">
              <CardHeader className="flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:chart-square-linear"
                    className="w-5 h-5 text-primary"
                  />
                  <h3 className="text-lg font-semibold">Dados da Viagem</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Chip
                    startContent={
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          connectionStatus === "connected"
                            ? "bg-success animate-pulse"
                            : "bg-danger"
                        )}
                      />
                    }
                    color={
                      connectionStatus === "connected" ? "success" : "danger"
                    }
                    variant="flat"
                    size="sm"
                  >
                    {connectionStatus === "connected" ? "ONLINE" : "OFFLINE"}
                  </Chip>
                </div>
              </CardHeader>

              <Divider />

              <CardBody className="space-y-6 max-h-[600px] overflow-y-auto">
                <ViagemInfoCards viagem={viagem} />

                {/* Informações Adicionais */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground-600 flex items-center gap-2">
                    <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
                    Informações Técnicas
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viagem.latitudeMotorista && viagem.longitudeMotorista && (
                      <Card className="bg-content2/50">
                        <CardBody className="py-3 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon
                              icon="solar:gps-linear"
                              className="w-4 h-4 text-primary"
                            />
                            <span className="text-xs font-medium text-foreground-600">
                              Coordenadas
                            </span>
                          </div>
                          <p className="text-xs text-foreground-500 font-mono">
                            {viagem.latitudeMotorista.toFixed(6)},{" "}
                            {viagem.longitudeMotorista.toFixed(6)}
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    {viagem.direcaoGraus && (
                      <Card className="bg-content2/50">
                        <CardBody className="py-3 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon
                              icon="solar:compass-linear"
                              className="w-4 h-4 text-warning"
                            />
                            <span className="text-xs font-medium text-foreground-600">
                              Direção
                            </span>
                          </div>
                          <p className="text-xs text-foreground-500">
                            {viagem.direcaoGraus}° {viagem.direcao || ""}
                          </p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="p-8 bg-content1">
            <CardBody className="text-center space-y-4">
              <Icon
                icon="solar:danger-circle-linear"
                className="w-16 h-16 mx-auto text-danger"
              />
              <h3 className="text-lg font-semibold">Nenhum dado encontrado</h3>
              <p className="text-foreground-500">
                Não foi possível carregar os dados da viagem
              </p>
              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="solar:refresh-linear" />}
                onPress={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Page;
