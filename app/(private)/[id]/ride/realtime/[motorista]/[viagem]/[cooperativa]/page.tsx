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
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/react/spinner";
import { cn } from "@heroui/react";

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
          const data = snapshot.val();
          console.log("Dados da viagem (Firebase):", JSON.stringify(data, null, 2));
          setViagem(data);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onPress={() => router.back()}>
              <Icon icon="solar:arrow-left-linear" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Monitoramento em Tempo Real
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Cooperativa <strong className="font-medium text-gray-700 dark:text-gray-300">{cooperativaID}</strong>
                {" · "}
                Motorista <strong className="font-medium text-gray-700 dark:text-gray-300">{motoristaID}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip color={connectionInfo.color} variant="tertiary" size="sm">
              <Icon
                icon={connectionInfo.icon}
                className={cn("w-4 h-4", connectionInfo.pulse && "animate-spin")}
              />
              {connectionInfo.text}
            </Chip>
            {lastUpdate && connectionStatus === "connected" && (
              <Chip variant="tertiary" color="default" size="sm">
                <Icon icon="solar:clock-circle-linear" className="w-3 h-3" />
                {lastUpdate.toLocaleTimeString()}
              </Chip>
            )}
            {viagem?.statusViagem && (
              <Chip variant="tertiary" color="accent" size="sm">
                <Icon icon="solar:routing-linear" className="w-3 h-3" />
                {viagem.statusViagem}
              </Chip>
            )}
          </div>
        </header>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <Card.Content className="flex flex-col items-center justify-center text-center py-24">
              <Spinner size="lg" color="accent" className="mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Carregando dados da viagem...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Conectando ao sistema de monitoramento
              </p>
            </Card.Content>
          </Card>
        ) : viagem ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Card do Mapa */}
            <Card className="map-container">
              <Card.Header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon icon="solar:map-linear" className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Localização em Tempo Real
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="tertiary"
                    onPress={centerOnDriver}
                    isDisabled={!viagem.latitudeMotorista}
                    aria-label="Centralizar no motorista"
                  >
                    <Icon icon="solar:target-linear" className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="tertiary"
                    onPress={zoomIn}
                    aria-label="Aumentar zoom"
                  >
                    <Icon icon="solar:magnifer-zoom-in-linear" className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="tertiary"
                    onPress={zoomOut}
                    aria-label="Diminuir zoom"
                  >
                    <Icon icon="solar:magnifer-zoom-out-linear" className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="tertiary"
                    onPress={toggleFullScreen}
                    aria-label="Tela cheia"
                  >
                    <Icon icon="solar:full-screen-linear" className="w-4 h-4" />
                  </Button>
                </div>
              </Card.Header>

              <Card.Content>
                <div className="h-[400px] lg:h-[500px] xl:h-[600px] w-full rounded-xl overflow-hidden">
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

                        {viagem.latitudeDestino != null &&
                          viagem.longitudeDestino != null && (
                          <Polyline
                            positions={[
                              [
                                viagem.latitudeMotorista,
                                viagem.longitudeMotorista,
                              ],
                              [viagem.latitudeDestino, viagem.longitudeDestino],
                            ]}
                            pathOptions={{
                              color: "#0070f3",
                              dashArray: "8 12",
                              weight: 4,
                              opacity: 0.8,
                            }}
                          />
                        )}

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
                              <div className="font-semibold text-accent">
                                🧭 MOTORISTA
                              </div>
                              <div className="text-xs text-muted">
                                {viagem.latitudeMotorista.toFixed(6)},{" "}
                                {viagem.longitudeMotorista.toFixed(6)}
                              </div>
                              <div className="text-xs">
                                Velocidade: {viagem.velocidade || 0} km/h
                              </div>
                            </div>
                          </Popup>
                        </Marker>

                        {viagem.latitudeOrigem != null &&
                          viagem.longitudeOrigem != null && (
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
                        )}

                        {viagem.latitudeDestino != null &&
                          viagem.longitudeDestino != null && (
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
                        )}
                      </MapContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                          <Spinner size="lg" color="accent" />
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              Aguardando localização
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Esperando dados de GPS do motorista...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </Card.Content>
            </Card>

            {/* Card de Informações */}
            <Card>
              <Card.Header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon icon="solar:chart-square-linear" className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Dados da Viagem
                  </h3>
                </div>

                <Chip
                  color={connectionStatus === "connected" ? "success" : "danger"}
                  variant="tertiary"
                  size="sm"
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      connectionStatus === "connected"
                        ? "bg-success animate-pulse"
                        : "bg-danger"
                    )}
                  />
                  {connectionStatus === "connected" ? "ONLINE" : "OFFLINE"}
                </Chip>
              </Card.Header>

              <Card.Content className="space-y-4 max-h-[600px] overflow-y-auto">
                <ViagemInfoCards viagem={viagem} />

                {/* Informações Adicionais */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
                    Informações Técnicas
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viagem.latitudeMotorista && viagem.longitudeMotorista && (
                      <div className="bg-default-50 dark:bg-default-100/10 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon icon="solar:gps-linear" className="w-4 h-4 text-accent" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Coordenadas
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {viagem.latitudeMotorista.toFixed(6)},{" "}
                          {viagem.longitudeMotorista.toFixed(6)}
                        </p>
                      </div>
                    )}

                    {viagem.direcaoGraus && (
                      <div className="bg-default-50 dark:bg-default-100/10 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon icon="solar:compass-linear" className="w-4 h-4 text-warning" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Direção
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {viagem.direcaoGraus}° {viagem.direcao || ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        ) : (
          <Card>
            <Card.Content className="flex flex-col items-center text-center py-24">
              <div className="w-16 h-16 mb-4 rounded-full bg-warning-soft flex items-center justify-center">
                <Icon icon="solar:danger-circle-linear" className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum dado encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Não foi possível carregar os dados da viagem
              </p>
              <Button variant="tertiary" onPress={() => router.refresh()}>
                <Icon icon="solar:refresh-linear" />
                Tentar Novamente
              </Button>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Page;
