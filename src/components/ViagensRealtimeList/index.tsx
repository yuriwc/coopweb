"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { Button, Label, ListBox, Select, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { database } from "@/scripts/firebase-config";
import { ISelect } from "@/src/interface/ISelect";
import { Passageiro } from "@/src/model/viagem";
import { getMotoristas } from "@/src/services/motorista";
import { getStatus } from "@/src/utils/viagem-status";
import { Bezel, EASE, Rotulo, TONE, rise, type Tone } from "@/src/components/ui/superficies";

type ViagemLista = {
  id: string;
  motoristaId: string;
  statusViagem: string;
  enderecoEmpresa: string;
  passageiros: Passageiro[];
  temLocalizacao: boolean;
};

type DadosDaViagem = {
  idViagem?: string;
  statusViagem?: string;
  enderecoEmpresa?: string;
  latitudeMotorista?: number;
  longitudeMotorista?: number;
  passageiros?: Record<string, Passageiro> | Passageiro[];
};

type MotoristaValue = { dadosDaViagem?: DadosDaViagem };

// Viagens em andamento primeiro; sem status, por último.
const PESO: Record<Tone, number> = { success: 0, warning: 1, accent: 2, danger: 3, default: 4 };

function montarViagens(data: Record<string, MotoristaValue> | null): ViagemLista[] {
  if (!data) return [];

  return Object.entries(data).flatMap(([motoristaId, valor]) => {
    const dados = valor?.dadosDaViagem;
    if (!dados) return [];

    const passageiros = !dados.passageiros
      ? []
      : Array.isArray(dados.passageiros)
        ? dados.passageiros
        : Object.values(dados.passageiros);

    return [
      {
        id: dados.idViagem ?? motoristaId,
        motoristaId,
        statusViagem: dados.statusViagem ?? "",
        enderecoEmpresa: dados.enderecoEmpresa ?? "",
        passageiros,
        temLocalizacao:
          dados.latitudeMotorista != null && dados.longitudeMotorista != null,
      },
    ];
  });
}

const nomesPassageiros = (passageiros: Passageiro[]) =>
  passageiros.map((p) => [p.nome, p.sobrenome].filter(Boolean).join(" ")).filter(Boolean);

const enderecoDestino = (passageiros: Passageiro[]) => {
  const p0 = passageiros[0];
  return p0 ? [p0.rua, p0.numero, p0.bairro, p0.cidade].filter(Boolean).join(", ") : "";
};

/* ------------------------------------------------------------------ */

function CardViagem({
  viagem,
  motoristaNome,
  href,
  delay,
}: {
  viagem: ViagemLista;
  motoristaNome?: string;
  href: string;
  delay: number;
}) {
  const status = getStatus(viagem.statusViagem);
  const nomes = nomesPassageiros(viagem.passageiros);
  const destino = enderecoDestino(viagem.passageiros);

  return (
    <Link
      href={href}
      style={rise(delay)}
      className="group block rounded-[1.75rem] motion-safe:animate-rise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Bezel
        coreClassName={cn(
          "flex h-full flex-col gap-4 p-5 transition-transform duration-500 group-hover:-translate-y-1",
          EASE
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-sm font-semibold text-accent">
              {motoristaNome ? (
                motoristaNome.charAt(0).toUpperCase()
              ) : (
                <Icon icon="solar:user-rounded-linear" className="size-5" />
              )}
              {viagem.temLocalizacao && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success ring-2 ring-surface" />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {motoristaNome ?? `Viagem ${viagem.id.slice(0, 8)}`}
              </p>
              <p className="truncate text-xs text-muted">
                {motoristaNome
                  ? `Viagem ${viagem.id.slice(0, 8)}`
                  : viagem.temLocalizacao
                    ? "Transmitindo localização"
                    : "Sem sinal de GPS"}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              TONE[status.tone].soft,
              TONE[status.tone].text
            )}
          >
            <Icon icon={status.icon} className="size-3.5 shrink-0" />
            <span className="max-w-[9rem] truncate">{status.label}</span>
          </span>
        </div>

        <ol className="relative space-y-2.5 border-t border-black/5 pt-4 text-sm dark:border-white/10">
          <span
            aria-hidden
            className="absolute bottom-[0.6rem] left-[4px] top-[1.6rem] w-px bg-black/10 dark:bg-white/15"
          />
          {[
            { rotulo: "Origem", texto: viagem.enderecoEmpresa, cor: "#17c964" },
            { rotulo: "Destino", texto: destino, cor: "#f31260" },
          ].map((item) => (
            <li key={item.rotulo} className="relative flex min-w-0 items-center gap-3">
              <span
                className="size-[9px] shrink-0 rounded-full ring-2 ring-surface"
                style={{ backgroundColor: item.cor }}
              />
              <span className="w-14 shrink-0 text-xs text-muted">{item.rotulo}</span>
              <span
                className={cn("truncate", item.texto ? "text-foreground" : "text-muted")}
                title={item.texto || undefined}
              >
                {item.texto || "Não informado"}
              </span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-1.5">
          <Rotulo className="mr-1">Passageiros</Rotulo>
          {nomes.length === 0 && (
            <span className="text-xs text-muted">
              {viagem.passageiros.length > 0 ? "Sem nome informado" : "Nenhum"}
            </span>
          )}
          {nomes.slice(0, 2).map((nome, i) => (
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
          {nomes.length > 2 && (
            <span className="inline-flex items-center rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-medium text-muted dark:bg-white/[0.06]">
              +{nomes.length - 2}
            </span>
          )}
        </div>

        <span
          className={cn(
            "mt-auto flex items-center justify-between gap-2 rounded-full bg-accent py-1.5 pl-5 pr-1.5 text-sm font-medium text-white transition-transform duration-500 group-active:scale-[0.98]",
            EASE
          )}
        >
          Acompanhar viagem
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 group-hover:-translate-y-px group-hover:translate-x-0.5",
              EASE
            )}
          >
            <Icon icon="solar:arrow-right-up-linear" className="size-4" />
          </span>
        </span>
      </Bezel>
    </Link>
  );
}

function Vazio({ icone, titulo, texto }: { icone: string; titulo: string; texto: string }) {
  return (
    <Bezel
      className="motion-safe:animate-rise"
      style={rise(120)}
      coreClassName="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-default text-muted">
        <Icon icon={icone} className="size-7" />
      </span>
      <div>
        <p className="font-semibold text-foreground">{titulo}</p>
        <p className="mt-1 text-sm text-muted">{texto}</p>
      </div>
    </Bezel>
  );
}

/* ------------------------------------------------------------------ */

interface Props {
  /** Caminho da lista, base dos links de monitoramento. */
  basePath: string;
  /** Modo empresa: seletor de cooperativa. */
  cooperativas?: ISelect[];
  /** Modo cooperativa: id fixo, sem seletor. */
  cooperativaId?: string;
}

export default function ViagensRealtimeList({
  basePath,
  cooperativas,
  cooperativaId: cooperativaFixa,
}: Props) {
  const router = useRouter();
  const [cooperativaId, setCooperativaId] = useState<string>(
    () => cooperativaFixa ?? (cooperativas?.length === 1 ? cooperativas[0].value : "")
  );
  const [viagens, setViagens] = useState<ViagemLista[]>([]);
  const [carregando, setCarregando] = useState(
    Boolean(cooperativaFixa) || cooperativas?.length === 1
  );
  const [nomes, setNomes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cooperativaId) {
      setViagens([]);
      return;
    }

    setCarregando(true);
    const motoristasRef = ref(database, `${cooperativaId}/motorista`);

    const unsubscribe = onValue(
      motoristasRef,
      (snapshot) => {
        setViagens(montarViagens(snapshot.val()));
        setCarregando(false);
      },
      (error) => {
        console.error("Erro ao carregar viagens:", error);
        setViagens([]);
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, [cooperativaId]);

  // Nome do motorista: some junto com a viagem se a busca falhar.
  useEffect(() => {
    if (!cooperativaId) return;
    let ativo = true;

    getMotoristas(cooperativaId).then((lista) => {
      if (!ativo || !lista) return;
      setNomes(Object.fromEntries(lista.map((m) => [m.id, m.nome])));
    });

    return () => {
      ativo = false;
    };
  }, [cooperativaId]);

  const ordenadas = useMemo(
    () =>
      [...viagens].sort((a, b) => {
        const peso = PESO[getStatus(a.statusViagem).tone] - PESO[getStatus(b.statusViagem).tone];
        if (peso !== 0) return peso;
        return (nomes[a.motoristaId] ?? a.id).localeCompare(nomes[b.motoristaId] ?? b.id);
      }),
    [viagens, nomes]
  );

  const linkMonitoramento = (motoristaId: string) =>
    cooperativas
      ? `${basePath}/${motoristaId}/1/${cooperativaId}`
      : `${basePath}/${motoristaId}/${cooperativaId}`;

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 motion-safe:animate-rise sm:flex-row sm:items-center sm:justify-between">
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
                Viagens em tempo real
              </h1>
              <p className="mt-0.5 text-sm text-muted">Acompanhe as viagens em andamento</p>
            </div>
          </div>

          {cooperativaId && !carregando && (
            <div className="flex shrink-0 items-center gap-1 self-start rounded-full bg-black/[0.035] p-1 ring-1 ring-black/[0.04] sm:self-auto dark:bg-white/[0.04] dark:ring-white/[0.07]">
              <span className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <span className="relative flex size-2">
                  <span
                    className={cn(
                      "absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping",
                      viagens.length > 0 ? "bg-success" : "bg-muted"
                    )}
                  />
                  <span
                    className={cn(
                      "relative size-2 rounded-full",
                      viagens.length > 0 ? "bg-success" : "bg-muted"
                    )}
                  />
                </span>
                {viagens.length} {viagens.length === 1 ? "viagem ativa" : "viagens ativas"}
              </span>
            </div>
          )}
        </header>

        {cooperativas && (
          <Bezel
            className="mt-5 motion-safe:animate-rise"
            style={rise(60)}
            coreClassName="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <Select
              placeholder={
                cooperativas.length === 0
                  ? "Nenhuma cooperativa disponível"
                  : "Escolha uma cooperativa"
              }
              value={cooperativaId || null}
              onChange={(key) => setCooperativaId(key?.toString() || "")}
              isDisabled={cooperativas.length === 0}
              className="w-full sm:max-w-sm"
              variant="secondary"
            >
              <Label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                Cooperativa
              </Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {cooperativas.map((coop) => (
                    <ListBox.Item key={coop.value} id={coop.value} textValue={coop.label}>
                      {coop.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </Bezel>
        )}

        <div className="mt-5">
          {carregando ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {[0, 1, 2, 3].map((i) => (
                <Bezel
                  key={i}
                  className="motion-safe:animate-rise"
                  style={rise(i * 60)}
                  coreClassName="space-y-4 p-5 motion-safe:animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-black/[0.06] dark:bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/2 rounded-full bg-black/[0.06] dark:bg-white/10" />
                      <div className="h-2.5 w-1/3 rounded-full bg-black/[0.04] dark:bg-white/[0.07]" />
                    </div>
                  </div>
                  <div className="h-2.5 w-2/3 rounded-full bg-black/[0.05] dark:bg-white/[0.08]" />
                  <div className="h-2.5 w-1/2 rounded-full bg-black/[0.05] dark:bg-white/[0.08]" />
                  <div className="h-10 rounded-full bg-black/[0.05] dark:bg-white/[0.08]" />
                </Bezel>
              ))}
            </div>
          ) : cooperativas?.length === 0 ? (
            <Vazio
              icone="solar:danger-triangle-linear"
              titulo="Nenhuma cooperativa encontrada"
              texto="Não foram encontradas cooperativas para esta empresa"
            />
          ) : !cooperativaId ? (
            <Vazio
              icone="solar:buildings-2-linear"
              titulo="Selecione uma cooperativa"
              texto="Escolha uma cooperativa para ver as viagens em tempo real"
            />
          ) : ordenadas.length === 0 ? (
            <Vazio
              icone="solar:routing-2-linear"
              titulo="Nenhuma viagem em andamento"
              texto="Não há viagens ativas no momento para esta cooperativa"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {ordenadas.map((viagem, index) => (
                <CardViagem
                  key={`${viagem.motoristaId}-${viagem.id}`}
                  viagem={viagem}
                  motoristaNome={nomes[viagem.motoristaId]}
                  href={linkMonitoramento(viagem.motoristaId)}
                  delay={Math.min(index, 8) * 60}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
