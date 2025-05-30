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
import ViagemInfoCards from "@/src/components/ViagemInfoCards";
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
              {/* CARDS DE INFORMAÇÕES */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Informações da Viagem
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

                <ViagemInfoCards viagem={viagem} />
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
