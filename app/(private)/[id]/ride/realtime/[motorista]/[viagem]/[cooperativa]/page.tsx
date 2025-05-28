"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { database } from "@/scripts/firebase-config";
import "leaflet/dist/leaflet.css";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import CarIcon from "@/src/assets/car.png";
import CompanyIcon from "@/src/assets/office-building.png";
import { ViagemRealTime } from "@/src/model/viagem";
import type { Map } from "leaflet";

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

// Função para criar ícone do motorista com rotação
const createMotoristaIcon = (direcaoGraus: number = 0) => {
  return L.divIcon({
    html: `
      <div style="
        width: 40px; 
        height: 40px; 
        transform: rotate(${direcaoGraus}deg);
        transform-origin: center;
        transition: transform 0.3s ease-in-out;
        background-image: url('${CarIcon.src}');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      "></div>
    `,
    className: "custom-car-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Ícones customizados fixos
const origemIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [44, 44],
});

const destinoIcon = L.icon({
  iconUrl: CompanyIcon.src,
  iconSize: [48, 48],
});

const Page = () => {
  const [viagem, setViagem] = useState<ViagemRealTime | null>(null);
  const mapRef = useRef<Map | null>(null);
  const params = useParams();
  const motoristaID = params?.motorista as string;
  const cooperativaID = params?.cooperativa as string;
  const router = useRouter();

  // Adicionar estilo CSS para ícone rotacionado
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .custom-car-icon {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  console.log(cooperativaID, motoristaID);

  useEffect(() => {
    if (!motoristaID) return;

    const viagensRef = ref(
      database,
      `${cooperativaID}/motorista/${motoristaID}/dadosDaViagem`
    );
    const unsubscribe = onValue(viagensRef, (snapshot) => {
      if (snapshot.exists()) {
        setViagem(snapshot.val());
      }
    });

    return () => unsubscribe();
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
    <div className="w-full p-4 pb-20">
      <header className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <button
          className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 uppercase tracking-widest text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-light tracking-widest uppercase text-gray-900 dark:text-gray-100">
              Acompanhamento de Viagem
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Cooperativa: {cooperativaID} | Motorista: {motoristaID}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              MONITORAMENTO ATIVO
            </span>
          </div>
        </div>
      </header>

      {viagem ? (
        <div className="flex flex-col lg:flex-row gap-6 w-full min-h-0">
          {/* Mapa - proporção otimizada para desktop */}
          <div className="lg:w-1/2 w-full h-[400px] sm:h-[450px] lg:h-[calc(100vh-200px)] max-h-[650px] border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
            {viagem.latitudeMotorista !== undefined &&
            viagem.longitudeMotorista !== undefined ? (
              <MapContainer
                center={[viagem.latitudeMotorista, viagem.longitudeMotorista]}
                zoom={20}
                scrollWheelZoom={false}
                className="h-full w-full"
                // @ts-expect-error react-leaflet whenReady event type is not compatible, but we need the map instance
                whenReady={(event) => {
                  mapRef.current = event.target;
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  className="opacity-70"
                />

                <Polyline
                  positions={[
                    [viagem.latitudeMotorista, viagem.longitudeMotorista],
                    [viagem.latitudeDestino, viagem.longitudeDestino],
                  ]}
                  pathOptions={{
                    color: "#3b82f6",
                    dashArray: "8 12",
                    weight: 3,
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
                  <Popup className="font-mono text-xs uppercase tracking-wider">
                    <span style={{ color: "#000" }}>
                      MOTORISTA
                      <br />
                      {viagem.latitudeMotorista.toFixed(6)},{" "}
                      {viagem.longitudeMotorista.toFixed(6)}
                    </span>
                  </Popup>
                </Marker>

                <Marker
                  position={[viagem.latitudeOrigem, viagem.longitudeOrigem]}
                  icon={origemIcon}
                >
                  <Popup className="font-mono text-xs uppercase tracking-wider">
                    <span style={{ color: "#000" }}>
                      ORIGEM
                      <br />
                      {viagem.enderecoEmpresa}
                    </span>
                  </Popup>
                </Marker>

                <Marker
                  position={[viagem.latitudeDestino, viagem.longitudeDestino]}
                  icon={destinoIcon}
                >
                  <Popup className="font-mono text-xs uppercase tracking-wider">
                    <span style={{ color: "#000" }}>
                      DESTINO
                      <br />
                      {viagem.passageiros?.[0]?.cidade || "Destino"}
                    </span>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400 uppercase tracking-widest text-sm">
                    Aguardando localização do motorista...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Painel de Informações - Layout Simplificado */}
          <div className="lg:w-1/2 w-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm max-h-[calc(100vh-200px)]">
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* STATUS E PASSAGEIROS */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Status da Viagem
                  </h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        viagem.statusViagem?.toLowerCase() === "ativa" ||
                        viagem.statusViagem?.toLowerCase() === "em andamento"
                          ? "bg-green-500 animate-pulse"
                          : viagem.statusViagem?.toLowerCase() === "finalizada"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Em tempo real
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-3 rounded-lg border-2 ${(() => {
                      const status = viagem.statusViagem?.toLowerCase() || "";
                      if (status === "ativa" || status === "em andamento")
                        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700";
                      if (status === "finalizada")
                        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700";
                      if (status === "pausada")
                        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700";
                      return "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700";
                    })()}`}
                  >
                    <div className="flex items-center mb-1">
                      <span
                        className={`text-sm mr-1 ${(() => {
                          const status =
                            viagem.statusViagem?.toLowerCase() || "";
                          if (status === "ativa" || status === "em andamento")
                            return "text-green-600 dark:text-green-400";
                          if (status === "finalizada")
                            return "text-blue-600 dark:text-blue-400";
                          if (status === "pausada")
                            return "text-yellow-600 dark:text-yellow-400";
                          return "text-gray-600 dark:text-gray-400";
                        })()}`}
                      >
                        {(() => {
                          const status =
                            viagem.statusViagem?.toLowerCase() || "";
                          if (status === "ativa" || status === "em andamento")
                            return "🚗";
                          if (status === "finalizada") return "✅";
                          if (status === "pausada") return "⏸️";
                          return "❓";
                        })()}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Status atual
                      </p>
                    </div>
                    <p
                      className={`text-sm font-bold ${(() => {
                        const status = viagem.statusViagem?.toLowerCase() || "";
                        if (status === "ativa" || status === "em andamento")
                          return "text-green-700 dark:text-green-300";
                        if (status === "finalizada")
                          return "text-blue-700 dark:text-blue-300";
                        if (status === "pausada")
                          return "text-yellow-700 dark:text-yellow-300";
                        return "text-gray-700 dark:text-gray-300";
                      })()}`}
                    >
                      {viagem.statusViagem?.toUpperCase() || "INDEFINIDO"}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 border-2 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700 rounded-lg">
                    <div className="flex items-center mb-1">
                      <span className="text-purple-600 dark:text-purple-400 text-sm mr-1">
                        👥
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Passageiros
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {(() => {
                          if (!viagem.passageiros) return "Nenhum passageiro";
                          const passageirosArray = Array.isArray(
                            viagem.passageiros
                          )
                            ? viagem.passageiros
                            : Object.values(viagem.passageiros);
                          if (!passageirosArray.length)
                            return "Nenhum passageiro";
                          const nomes = (
                            passageirosArray as Array<{
                              nome?: string;
                              sobrenome?: string;
                            }>
                          )
                            .map((p) =>
                              p.nome ? `${p.nome} ${p.sobrenome ?? ""}` : ""
                            )
                            .filter(Boolean);
                          return nomes.length > 1
                            ? `${nomes[0]} +${nomes.length - 1}`
                            : nomes[0] || "N/A";
                        })()}
                      </p>
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        Total:{" "}
                        {(() => {
                          if (!viagem.passageiros) return 0;
                          const passageirosArray = Array.isArray(
                            viagem.passageiros
                          )
                            ? viagem.passageiros
                            : Object.values(viagem.passageiros);
                          return passageirosArray.length;
                        })()}{" "}
                        pessoa(s)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DADOS TÉCNICOS */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Dados do Veículo
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Velocidade */}
                  {(viagem.velocidadeKMH !== undefined ||
                    viagem.velocidade !== undefined) && (
                    <div
                      className={`text-center p-3 rounded-lg border-2 ${(() => {
                        const velocidade =
                          viagem.velocidadeKMH || viagem.velocidade || 0;
                        if (velocidade < 5)
                          return "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700";
                        if (velocidade < 30)
                          return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700";
                        if (velocidade < 60)
                          return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700";
                        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700";
                      })()}`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <span
                          className={`text-sm font-medium mr-1 ${(() => {
                            const velocidade =
                              viagem.velocidadeKMH || viagem.velocidade || 0;
                            if (velocidade < 5)
                              return "text-amber-600 dark:text-amber-400";
                            if (velocidade < 30)
                              return "text-green-600 dark:text-green-400";
                            if (velocidade < 60)
                              return "text-blue-600 dark:text-blue-400";
                            return "text-red-600 dark:text-red-400";
                          })()}`}
                        >
                          {(() => {
                            const velocidade =
                              viagem.velocidadeKMH || viagem.velocidade || 0;
                            if (velocidade < 5) return "🐌";
                            if (velocidade < 30) return "🚗";
                            if (velocidade < 60) return "🚙";
                            return "🏎️";
                          })()}
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Velocidade
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${(() => {
                          const velocidade =
                            viagem.velocidadeKMH || viagem.velocidade || 0;
                          if (velocidade < 5)
                            return "text-amber-700 dark:text-amber-300";
                          if (velocidade < 30)
                            return "text-green-700 dark:text-green-300";
                          if (velocidade < 60)
                            return "text-blue-700 dark:text-blue-300";
                          return "text-red-700 dark:text-red-300";
                        })()}`}
                      >
                        {(
                          viagem.velocidadeKMH ||
                          viagem.velocidade ||
                          0
                        ).toFixed(1)}{" "}
                        km/h
                      </p>
                      <p
                        className={`text-xs font-medium ${(() => {
                          const velocidade =
                            viagem.velocidadeKMH || viagem.velocidade || 0;
                          if (velocidade < 5)
                            return "text-amber-600 dark:text-amber-400";
                          if (velocidade < 30)
                            return "text-green-600 dark:text-green-400";
                          if (velocidade < 60)
                            return "text-blue-600 dark:text-blue-400";
                          return "text-red-600 dark:text-red-400";
                        })()}`}
                      >
                        {(() => {
                          const velocidade =
                            viagem.velocidadeKMH || viagem.velocidade || 0;
                          if (velocidade < 5) return "Parado";
                          if (velocidade < 30) return "Moderada";
                          if (velocidade < 60) return "Rápida";
                          return "Muito Rápida";
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Direção */}
                  {(viagem.direcaoGraus !== undefined ||
                    viagem.direcao !== undefined) && (
                    <div className="text-center p-3 bg-indigo-50 border-2 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <span
                          className="text-sm mr-1"
                          style={{
                            transform: `rotate(${
                              viagem.direcaoGraus || viagem.direcao || 0
                            }deg)`,
                            display: "inline-block",
                            transition: "transform 0.3s ease",
                          }}
                        >
                          🧭
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Direção
                        </p>
                      </div>
                      <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                        {(viagem.direcaoGraus || viagem.direcao || 0).toFixed(
                          0
                        )}
                        °
                      </p>
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {(() => {
                          const graus =
                            viagem.direcaoGraus || viagem.direcao || 0;
                          if (graus >= 337.5 || graus < 22.5) return "Norte";
                          if (graus >= 22.5 && graus < 67.5) return "Nordeste";
                          if (graus >= 67.5 && graus < 112.5) return "Leste";
                          if (graus >= 112.5 && graus < 157.5) return "Sudeste";
                          if (graus >= 157.5 && graus < 202.5) return "Sul";
                          if (graus >= 202.5 && graus < 247.5)
                            return "Sudoeste";
                          if (graus >= 247.5 && graus < 292.5) return "Oeste";
                          return "Noroeste";
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Precisão GPS */}
                  {(viagem.precisaoMetros !== undefined ||
                    viagem.precisao !== undefined) && (
                    <div
                      className={`text-center p-3 rounded-lg border-2 ${(() => {
                        const precisao =
                          viagem.precisaoMetros || viagem.precisao || 0;
                        if (precisao <= 5)
                          return "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700";
                        if (precisao <= 10)
                          return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700";
                        if (precisao <= 20)
                          return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700";
                        if (precisao <= 50)
                          return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700";
                        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700";
                      })()}`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <span
                          className={`text-sm mr-1 ${(() => {
                            const precisao =
                              viagem.precisaoMetros || viagem.precisao || 0;
                            if (precisao <= 5)
                              return "text-emerald-600 dark:text-emerald-400";
                            if (precisao <= 10)
                              return "text-green-600 dark:text-green-400";
                            if (precisao <= 20)
                              return "text-yellow-600 dark:text-yellow-400";
                            if (precisao <= 50)
                              return "text-orange-600 dark:text-orange-400";
                            return "text-red-600 dark:text-red-400";
                          })()}`}
                        >
                          {(() => {
                            const precisao =
                              viagem.precisaoMetros || viagem.precisao || 0;
                            if (precisao <= 5) return "🎯";
                            if (precisao <= 10) return "📍";
                            if (precisao <= 20) return "📌";
                            if (precisao <= 50) return "🔍";
                            return "❓";
                          })()}
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Precisão GPS
                        </p>
                      </div>
                      <p
                        className={`text-lg font-bold ${(() => {
                          const precisao =
                            viagem.precisaoMetros || viagem.precisao || 0;
                          if (precisao <= 5)
                            return "text-emerald-700 dark:text-emerald-300";
                          if (precisao <= 10)
                            return "text-green-700 dark:text-green-300";
                          if (precisao <= 20)
                            return "text-yellow-700 dark:text-yellow-300";
                          if (precisao <= 50)
                            return "text-orange-700 dark:text-orange-300";
                          return "text-red-700 dark:text-red-300";
                        })()}`}
                      >
                        ±
                        {(
                          viagem.precisaoMetros ||
                          viagem.precisao ||
                          0
                        ).toFixed(0)}
                        m
                      </p>
                      <p
                        className={`text-xs font-medium ${(() => {
                          const precisao =
                            viagem.precisaoMetros || viagem.precisao || 0;
                          if (precisao <= 5)
                            return "text-emerald-600 dark:text-emerald-400";
                          if (precisao <= 10)
                            return "text-green-600 dark:text-green-400";
                          if (precisao <= 20)
                            return "text-yellow-600 dark:text-yellow-400";
                          if (precisao <= 50)
                            return "text-orange-600 dark:text-orange-400";
                          return "text-red-600 dark:text-red-400";
                        })()}`}
                      >
                        {(() => {
                          const precisao =
                            viagem.precisaoMetros || viagem.precisao || 0;
                          if (precisao <= 5) return "Excelente";
                          if (precisao <= 10) return "Muito Boa";
                          if (precisao <= 20) return "Boa";
                          if (precisao <= 50) return "Moderada";
                          return "Baixa";
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Última Atualização */}
                  <div
                    className={`text-center p-3 rounded-lg border-2 ${(() => {
                      const timestamp =
                        viagem.timestampUltimaLocalizacao || viagem.timestamp;
                      if (timestamp) {
                        const diffMs =
                          Date.now() - new Date(timestamp).getTime();
                        const diffSecs = Math.floor(diffMs / 1000);
                        if (diffSecs < 30)
                          return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700";
                        if (diffSecs < 120)
                          return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700";
                        if (diffSecs < 300)
                          return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700";
                        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700";
                      }
                      return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700";
                    })()}`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <span
                        className={`text-sm mr-1 ${(() => {
                          const timestamp =
                            viagem.timestampUltimaLocalizacao ||
                            viagem.timestamp;
                          if (timestamp) {
                            const diffMs =
                              Date.now() - new Date(timestamp).getTime();
                            const diffSecs = Math.floor(diffMs / 1000);
                            if (diffSecs < 30)
                              return "text-green-600 dark:text-green-400";
                            if (diffSecs < 120)
                              return "text-yellow-600 dark:text-yellow-400";
                            if (diffSecs < 300)
                              return "text-orange-600 dark:text-orange-400";
                            return "text-red-600 dark:text-red-400";
                          }
                          return "text-green-600 dark:text-green-400";
                        })()}`}
                      >
                        {(() => {
                          const timestamp =
                            viagem.timestampUltimaLocalizacao ||
                            viagem.timestamp;
                          if (timestamp) {
                            const diffMs =
                              Date.now() - new Date(timestamp).getTime();
                            const diffSecs = Math.floor(diffMs / 1000);
                            if (diffSecs < 30) return "🟢";
                            if (diffSecs < 120) return "🟡";
                            if (diffSecs < 300) return "🟠";
                            return "🔴";
                          }
                          return "🟢";
                        })()}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Última Atualização
                      </p>
                    </div>
                    <p
                      className={`text-sm font-bold ${(() => {
                        const timestamp =
                          viagem.timestampUltimaLocalizacao || viagem.timestamp;
                        if (timestamp) {
                          const diffMs =
                            Date.now() - new Date(timestamp).getTime();
                          const diffSecs = Math.floor(diffMs / 1000);
                          if (diffSecs < 30)
                            return "text-green-700 dark:text-green-300";
                          if (diffSecs < 120)
                            return "text-yellow-700 dark:text-yellow-300";
                          if (diffSecs < 300)
                            return "text-orange-700 dark:text-orange-300";
                          return "text-red-700 dark:text-red-300";
                        }
                        return "text-green-700 dark:text-green-300";
                      })()}`}
                    >
                      {(() => {
                        const timestamp =
                          viagem.timestampUltimaLocalizacao || viagem.timestamp;
                        if (timestamp) {
                          const diffMs =
                            Date.now() - new Date(timestamp).getTime();
                          const diffSecs = Math.floor(diffMs / 1000);
                          const diffMins = Math.floor(diffSecs / 60);

                          if (diffSecs < 60) return `${diffSecs}s atrás`;
                          if (diffMins < 60) return `${diffMins}min atrás`;
                          return `${Math.floor(diffMins / 60)}h ${
                            diffMins % 60
                          }min`;
                        }
                        return "Agora";
                      })()}
                    </p>
                    <p
                      className={`text-xs font-medium ${(() => {
                        const timestamp =
                          viagem.timestampUltimaLocalizacao || viagem.timestamp;
                        if (timestamp) {
                          const diffMs =
                            Date.now() - new Date(timestamp).getTime();
                          const diffSecs = Math.floor(diffMs / 1000);
                          if (diffSecs < 30)
                            return "text-green-600 dark:text-green-400";
                          if (diffSecs < 120)
                            return "text-yellow-600 dark:text-yellow-400";
                          if (diffSecs < 300)
                            return "text-orange-600 dark:text-orange-400";
                          return "text-red-600 dark:text-red-400";
                        }
                        return "text-green-600 dark:text-green-400";
                      })()}`}
                    >
                      {(() => {
                        const timestamp =
                          viagem.timestampUltimaLocalizacao || viagem.timestamp;
                        if (timestamp) {
                          return new Date(timestamp).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          );
                        }
                        return new Date().toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* ESTIMATIVAS DE VIAGEM */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Estimativas de Viagem
                </h3>

                {viagem.latitudeMotorista !== undefined &&
                viagem.longitudeMotorista !== undefined ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`text-center p-3 rounded-lg border-2 ${(() => {
                          const lat1 = viagem.latitudeMotorista!;
                          const lon1 = viagem.longitudeMotorista!;
                          const lat2 = viagem.latitudeDestino;
                          const lon2 = viagem.longitudeDestino;

                          const R = 6371;
                          const dLat = ((lat2 - lat1) * Math.PI) / 180;
                          const dLon = ((lon2 - lon1) * Math.PI) / 180;
                          const a =
                            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos((lat1 * Math.PI) / 180) *
                              Math.cos((lat2 * Math.PI) / 180) *
                              Math.sin(dLon / 2) *
                              Math.sin(dLon / 2);
                          const c =
                            2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                          const distance = R * c;

                          if (distance < 0.1)
                            return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700";
                          if (distance < 1)
                            return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700";
                          if (distance < 5)
                            return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700";
                          return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700";
                        })()}`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          <span
                            className={`text-sm mr-1 ${(() => {
                              const lat1 = viagem.latitudeMotorista!;
                              const lon1 = viagem.longitudeMotorista!;
                              const lat2 = viagem.latitudeDestino;
                              const lon2 = viagem.longitudeDestino;

                              const R = 6371;
                              const dLat = ((lat2 - lat1) * Math.PI) / 180;
                              const dLon = ((lon2 - lon1) * Math.PI) / 180;
                              const a =
                                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos((lat1 * Math.PI) / 180) *
                                  Math.cos((lat2 * Math.PI) / 180) *
                                  Math.sin(dLon / 2) *
                                  Math.sin(dLon / 2);
                              const c =
                                2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                              const distance = R * c;

                              if (distance < 0.1)
                                return "text-green-600 dark:text-green-400";
                              if (distance < 1)
                                return "text-blue-600 dark:text-blue-400";
                              if (distance < 5)
                                return "text-yellow-600 dark:text-yellow-400";
                              return "text-orange-600 dark:text-orange-400";
                            })()}`}
                          >
                            {(() => {
                              const lat1 = viagem.latitudeMotorista!;
                              const lon1 = viagem.longitudeMotorista!;
                              const lat2 = viagem.latitudeDestino;
                              const lon2 = viagem.longitudeDestino;

                              const R = 6371;
                              const dLat = ((lat2 - lat1) * Math.PI) / 180;
                              const dLon = ((lon2 - lon1) * Math.PI) / 180;
                              const a =
                                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos((lat1 * Math.PI) / 180) *
                                  Math.cos((lat2 * Math.PI) / 180) *
                                  Math.sin(dLon / 2) *
                                  Math.sin(dLon / 2);
                              const c =
                                2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                              const distance = R * c;

                              if (distance < 0.1) return "🏁";
                              if (distance < 1) return "📍";
                              if (distance < 5) return "🚗";
                              return "🛣️";
                            })()}
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Distância até destino
                          </p>
                        </div>
                        <p
                          className={`text-lg font-bold ${(() => {
                            const lat1 = viagem.latitudeMotorista!;
                            const lon1 = viagem.longitudeMotorista!;
                            const lat2 = viagem.latitudeDestino;
                            const lon2 = viagem.longitudeDestino;

                            const R = 6371;
                            const dLat = ((lat2 - lat1) * Math.PI) / 180;
                            const dLon = ((lon2 - lon1) * Math.PI) / 180;
                            const a =
                              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                              Math.cos((lat1 * Math.PI) / 180) *
                                Math.cos((lat2 * Math.PI) / 180) *
                                Math.sin(dLon / 2) *
                                Math.sin(dLon / 2);
                            const c =
                              2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            const distance = R * c;

                            if (distance < 0.1)
                              return "text-green-700 dark:text-green-300";
                            if (distance < 1)
                              return "text-blue-700 dark:text-blue-300";
                            if (distance < 5)
                              return "text-yellow-700 dark:text-yellow-300";
                            return "text-orange-700 dark:text-orange-300";
                          })()}`}
                        >
                          {(() => {
                            const lat1 = viagem.latitudeMotorista!;
                            const lon1 = viagem.longitudeMotorista!;
                            const lat2 = viagem.latitudeDestino;
                            const lon2 = viagem.longitudeDestino;

                            const R = 6371;
                            const dLat = ((lat2 - lat1) * Math.PI) / 180;
                            const dLon = ((lon2 - lon1) * Math.PI) / 180;
                            const a =
                              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                              Math.cos((lat1 * Math.PI) / 180) *
                                Math.cos((lat2 * Math.PI) / 180) *
                                Math.sin(dLon / 2) *
                                Math.sin(dLon / 2);
                            const c =
                              2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            const distance = R * c;

                            return distance < 1
                              ? `${(distance * 1000).toFixed(0)}m`
                              : `${distance.toFixed(2)}km`;
                          })()}
                        </p>
                        <p
                          className={`text-xs font-medium ${(() => {
                            const lat1 = viagem.latitudeMotorista!;
                            const lon1 = viagem.longitudeMotorista!;
                            const lat2 = viagem.latitudeDestino;
                            const lon2 = viagem.longitudeDestino;

                            const R = 6371;
                            const dLat = ((lat2 - lat1) * Math.PI) / 180;
                            const dLon = ((lon2 - lon1) * Math.PI) / 180;
                            const a =
                              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                              Math.cos((lat1 * Math.PI) / 180) *
                                Math.cos((lat2 * Math.PI) / 180) *
                                Math.sin(dLon / 2) *
                                Math.sin(dLon / 2);
                            const c =
                              2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            const distance = R * c;

                            if (distance < 0.1)
                              return "text-green-600 dark:text-green-400";
                            if (distance < 1)
                              return "text-blue-600 dark:text-blue-400";
                            if (distance < 5)
                              return "text-yellow-600 dark:text-yellow-400";
                            return "text-orange-600 dark:text-orange-400";
                          })()}`}
                        >
                          {(() => {
                            const lat1 = viagem.latitudeMotorista!;
                            const lon1 = viagem.longitudeMotorista!;
                            const lat2 = viagem.latitudeDestino;
                            const lon2 = viagem.longitudeDestino;

                            const R = 6371;
                            const dLat = ((lat2 - lat1) * Math.PI) / 180;
                            const dLon = ((lon2 - lon1) * Math.PI) / 180;
                            const a =
                              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                              Math.cos((lat1 * Math.PI) / 180) *
                                Math.cos((lat2 * Math.PI) / 180) *
                                Math.sin(dLon / 2) *
                                Math.sin(dLon / 2);
                            const c =
                              2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            const distance = R * c;

                            if (distance < 0.1) return "Chegando";
                            if (distance < 1) return "Muito Próximo";
                            if (distance < 5) return "Próximo";
                            return "Distante";
                          })()}
                        </p>
                      </div>

                      {(viagem.velocidadeKMH || viagem.velocidade) && (
                        <div
                          className={`text-center p-3 rounded-lg border-2 ${(() => {
                            const velocidade =
                              viagem.velocidadeKMH || viagem.velocidade || 0;
                            if (velocidade === 0)
                              return "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700";

                            const lat1 = viagem.latitudeMotorista!;
                            const lon1 = viagem.longitudeMotorista!;
                            const lat2 = viagem.latitudeDestino;
                            const lon2 = viagem.longitudeDestino;

                            const R = 6371;
                            const dLat = ((lat2 - lat1) * Math.PI) / 180;
                            const dLon = ((lon2 - lon1) * Math.PI) / 180;
                            const a =
                              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                              Math.cos((lat1 * Math.PI) / 180) *
                                Math.cos((lat2 * Math.PI) / 180) *
                                Math.sin(dLon / 2) *
                                Math.sin(dLon / 2);
                            const c =
                              2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            const distanceKm = R * c;
                            const tempoHoras = distanceKm / velocidade;
                            const tempoMinutos = Math.round(tempoHoras * 60);

                            if (tempoMinutos <= 5)
                              return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700";
                            if (tempoMinutos <= 15)
                              return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700";
                            if (tempoMinutos <= 30)
                              return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700";
                            return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700";
                          })()}`}
                        >
                          <div className="flex items-center justify-center mb-1">
                            <span
                              className={`text-sm mr-1 ${(() => {
                                const velocidade =
                                  viagem.velocidadeKMH ||
                                  viagem.velocidade ||
                                  0;
                                if (velocidade === 0)
                                  return "text-gray-600 dark:text-gray-400";

                                const lat1 = viagem.latitudeMotorista!;
                                const lon1 = viagem.longitudeMotorista!;
                                const lat2 = viagem.latitudeDestino;
                                const lon2 = viagem.longitudeDestino;

                                const R = 6371;
                                const dLat = ((lat2 - lat1) * Math.PI) / 180;
                                const dLon = ((lon2 - lon1) * Math.PI) / 180;
                                const a =
                                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                  Math.cos((lat1 * Math.PI) / 180) *
                                    Math.cos((lat2 * Math.PI) / 180) *
                                    Math.sin(dLon / 2) *
                                    Math.sin(dLon / 2);
                                const c =
                                  2 *
                                  Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                const distanceKm = R * c;
                                const tempoHoras = distanceKm / velocidade;
                                const tempoMinutos = Math.round(
                                  tempoHoras * 60
                                );

                                if (tempoMinutos <= 5)
                                  return "text-green-600 dark:text-green-400";
                                if (tempoMinutos <= 15)
                                  return "text-blue-600 dark:text-blue-400";
                                if (tempoMinutos <= 30)
                                  return "text-yellow-600 dark:text-yellow-400";
                                return "text-orange-600 dark:text-orange-400";
                              })()}`}
                            >
                              {(() => {
                                const velocidade =
                                  viagem.velocidadeKMH ||
                                  viagem.velocidade ||
                                  0;
                                if (velocidade === 0) return "⏸️";

                                const lat1 = viagem.latitudeMotorista!;
                                const lon1 = viagem.longitudeMotorista!;
                                const lat2 = viagem.latitudeDestino;
                                const lon2 = viagem.longitudeDestino;

                                const R = 6371;
                                const dLat = ((lat2 - lat1) * Math.PI) / 180;
                                const dLon = ((lon2 - lon1) * Math.PI) / 180;
                                const a =
                                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                  Math.cos((lat1 * Math.PI) / 180) *
                                    Math.cos((lat2 * Math.PI) / 180) *
                                    Math.sin(dLon / 2) *
                                    Math.sin(dLon / 2);
                                const c =
                                  2 *
                                  Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                const distanceKm = R * c;
                                const tempoHoras = distanceKm / velocidade;
                                const tempoMinutos = Math.round(
                                  tempoHoras * 60
                                );

                                if (tempoMinutos <= 5) return "⚡";
                                if (tempoMinutos <= 15) return "⏰";
                                if (tempoMinutos <= 30) return "⏳";
                                return "🕐";
                              })()}
                            </span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Tempo estimado
                            </p>
                          </div>
                          <p
                            className={`text-lg font-bold ${(() => {
                              const velocidade =
                                viagem.velocidadeKMH || viagem.velocidade || 0;
                              if (velocidade === 0)
                                return "text-gray-700 dark:text-gray-300";

                              const lat1 = viagem.latitudeMotorista!;
                              const lon1 = viagem.longitudeMotorista!;
                              const lat2 = viagem.latitudeDestino;
                              const lon2 = viagem.longitudeDestino;

                              const R = 6371;
                              const dLat = ((lat2 - lat1) * Math.PI) / 180;
                              const dLon = ((lon2 - lon1) * Math.PI) / 180;
                              const a =
                                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos((lat1 * Math.PI) / 180) *
                                  Math.cos((lat2 * Math.PI) / 180) *
                                  Math.sin(dLon / 2) *
                                  Math.sin(dLon / 2);
                              const c =
                                2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                              const distanceKm = R * c;
                              const tempoHoras = distanceKm / velocidade;
                              const tempoMinutos = Math.round(tempoHoras * 60);

                              if (tempoMinutos <= 5)
                                return "text-green-700 dark:text-green-300";
                              if (tempoMinutos <= 15)
                                return "text-blue-700 dark:text-blue-300";
                              if (tempoMinutos <= 30)
                                return "text-yellow-700 dark:text-yellow-300";
                              return "text-orange-700 dark:text-orange-300";
                            })()}`}
                          >
                            {(() => {
                              const velocidade =
                                viagem.velocidadeKMH || viagem.velocidade || 0;
                              if (velocidade === 0) return "N/A";

                              const lat1 = viagem.latitudeMotorista!;
                              const lon1 = viagem.longitudeMotorista!;
                              const lat2 = viagem.latitudeDestino;
                              const lon2 = viagem.longitudeDestino;

                              const R = 6371;
                              const dLat = ((lat2 - lat1) * Math.PI) / 180;
                              const dLon = ((lon2 - lon1) * Math.PI) / 180;
                              const a =
                                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos((lat1 * Math.PI) / 180) *
                                  Math.cos((lat2 * Math.PI) / 180) *
                                  Math.sin(dLon / 2) *
                                  Math.sin(dLon / 2);
                              const c =
                                2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                              const distanceKm = R * c;
                              const tempoHoras = distanceKm / velocidade;
                              const tempoMinutos = Math.round(tempoHoras * 60);

                              return tempoMinutos < 60
                                ? `${tempoMinutos}min`
                                : `${Math.floor(tempoMinutos / 60)}h ${
                                    tempoMinutos % 60
                                  }min`;
                            })()}
                          </p>
                          <p
                            className={`text-xs font-medium ${(() => {
                              const velocidade =
                                viagem.velocidadeKMH || viagem.velocidade || 0;
                              if (velocidade === 0)
                                return "text-gray-600 dark:text-gray-400";

                              const lat1 = viagem.latitudeMotorista!;
                              const lon1 = viagem.longitudeMotorista!;
                              const lat2 = viagem.latitudeDestino;
                              const lon2 = viagem.longitudeDestino;

                              const R = 6371;
                              const dLat = ((lat2 - lat1) * Math.PI) / 180;
                              const dLon = ((lon2 - lon1) * Math.PI) / 180;
                              const a =
                                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos((lat1 * Math.PI) / 180) *
                                  Math.cos((lat2 * Math.PI) / 180) *
                                  Math.sin(dLon / 2) *
                                  Math.sin(dLon / 2);
                              const c =
                                2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                              const distanceKm = R * c;
                              const tempoHoras = distanceKm / velocidade;
                              const tempoMinutos = Math.round(tempoHoras * 60);

                              if (tempoMinutos <= 5)
                                return "text-green-600 dark:text-green-400";
                              if (tempoMinutos <= 15)
                                return "text-blue-600 dark:text-blue-400";
                              if (tempoMinutos <= 30)
                                return "text-yellow-600 dark:text-yellow-400";
                              return "text-orange-600 dark:text-orange-400";
                            })()}`}
                          >
                            {(() => {
                              const velocidade =
                                viagem.velocidadeKMH || viagem.velocidade || 0;
                              if (velocidade === 0) return "Parado";

                              const lat1 = viagem.latitudeMotorista!;
                              const lon1 = viagem.longitudeMotorista!;
                              const lat2 = viagem.latitudeDestino;
                              const lon2 = viagem.longitudeDestino;

                              const R = 6371;
                              const dLat = ((lat2 - lat1) * Math.PI) / 180;
                              const dLon = ((lon2 - lon1) * Math.PI) / 180;
                              const a =
                                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos((lat1 * Math.PI) / 180) *
                                  Math.cos((lat2 * Math.PI) / 180) *
                                  Math.sin(dLon / 2) *
                                  Math.sin(dLon / 2);
                              const c =
                                2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                              const distanceKm = R * c;
                              const tempoHoras = distanceKm / velocidade;
                              const tempoMinutos = Math.round(tempoHoras * 60);

                              if (tempoMinutos <= 5) return "Muito Rápido";
                              if (tempoMinutos <= 15) return "Rápido";
                              if (tempoMinutos <= 30) return "Moderado";
                              return "Demorado";
                            })()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Barra de progresso melhorada */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Origem</span>
                        <span>Destino</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${(() => {
                            const progresso = Math.max(
                              10,
                              Math.min(
                                90,
                                100 -
                                  (() => {
                                    const lat1 = viagem.latitudeMotorista!;
                                    const lon1 = viagem.longitudeMotorista!;
                                    const lat2 = viagem.latitudeDestino;
                                    const lon2 = viagem.longitudeDestino;

                                    const R = 6371;
                                    const dLat =
                                      ((lat2 - lat1) * Math.PI) / 180;
                                    const dLon =
                                      ((lon2 - lon1) * Math.PI) / 180;
                                    const a =
                                      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                      Math.cos((lat1 * Math.PI) / 180) *
                                        Math.cos((lat2 * Math.PI) / 180) *
                                        Math.sin(dLon / 2) *
                                        Math.sin(dLon / 2);
                                    const c =
                                      2 *
                                      Math.atan2(
                                        Math.sqrt(a),
                                        Math.sqrt(1 - a)
                                      );
                                    const distance = R * c;

                                    return (distance / 50) * 100;
                                  })()
                              )
                            );

                            if (progresso >= 80) return "bg-green-500";
                            if (progresso >= 60) return "bg-blue-500";
                            if (progresso >= 40) return "bg-yellow-500";
                            return "bg-orange-500";
                          })()}`}
                          style={{
                            width: `${Math.max(
                              10,
                              Math.min(
                                90,
                                100 -
                                  (() => {
                                    const lat1 = viagem.latitudeMotorista!;
                                    const lon1 = viagem.longitudeMotorista!;
                                    const lat2 = viagem.latitudeDestino;
                                    const lon2 = viagem.longitudeDestino;

                                    const R = 6371;
                                    const dLat =
                                      ((lat2 - lat1) * Math.PI) / 180;
                                    const dLon =
                                      ((lon2 - lon1) * Math.PI) / 180;
                                    const a =
                                      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                      Math.cos((lat1 * Math.PI) / 180) *
                                        Math.cos((lat2 * Math.PI) / 180) *
                                        Math.sin(dLon / 2) *
                                        Math.sin(dLon / 2);
                                    const c =
                                      2 *
                                      Math.atan2(
                                        Math.sqrt(a),
                                        Math.sqrt(1 - a)
                                      );
                                    const distance = R * c;

                                    return (distance / 50) * 100;
                                  })()
                              )
                            )}%`,
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
                        </div>
                      </div>
                      <p
                        className={`text-xs text-center font-medium ${(() => {
                          const progresso = Math.max(
                            10,
                            Math.min(
                              90,
                              100 -
                                (() => {
                                  const lat1 = viagem.latitudeMotorista!;
                                  const lon1 = viagem.longitudeMotorista!;
                                  const lat2 = viagem.latitudeDestino;
                                  const lon2 = viagem.longitudeDestino;

                                  const R = 6371;
                                  const dLat = ((lat2 - lat1) * Math.PI) / 180;
                                  const dLon = ((lon2 - lon1) * Math.PI) / 180;
                                  const a =
                                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                    Math.cos((lat1 * Math.PI) / 180) *
                                      Math.cos((lat2 * Math.PI) / 180) *
                                      Math.sin(dLon / 2) *
                                      Math.sin(dLon / 2);
                                  const c =
                                    2 *
                                    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                  const distance = R * c;

                                  return (distance / 50) * 100;
                                })()
                            )
                          );

                          if (progresso >= 80)
                            return "text-green-600 dark:text-green-400";
                          if (progresso >= 60)
                            return "text-blue-600 dark:text-blue-400";
                          if (progresso >= 40)
                            return "text-yellow-600 dark:text-yellow-400";
                          return "text-orange-600 dark:text-orange-400";
                        })()}`}
                      >
                        Progresso:{" "}
                        {Math.round(
                          Math.max(
                            10,
                            Math.min(
                              90,
                              100 -
                                (() => {
                                  const lat1 = viagem.latitudeMotorista!;
                                  const lon1 = viagem.longitudeMotorista!;
                                  const lat2 = viagem.latitudeDestino;
                                  const lon2 = viagem.longitudeDestino;

                                  const R = 6371;
                                  const dLat = ((lat2 - lat1) * Math.PI) / 180;
                                  const dLon = ((lon2 - lon1) * Math.PI) / 180;
                                  const a =
                                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                    Math.cos((lat1 * Math.PI) / 180) *
                                      Math.cos((lat2 * Math.PI) / 180) *
                                      Math.sin(dLon / 2) *
                                      Math.sin(dLon / 2);
                                  const c =
                                    2 *
                                    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                  const distance = R * c;

                                  return (distance / 50) * 100;
                                })()
                            )
                          )
                        )}
                        %
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aguardando localização do motorista para calcular
                      estimativas...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé simplificado */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Atualização em tempo real
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-white/60 uppercase tracking-widest">
            CARREGANDO DADOS DA VIAGEM...
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
