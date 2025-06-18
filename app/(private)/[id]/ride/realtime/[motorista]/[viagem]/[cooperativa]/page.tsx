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
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/spinner";
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
    <div className="min-h-screen relative overflow-hidden bg-blue-50/50 dark:bg-gray-900">
      {/* Liquid Glass Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100/40 via-cyan-50/30 to-sky-100/40 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-emerald-950/40" />
      <div className="fixed inset-0 backdrop-blur-[2px]" />

      {/* Dynamic Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-32 right-20 w-24 h-24 bg-cyan-200/20 dark:bg-purple-400/10 rounded-full blur-xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-sky-200/20 dark:bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-300/15 dark:bg-blue-500/8 rounded-full blur-2xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-cyan-300/15 dark:bg-cyan-500/8 rounded-full blur-2xl animate-pulse delay-1200" />
      </div>

      <div className="relative z-10">
        {/* Liquid Glass Header */}
        <header className="mx-4 mt-4 mb-6 relative group">
          {/* Glass Effect Background */}
          <div className="absolute inset-0 bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/40 dark:border-white/10 shadow-2xl shadow-blue-500/15 dark:shadow-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/[0.08] via-cyan-400/[0.08] to-sky-400/[0.08] dark:from-blue-500/[0.03] dark:via-purple-500/[0.03] dark:to-emerald-500/[0.03] rounded-2xl" />

          {/* Crystalline Border Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-blue-300/30 dark:via-white/10 to-transparent p-[1px]">
            <div className="h-full w-full rounded-2xl bg-transparent" />
          </div>

          <div className="relative p-6 rounded-2xl transition-all duration-700 group-hover:backdrop-blur-2xl">
            <div className="flex flex-col space-y-4">
              {/* Linha principal com Voltar + Título + Status */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-blue-200/40 dark:border-white/20 rounded-xl p-3 transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10">
                    <Button
                      variant="light"
                      startContent={
                        <Icon
                          icon="solar:arrow-left-linear"
                          className="text-gray-700 dark:text-gray-300"
                        />
                      }
                      onPress={() => router.back()}
                      className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Voltar
                    </Button>
                  </div>

                  {/* Título ao lado do botão */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Icon
                        icon="solar:map-point-favourite-bold"
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-lg">
                      Monitoramento em Tempo Real
                    </h1>
                  </div>
                </div>

                {/* Status de conexão */}
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-blue-200/30 dark:border-white/10 rounded-xl px-3 py-2">
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
                      className="bg-transparent"
                    >
                      {connectionInfo.text}
                    </Chip>
                  </div>

                  {lastUpdate && connectionStatus === "connected" && (
                    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-blue-200/30 dark:border-white/10 rounded-xl px-3 py-2">
                      <Chip
                        variant="flat"
                        color="default"
                        size="sm"
                        className="bg-transparent"
                      >
                        <Icon
                          icon="solar:clock-circle-linear"
                          className="w-3 h-3 mr-1"
                        />
                        {lastUpdate.toLocaleTimeString()}
                      </Chip>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações das tags */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <Icon
                    icon="solar:buildings-2-linear"
                    className="w-4 h-4 text-blue-500 dark:text-blue-400"
                  />
                  <span>
                    Cooperativa:{" "}
                    <strong className="text-gray-800 dark:text-white">
                      {cooperativaID}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <Icon
                    icon="solar:user-circle-linear"
                    className="w-4 h-4 text-cyan-500 dark:text-cyan-400"
                  />
                  <span>
                    Motorista:{" "}
                    <strong className="text-gray-800 dark:text-white">
                      {motoristaID}
                    </strong>
                  </span>
                </div>
                {viagem?.statusViagem && (
                  <div className="flex items-center gap-2 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <Icon
                      icon="solar:routing-linear"
                      className="w-4 h-4 text-emerald-500 dark:text-emerald-400"
                    />
                    <span>
                      Status:{" "}
                      <strong className="text-gray-800 dark:text-white">
                        {viagem.statusViagem}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="relative">
              <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-blue-200/25 dark:border-white/5" />
              <div className="relative p-12 rounded-3xl text-center">
                <Spinner size="lg" color="primary" className="mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Carregando dados da viagem...
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Conectando ao sistema de monitoramento
                </p>
              </div>
            </div>
          </div>
        ) : viagem ? (
          <div className="px-4 pb-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Container do Mapa com Glass Effect */}
              <div className="map-container relative group">
                <div className="absolute inset-0 bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-white/10 shadow-xl shadow-blue-400/15 dark:shadow-blue-500/5" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.06] via-cyan-400/[0.04] to-sky-400/[0.06] dark:from-blue-500/[0.02] dark:via-cyan-500/[0.02] dark:to-sky-500/[0.02] rounded-2xl" />

                <div className="relative p-4 rounded-2xl">
                  {/* Map Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Icon
                          icon="solar:map-linear"
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Localização em Tempo Real
                      </h3>
                    </div>

                    {/* Map Controls */}
                    <div className="flex items-center gap-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-xl p-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={centerOnDriver}
                        className="min-w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                        isDisabled={!viagem.latitudeMotorista}
                      >
                        <Icon icon="solar:target-linear" className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={zoomIn}
                        className="min-w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                      >
                        <Icon
                          icon="solar:magnifer-zoom-in-linear"
                          className="w-4 h-4"
                        />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={zoomOut}
                        className="min-w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                      >
                        <Icon
                          icon="solar:magnifer-zoom-out-linear"
                          className="w-4 h-4"
                        />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={toggleFullScreen}
                        className="min-w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                      >
                        <Icon
                          icon="solar:full-screen-linear"
                          className="w-4 h-4"
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Map Container */}
                  <div className="h-[400px] lg:h-[500px] xl:h-[600px] w-full rounded-xl overflow-hidden bg-white/5 dark:bg-white/5 backdrop-blur-sm">
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
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                          <Spinner size="lg" color="primary" />
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
                </div>
              </div>

              {/* Painel de Informações com Glass Effect */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/[0.18] dark:bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-white/10 shadow-xl shadow-blue-400/15 dark:shadow-blue-500/5" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/[0.06] via-cyan-400/[0.04] to-sky-400/[0.06] dark:from-blue-500/[0.02] dark:via-cyan-500/[0.02] dark:to-sky-500/[0.02] rounded-2xl" />

                <div className="relative p-4 rounded-2xl">
                  {/* Info Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Icon
                          icon="solar:chart-square-linear"
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Dados da Viagem
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-xl px-3 py-1.5">
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
                          connectionStatus === "connected"
                            ? "success"
                            : "danger"
                        }
                        variant="flat"
                        size="sm"
                        className="bg-transparent"
                      >
                        {connectionStatus === "connected"
                          ? "ONLINE"
                          : "OFFLINE"}
                      </Chip>
                    </div>
                  </div>

                  <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-300/30 dark:via-white/10 to-transparent mb-6" />

                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    <ViagemInfoCards viagem={viagem} />

                    {/* Informações Adicionais */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Icon
                          icon="solar:info-circle-linear"
                          className="w-4 h-4"
                        />
                        Informações Técnicas
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {viagem.latitudeMotorista &&
                          viagem.longitudeMotorista && (
                            <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon
                                  icon="solar:gps-linear"
                                  className="w-4 h-4 text-blue-500 dark:text-blue-400"
                                />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Coordenadas
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                                {viagem.latitudeMotorista.toFixed(6)},{" "}
                                {viagem.longitudeMotorista.toFixed(6)}
                              </p>
                            </div>
                          )}

                        {viagem.direcaoGraus && (
                          <div className="bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon
                                icon="solar:compass-linear"
                                className="w-4 h-4 text-orange-500 dark:text-orange-400"
                              />
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Direção
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {viagem.direcaoGraus}° {viagem.direcao || ""}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="relative">
              <div className="absolute inset-0 bg-white/[0.15] dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-orange-200/25 dark:border-white/5" />
              <div className="relative p-12 rounded-3xl text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-orange-100/50 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <Icon
                      icon="solar:danger-circle-linear"
                      className="w-8 h-8 text-orange-500 dark:text-orange-400"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Nenhum dado encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Não foi possível carregar os dados da viagem
                </p>
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-xl p-3 inline-block">
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<Icon icon="solar:refresh-linear" />}
                    onPress={() => window.location.reload()}
                    className="bg-transparent"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
