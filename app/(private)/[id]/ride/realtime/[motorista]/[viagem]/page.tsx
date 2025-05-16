"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { database } from "@/scripts/firebase-config";
import "leaflet/dist/leaflet.css";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import CarIcon from "@/src/assets/car.png";
import CompanyIcon from "@/src/assets/office-building.png";
import { ViagemTempoReal } from "@/src/model/viagem";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

// Ícones customizados
const motoristaIcon = L.icon({
  iconUrl: CarIcon.src,
  iconSize: [40, 40],
});

const origemIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png", // Ícone de carro parado
  iconSize: [44, 44],
});

const destinoIcon = L.icon({
  iconUrl: CompanyIcon.src,
  iconSize: [48, 48],
});

const Page = () => {
  const [viagem, setViagem] = useState<ViagemTempoReal | null>(null);
  const params = useParams();
  const motoristaID = params?.motorista as string;
  const router = useRouter();

  useEffect(() => {
    if (!motoristaID) return;

    const viagensRef = ref(database, `/motoristas/${motoristaID}`);
    const unsubscribe = onValue(viagensRef, (snapshot) => {
      if (snapshot.exists()) {
        setViagem(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, [motoristaID]);

  return (
    <div className="min-h-screen p-4">
      <header className="border-b border-white pb-4 mb-6">
        <button
          className="mb-4 px-4 py-2 border uppercase tracking-widest text-xs rounded-none hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white transition"
          onClick={() => router.back()}
        >
          Voltar
        </button>
        <h1 className="text-2xl font-light tracking-widest uppercase">
          ACOMPANHAMENTO DE VIAGEM
        </h1>
      </header>

      {viagem ? (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mapa à esquerda */}
          <div className="md:w-2/3 w-full h-[40vh] md:h-[70vh] border">
            {viagem.latitudeMotorista !== undefined &&
            viagem.longitudeMotorista !== undefined ? (
              <MapContainer
                center={[viagem.latitudeMotorista, viagem.longitudeMotorista]}
                zoom={20}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  className="opacity-70"
                />

                {/* Linha tracejada até o destino */}
                <Polyline
                  positions={[
                    [viagem.latitudeMotorista, viagem.longitudeMotorista],
                    [viagem.latitudeDestino, viagem.longitudeDestino],
                  ]}
                  pathOptions={{
                    color: "#000",
                    dashArray: "8 12",
                    weight: 3,
                    opacity: 0.8,
                  }}
                />

                {/* Marker do motorista */}
                <Marker
                  position={[
                    viagem.latitudeMotorista,
                    viagem.longitudeMotorista,
                  ]}
                  icon={motoristaIcon}
                >
                  <Popup className="font-mono text-xs uppercase tracking-wider">
                    <span style={{ color: "#000" }}>MOTORISTA</span>
                  </Popup>
                </Marker>

                {/* Marker de origem */}
                <Marker
                  position={[viagem.latitudeOrigem, viagem.longitudeOrigem]}
                  icon={origemIcon}
                >
                  <Popup className="font-mono text-xs uppercase tracking-wider">
                    <span style={{ color: "#000" }}>ORIGEM</span>
                  </Popup>
                </Marker>

                {/* Marker de destino */}
                <Marker
                  position={[viagem.latitudeDestino, viagem.longitudeDestino]}
                  icon={destinoIcon}
                >
                  <Popup className="font-mono text-xs uppercase tracking-wider">
                    <span style={{ color: "#000" }}>DESTINO</span>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/60 uppercase tracking-widest">
                  Localização do motorista não disponível no momento.
                </p>
              </div>
            )}
          </div>

          {/* Informações à direita */}
          <div className="md:w-1/3 w-full flex flex-col justify-between">
            <div className="space-y-4 text-sm uppercase tracking-wider">
              <div className="flex justify-between border-b pb-2">
                <span>PASSAGEIRO:</span>
                <span>{viagem.nomePassageiro.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>STATUS:</span>
                <span>{viagem.statusViagem.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>ORIGEM:</span>
                <span className="text-right">
                  {viagem.enderecoOrigem.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>DESTINO:</span>
                <span className="text-right">
                  {viagem.enderecoDestino.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-center text-xs tracking-widest mt-8">
              ATUALIZANDO EM TEMPO REAL
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
