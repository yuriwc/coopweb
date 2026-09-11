"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ref, onValue, off } from "firebase/database";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Button, cn } from "@heroui/react";
import { Spinner } from "@heroui/react/spinner";
import { Icon } from "@iconify/react";
import { database } from "@/scripts/firebase-config";
import { Passageiro, ViagemRealTime } from "@/src/model/viagem";
import { getStatus } from "@/src/utils/viagem-status";
import { Bezel, EASE, Rotulo, TONE, rise, type Tone } from "@/src/components/ui/superficies";

const GOOGLE_MAPS_LIBRARIES: "places"[] = [];

// Mapa mais limpo: sem POIs/transporte competindo com os marcadores da viagem.
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { elementType: "geometry", stylers: [{ saturation: -35 }] },
];

const COR = {
  motorista: "#0070f3",
  origem: "#17c964",
  destino: "#f31260",
  parada: "#7828c8",
};

type Conexao = "connecting" | "connected" | "disconnected";
type LatLng = { lat: number; lng: number };

const CONEXAO: Record<Conexao, { tone: Tone; label: string }> = {
  connecting: { tone: "warning", label: "Conectando" },
  connected: { tone: "success", label: "Ao vivo" },
  disconnected: { tone: "danger", label: "Desconectado" },
};

/* ------------------------------------------------------------------ */
/* Regras de exibição                                                  */
/* ------------------------------------------------------------------ */

function getVelocidade(kmh: number): { tone: Tone; label: string } {
  if (kmh < 5) return { tone: "warning", label: "Parado" };
  if (kmh < 30) return { tone: "success", label: "Moderada" };
  if (kmh < 60) return { tone: "accent", label: "Rápida" };
  return { tone: "danger", label: "Muito rápida" };
}

function getSinalGps(metros?: number): { tone: Tone; label: string; barras: number } {
  if (metros == null) return { tone: "default", label: "Sem dados", barras: 0 };
  if (metros <= 5) return { tone: "success", label: "Excelente", barras: 4 };
  if (metros <= 10) return { tone: "success", label: "Muito boa", barras: 3 };
  if (metros <= 20) return { tone: "warning", label: "Boa", barras: 2 };
  if (metros <= 50) return { tone: "warning", label: "Moderada", barras: 1 };
  return { tone: "danger", label: "Baixa", barras: 1 };
}

const DIRECOES = ["Norte", "Nordeste", "Leste", "Sudeste", "Sul", "Sudoeste", "Oeste", "Noroeste"];
const getDirecaoCardinal = (graus: number) => DIRECOES[Math.round(graus / 45) % 8];

const fmt = (n: number, casas: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: casas });

const getOrigem = (v: ViagemRealTime): LatLng | null => {
  if (v.provider === "mobicity" && v.origin) return { lat: v.origin.lat, lng: v.origin.lng };
  if (v.latitudeOrigem != null && v.longitudeOrigem != null)
    return { lat: v.latitudeOrigem, lng: v.longitudeOrigem };
  return null;
};

const getDestino = (v: ViagemRealTime): LatLng | null => {
  if (v.provider === "mobicity" && v.destination)
    return { lat: v.destination.lat, lng: v.destination.lng };
  if (v.latitudeDestino != null && v.longitudeDestino != null)
    return { lat: v.latitudeDestino, lng: v.longitudeDestino };
  return null;
};

const getOrigemEndereco = (v: ViagemRealTime) =>
  v.provider === "mobicity" && v.origin
    ? v.origin.name || v.origin.address
    : v.enderecoEmpresa || "";

const getDestinoEndereco = (v: ViagemRealTime) => {
  if (v.provider === "mobicity" && v.destination)
    return v.destination.name || v.destination.address;
  const p0 = v.passageiros?.[0];
  return p0 ? [p0.rua, p0.numero, p0.bairro, p0.cidade].filter(Boolean).join(", ") : "";
};

function getPassageiros(v: ViagemRealTime): { total: number; nomes: string[] } {
  if (v.provider === "mobicity") {
    const nomes = [...(v.paradas ?? []).map((p) => p.nome), v.destination?.nome].filter(
      (nome): nome is string => Boolean(nome)
    );
    return { total: nomes.length, nomes };
  }
  if (!v.passageiros) return { total: 0, nomes: [] };
  // O Firebase pode entregar a lista como objeto indexado em vez de array.
  const lista: Passageiro[] = Array.isArray(v.passageiros)
    ? v.passageiros
    : Object.values(v.passageiros as Record<string, Passageiro>);
  const nomes = lista
    .map((p) => [p.nome, p.sobrenome].filter(Boolean).join(" "))
    .filter(Boolean);
  return { total: lista.length, nomes };
}

// Distância em linha reta (haversine), em km.
function distanciaKm(a: LatLng, b: LatLng) {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function Metrica({
  rotulo,
  icone,
  valor,
  unidade,
  tom,
  qualificador,
  delay,
}: {
  rotulo: string;
  icone: ReactNode;
  valor: string;
  unidade?: string;
  tom: Tone;
  qualificador: string;
  delay: number;
}) {
  return (
    <Bezel
      className="group motion-safe:animate-rise"
      style={rise(delay)}
      coreClassName={cn(
        "flex flex-col justify-between gap-4 p-4 transition-transform duration-500 group-hover:-translate-y-0.5",
        EASE
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Rotulo className="truncate">{rotulo}</Rotulo>
        <span className="shrink-0 text-muted">{icone}</span>
      </div>
      <div className="space-y-1.5">
        <p className="flex items-baseline gap-1 text-[1.625rem] font-semibold leading-none tracking-tight tabular-nums text-foreground">
          {valor}
          {unidade && (
            <span className="text-xs font-medium tracking-normal text-muted">{unidade}</span>
          )}
        </p>
        <p className={cn("flex items-center gap-1.5 text-xs font-medium", TONE[tom].text)}>
          <span className={cn("size-1.5 rounded-full", TONE[tom].dot)} />
          {qualificador}
        </p>
      </div>
    </Bezel>
  );
}

// Tem relógio próprio para "há 40s" continuar correndo sem re-renderizar o mapa.
function MetricaAtualizacao({ timestamp, delay }: { timestamp?: number; delay: number }) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  if (!timestamp) {
    return (
      <Metrica
        rotulo="Atualizado"
        icone={<Icon icon="solar:clock-circle-linear" className="size-4" />}
        valor="--:--"
        tom="default"
        qualificador="Nunca"
        delay={delay}
      />
    );
  }

  const segundos = Math.max(0, Math.floor((agora - new Date(timestamp).getTime()) / 1000));
  const minutos = Math.floor(segundos / 60);
  const [tom, qualificador]: [Tone, string] =
    segundos < 30
      ? ["success", "Agora"]
      : segundos < 60
        ? ["success", `há ${segundos}s`]
        : minutos < 5
          ? ["warning", `há ${minutos} min`]
          : minutos < 60
            ? ["danger", `há ${minutos} min`]
            : ["danger", `há ${Math.floor(minutos / 60)}h`];

  return (
    <Metrica
      rotulo="Atualizado"
      icone={<Icon icon="solar:clock-circle-linear" className="size-4" />}
      valor={new Date(timestamp).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}
      tom={tom}
      qualificador={qualificador}
      delay={delay}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Painel de dados                                                     */
/* ------------------------------------------------------------------ */

function PainelViagem({ viagem }: { viagem: ViagemRealTime }) {
  const status = getStatus(viagem.statusViagem);
  const passageiros = getPassageiros(viagem);
  const velocidade = viagem.velocidadeKMH || viagem.velocidade || 0;
  const velocidadeInfo = getVelocidade(velocidade);
  const direcao = viagem.direcaoGraus || viagem.direcao || 0;
  const precisao = viagem.precisaoMetros ?? viagem.precisao;
  const sinal = getSinalGps(precisao);
  const origemEndereco = getOrigemEndereco(viagem);
  const destinoEndereco = getDestinoEndereco(viagem);

  const destino = getDestino(viagem);
  const posicao =
    viagem.latitudeMotorista != null && viagem.longitudeMotorista != null
      ? { lat: viagem.latitudeMotorista, lng: viagem.longitudeMotorista }
      : null;
  const distancia = posicao && destino ? distanciaKm(posicao, destino) : null;
  // Abaixo de 5 km/h o motorista está parado: uma previsão seria ruído.
  const minutosEstimados =
    distancia != null && velocidade >= 5 ? Math.round((distancia / velocidade) * 60) : null;

  return (
    <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
      {/* Status + passageiros + rota */}
      <Bezel className="motion-safe:animate-rise" style={rise(80)} coreClassName="p-5">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:divide-x sm:divide-black/5 dark:sm:divide-white/10">
          <div className="min-w-0 sm:pr-5">
            <Rotulo>Status da viagem</Rotulo>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-2xl",
                  TONE[status.tone].soft,
                  TONE[status.tone].text
                )}
              >
                <Icon icon={status.icon} className="size-5" />
              </span>
              <p className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                {status.label}
              </p>
            </div>
          </div>

          <div className="min-w-0 sm:pl-5">
            <div className="flex items-center justify-between gap-2">
              <Rotulo>Passageiros</Rotulo>
              <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-foreground dark:bg-white/[0.06]">
                {passageiros.total}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {passageiros.nomes.length === 0 && (
                <p className="text-sm text-muted">
                  {passageiros.total > 0 ? "Sem nome informado" : "Nenhum passageiro"}
                </p>
              )}
              {passageiros.nomes.slice(0, 3).map((nome, i) => (
                <span
                  key={`${nome}-${i}`}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-black/[0.04] py-1 pl-1 pr-2.5 text-xs font-medium text-foreground dark:bg-white/[0.06]"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
                    {nome.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{nome.split(" ")[0]}</span>
                </span>
              ))}
              {passageiros.nomes.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-medium text-muted dark:bg-white/[0.06]">
                  +{passageiros.nomes.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {(origemEndereco || destinoEndereco) && (
          <ol className="relative mt-5 space-y-2.5 border-t border-black/5 pt-4 text-sm dark:border-white/10">
            {origemEndereco && destinoEndereco && (
              <span
                aria-hidden
                className="absolute bottom-[0.6rem] left-[4px] top-[1.6rem] w-px bg-black/10 dark:bg-white/15"
              />
            )}
            {[
              { rotulo: "Origem", endereco: origemEndereco, cor: COR.origem },
              { rotulo: "Destino", endereco: destinoEndereco, cor: COR.destino },
            ]
              .filter((item) => item.endereco)
              .map((item) => (
                <li key={item.rotulo} className="relative flex min-w-0 items-center gap-3">
                  <span
                    className="size-[9px] shrink-0 rounded-full ring-2 ring-surface"
                    style={{ backgroundColor: item.cor }}
                  />
                  <span className="w-14 shrink-0 text-xs text-muted">{item.rotulo}</span>
                  <span className="truncate text-foreground" title={item.endereco}>
                    {item.endereco}
                  </span>
                </li>
              ))}
          </ol>
        )}
      </Bezel>

      {/* Telemetria */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:max-h-72 lg:min-h-0 lg:flex-1">
        <Metrica
          rotulo="Velocidade"
          icone={<Icon icon="solar:speedometer-middle-linear" className="size-4" />}
          valor={fmt(velocidade, velocidade < 10 ? 1 : 0)}
          unidade="km/h"
          tom={velocidadeInfo.tone}
          qualificador={velocidadeInfo.label}
          delay={160}
        />
        <Metrica
          rotulo="Direção"
          icone={
            <span className="flex size-5 items-center justify-center rounded-full ring-1 ring-black/10 dark:ring-white/15">
              <span
                className={cn("flex transition-transform duration-700", EASE)}
                style={{ transform: `rotate(${direcao}deg)` }}
              >
                <Icon icon="solar:arrow-up-linear" className="size-3 text-accent" />
              </span>
            </span>
          }
          valor={`${fmt(direcao, 0)}°`}
          tom="default"
          qualificador={getDirecaoCardinal(direcao)}
          delay={200}
        />
        <Metrica
          rotulo="Sinal GPS"
          icone={
            <span className="flex items-end gap-[2px]" aria-hidden>
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={cn(
                    "w-[3px] rounded-full",
                    n <= sinal.barras ? TONE[sinal.tone].dot : "bg-black/10 dark:bg-white/15"
                  )}
                  style={{ height: 3 + n * 3 }}
                />
              ))}
            </span>
          }
          valor={precisao != null ? `±${fmt(precisao, 0)}` : "—"}
          unidade={precisao != null ? "m" : undefined}
          tom={sinal.tone}
          qualificador={sinal.label}
          delay={240}
        />
        <MetricaAtualizacao
          timestamp={viagem.timestampUltimaLocalizacao || viagem.timestamp}
          delay={280}
        />
      </div>

      {/* Estimativas (só com posição do motorista e destino) */}
      {distancia != null && (
        <Bezel
          className="motion-safe:animate-rise"
          style={rise(320)}
          coreClassName="grid grid-cols-2 divide-x divide-black/5 dark:divide-white/10"
        >
          <div className="min-w-0 p-4">
            <Rotulo>Até o destino</Rotulo>
            <p className="mt-2 flex items-baseline gap-1 text-[1.625rem] font-semibold leading-none tracking-tight tabular-nums text-foreground">
              {distancia < 1 ? fmt(distancia * 1000, 0) : fmt(distancia, 1)}
              <span className="text-xs font-medium tracking-normal text-muted">
                {distancia < 1 ? "m" : "km"}
              </span>
            </p>
            <p className="mt-1.5 text-xs text-muted">em linha reta</p>
          </div>
          <div className="min-w-0 p-4">
            <Rotulo>Chegada estimada</Rotulo>
            <p className="mt-2 flex items-baseline gap-1 text-[1.625rem] font-semibold leading-none tracking-tight tabular-nums text-foreground">
              {minutosEstimados == null
                ? "—"
                : minutosEstimados < 60
                  ? minutosEstimados
                  : `${Math.floor(minutosEstimados / 60)}h${String(minutosEstimados % 60).padStart(2, "0")}`}
              {minutosEstimados != null && minutosEstimados < 60 && (
                <span className="text-xs font-medium tracking-normal text-muted">min</span>
              )}
            </p>
            <p className="mt-1.5 text-xs text-muted">
              {minutosEstimados == null
                ? "aguardando movimento"
                : `previsão às ${new Date(Date.now() + minutosEstimados * 60_000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
            </p>
          </div>
        </Bezel>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tela                                                                */
/* ------------------------------------------------------------------ */

interface RealtimeMonitorProps {
  cooperativaId: string;
  motoristaId: string;
  motoristaNome?: string;
  cooperativaNome?: string;
}

export default function RealtimeMonitor({
  cooperativaId,
  motoristaId,
  motoristaNome,
  cooperativaNome,
}: RealtimeMonitorProps) {
  const router = useRouter();
  const [viagem, setViagem] = useState<ViagemRealTime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conexao, setConexao] = useState<Conexao>("connecting");
  const [ultimoEvento, setUltimoEvento] = useState<Date | null>(null);
  const [centroInicial, setCentroInicial] = useState<LatLng | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [infoAberta, setInfoAberta] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapShellRef = useRef<HTMLDivElement>(null);

  const { isLoaded: mapsCarregado, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!motoristaId || !cooperativaId) return;

    setConexao("connecting");
    setIsLoading(true);

    const viagemRef = ref(database, `${cooperativaId}/motorista/${motoristaId}/dadosDaViagem`);

    const unsubscribe = onValue(
      viagemRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data: ViagemRealTime = snapshot.val();
          setViagem(data);
          setConexao("connected");
          setUltimoEvento(new Date());
          // O mapa recebe o centro só uma vez; depois acompanha via panTo.
          if (data.latitudeMotorista != null && data.longitudeMotorista != null) {
            const posicao = { lat: data.latitudeMotorista, lng: data.longitudeMotorista };
            setCentroInicial((atual) => atual ?? posicao);
          }
        } else {
          setConexao("disconnected");
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao conectar:", error);
        setConexao("disconnected");
        setIsLoading(false);
      }
    );

    return () => {
      off(viagemRef);
      unsubscribe();
    };
  }, [motoristaId, cooperativaId, tentativa]);

  const lat = viagem?.latitudeMotorista;
  const lng = viagem?.longitudeMotorista;

  useEffect(() => {
    if (mapRef.current && lat != null && lng != null) {
      mapRef.current.panTo({ lat, lng });
    }
  }, [lat, lng]);

  const centralizar = useCallback(() => {
    if (!mapRef.current || lat == null || lng == null) return;
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(18);
  }, [lat, lng]);

  const zoom = useCallback((delta: number) => {
    const map = mapRef.current;
    if (map) map.setZoom((map.getZoom() ?? 17) + delta);
  }, []);

  const alternarTelaCheia = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void mapShellRef.current?.requestFullscreen();
  }, []);

  const conexaoInfo = CONEXAO[conexao];
  const origem = viagem ? getOrigem(viagem) : null;
  const destino = viagem ? getDestino(viagem) : null;

  const controles = [
    { label: "Centralizar no motorista", icon: "solar:target-linear", onPress: centralizar, isDisabled: lat == null },
    { label: "Aumentar zoom", icon: "solar:magnifer-zoom-in-linear", onPress: () => zoom(1) },
    { label: "Diminuir zoom", icon: "solar:magnifer-zoom-out-linear", onPress: () => zoom(-1) },
    { label: "Tela cheia", icon: "solar:full-screen-linear", onPress: alternarTelaCheia },
  ];

  return (
    // No desktop a tela ocupa só a altura visível (viewport − navbar h-16): mapa e
    // dados lado a lado, e apenas a coluna de dados rola se faltar espaço.
    <div className="min-h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4rem)] lg:min-h-[34rem]">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex shrink-0 flex-col gap-3 motion-safe:animate-rise sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              isIconOnly
              variant="tertiary"
              aria-label="Voltar"
              className="shrink-0 rounded-full"
              onPress={() => router.back()}
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                Monitoramento em tempo real
              </h1>
              {(motoristaNome || cooperativaNome) && (
                <p className="mt-0.5 flex min-w-0 items-center gap-x-4 text-sm text-muted">
                  {motoristaNome && (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Icon icon="solar:user-rounded-linear" className="size-4 shrink-0" />
                      <span className="truncate font-medium text-foreground">{motoristaNome}</span>
                    </span>
                  )}
                  {cooperativaNome && (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Icon icon="solar:buildings-2-linear" className="size-4 shrink-0" />
                      <span className="truncate">{cooperativaNome}</span>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 self-start rounded-full bg-black/[0.035] p-1 ring-1 ring-black/[0.04] sm:self-auto dark:bg-white/[0.04] dark:ring-white/[0.07]">
            <span className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <span className="relative flex size-2">
                {conexao !== "disconnected" && (
                  <span
                    className={cn(
                      "absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping",
                      TONE[conexaoInfo.tone].dot
                    )}
                  />
                )}
                <span className={cn("relative size-2 rounded-full", TONE[conexaoInfo.tone].dot)} />
              </span>
              {conexaoInfo.label}
            </span>
            {ultimoEvento && conexao === "connected" && (
              <span className="flex items-center gap-1.5 px-2.5 text-xs tabular-nums text-muted">
                <Icon icon="solar:clock-circle-linear" className="size-3.5" />
                {ultimoEvento.toLocaleTimeString("pt-BR")}
              </span>
            )}
          </div>
        </header>

        {isLoading ? (
          <Bezel
            className="lg:min-h-0 lg:flex-1"
            coreClassName="flex flex-col items-center justify-center gap-4 py-24 text-center"
          >
            <Spinner size="lg" color="accent" />
            <div>
              <p className="font-semibold text-foreground">Carregando dados da viagem</p>
              <p className="mt-1 text-sm text-muted">Conectando ao sistema de monitoramento</p>
            </div>
          </Bezel>
        ) : !viagem ? (
          <Bezel
            className="lg:min-h-0 lg:flex-1"
            coreClassName="flex flex-col items-center justify-center gap-4 py-24 text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
              <Icon icon="solar:danger-circle-linear" className="size-7" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Nenhum dado encontrado</p>
              <p className="mt-1 text-sm text-muted">
                Este motorista não tem uma viagem ativa no momento
              </p>
            </div>
            <Button variant="tertiary" className="rounded-full" onPress={() => setTentativa((t) => t + 1)}>
              <Icon icon="solar:refresh-linear" className="size-4" />
              Tentar novamente
            </Button>
          </Bezel>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-1">
            {/* Mapa (~40% da largura no desktop) */}
            <Bezel
              ref={mapShellRef}
              className="motion-safe:animate-rise lg:min-h-0"
              coreClassName="relative flex flex-col overflow-hidden"
            >
              <div className="relative h-[360px] w-full lg:h-auto lg:min-h-0 lg:flex-1">
                {mapsCarregado && centroInicial && lat != null && lng != null ? (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={centroInicial}
                    zoom={17}
                    onLoad={(map) => {
                      mapRef.current = map;
                    }}
                    onUnmount={() => {
                      mapRef.current = null;
                    }}
                    options={{
                      disableDefaultUI: true,
                      clickableIcons: false,
                      styles: MAP_STYLES,
                    }}
                  >
                    {destino && (
                      <Polyline
                        path={[{ lat, lng }, destino]}
                        options={{
                          strokeOpacity: 0,
                          icons: [
                            {
                              icon: { path: "M 0,-1 0,1", strokeOpacity: 0.9, strokeColor: COR.motorista, scale: 3 },
                              offset: "0",
                              repeat: "14px",
                            },
                          ],
                        }}
                      />
                    )}

                    <Marker
                      position={{ lat, lng }}
                      onClick={() => setInfoAberta("motorista")}
                      icon={{
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        rotation: viagem.direcaoGraus || viagem.direcao || 0,
                        scale: 6,
                        fillColor: COR.motorista,
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                      }}
                    >
                      {infoAberta === "motorista" && (
                        <InfoWindow onCloseClick={() => setInfoAberta(null)}>
                          <div className="space-y-1 text-sm">
                            <div className="font-semibold text-accent">
                              {motoristaNome ?? "Motorista"}
                            </div>
                            <div className="text-xs">
                              Velocidade: {fmt(viagem.velocidadeKMH || viagem.velocidade || 0, 1)} km/h
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>

                    {origem && (
                      <Marker
                        position={origem}
                        onClick={() => setInfoAberta("origem")}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: COR.origem,
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                        }}
                      >
                        {infoAberta === "origem" && (
                          <InfoWindow onCloseClick={() => setInfoAberta(null)}>
                            <div className="space-y-1 text-sm">
                              <div className="font-semibold text-success">Origem</div>
                              <div className="text-xs">{getOrigemEndereco(viagem) || "Origem"}</div>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    )}

                    {destino && (
                      <Marker
                        position={destino}
                        onClick={() => setInfoAberta("destino")}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: COR.destino,
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                        }}
                      >
                        {infoAberta === "destino" && (
                          <InfoWindow onCloseClick={() => setInfoAberta(null)}>
                            <div className="space-y-1 text-sm">
                              <div className="font-semibold text-danger">Destino</div>
                              <div className="text-xs">{getDestinoEndereco(viagem) || "Destino"}</div>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    )}

                    {/* Paradas - apenas para viagens do provider mobicity */}
                    {viagem.provider === "mobicity" &&
                      viagem.paradas?.map((parada, index) => {
                        const key = `parada-${index}`;
                        return (
                          <Marker
                            key={key}
                            position={{ lat: parada.lat, lng: parada.lng }}
                            onClick={() => setInfoAberta(key)}
                            icon={{
                              path: google.maps.SymbolPath.CIRCLE,
                              scale: 6,
                              fillColor: COR.parada,
                              fillOpacity: 1,
                              strokeColor: "#ffffff",
                              strokeWeight: 2,
                            }}
                          >
                            {infoAberta === key && (
                              <InfoWindow onCloseClick={() => setInfoAberta(null)}>
                                <div className="space-y-1 text-sm">
                                  <div className="font-semibold text-accent">Parada {index + 1}</div>
                                  <div className="text-xs font-medium">{parada.name || parada.address}</div>
                                  {parada.nome && <div className="text-xs text-gray-600">{parada.nome}</div>}
                                  {parada.whatsapp && (
                                    <div className="text-xs text-success">{parada.whatsapp}</div>
                                  )}
                                </div>
                              </InfoWindow>
                            )}
                          </Marker>
                        );
                      })}
                  </GoogleMap>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                    {loadError ? (
                      <Icon icon="solar:map-linear" className="size-8 text-muted" />
                    ) : (
                      <Spinner size="lg" color="accent" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {loadError ? "Mapa indisponível" : "Aguardando localização"}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {loadError
                          ? "Não foi possível carregar o Google Maps"
                          : "Esperando dados de GPS do motorista"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Controles flutuantes */}
                <div className="absolute right-3 top-3 flex flex-col gap-0.5 rounded-full bg-white/85 p-1 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur-md dark:bg-zinc-900/80 dark:ring-white/10">
                  {controles.map((c) => (
                    <Button
                      key={c.label}
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={c.label}
                      className="rounded-full"
                      isDisabled={c.isDisabled}
                      onPress={c.onPress}
                    >
                      <Icon icon={c.icon} className="size-4" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Legenda + coordenadas */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/5 px-4 py-2.5 dark:border-white/10">
                <div className="flex items-center gap-3 text-[11px] font-medium text-muted">
                  {[
                    { label: "Motorista", cor: COR.motorista, show: true },
                    { label: "Origem", cor: COR.origem, show: Boolean(origem) },
                    { label: "Destino", cor: COR.destino, show: Boolean(destino) },
                  ]
                    .filter((item) => item.show)
                    .map((item) => (
                      <span key={item.label} className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ backgroundColor: item.cor }} />
                        {item.label}
                      </span>
                    ))}
                </div>
                {lat != null && lng != null && (
                  <span className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] tabular-nums text-muted">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </span>
                )}
              </div>
            </Bezel>

            {/* Dados (~60% da largura; rola internamente se faltar altura) */}
            <div className="flex flex-col lg:-m-1 lg:min-h-0 lg:overflow-y-auto lg:p-1">
              <PainelViagem viagem={viagem} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
