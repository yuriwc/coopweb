"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Chip,
  CloseButton,
  InputGroup,
  Tabs,
  TextField,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import ActionButton from "./action/button";
import EncerrarButton from "./action/encerrar-button";
import { Bezel, EASE, Rotulo, rise } from "@/src/components/ui/superficies";

interface IResponse {
  nome: string;
  id: string;
}

interface IProgramadas {
  id: string;
  nomeEmpresa: string;
  enderecoEmpresa: string;
  nomesPassageiros: string[];
  enderecosPassageiros: string[];
  horaSaida: string;
  horaRetorno: string;
}

interface IProgramadaComMotorista extends IProgramadas {
  tipoViagem: "Apanha" | "Retorno" | "APANHA_E_RETORNO";
  motoristaId: string;
  motoristaNome: string;
  motoristaTelefone: string;
  motoristaMatricula: string;
}

interface ProgramadasClientProps {
  programadasSemMotorista: IProgramadas[];
  programadasComMotorista: IProgramadaComMotorista[];
  motoristas: IResponse[];
  token: string;
}

const TIPO_VIAGEM_LABEL: Record<string, string> = {
  Apanha: "Apanha",
  Retorno: "Retorno",
  APANHA_E_RETORNO: "Ida e volta",
};

const COR_ORIGEM = "#17c964";
const COR_DESTINO = "#f31260";

/* ------------------------------------------------------------------ */

function LinhaRota({
  origem,
  destino,
  paradasExtras,
}: {
  origem: string;
  destino: string;
  paradasExtras: number;
}) {
  return (
    <ol className="relative space-y-2.5 text-sm">
      <span
        aria-hidden
        className="absolute bottom-[0.55rem] left-[4px] top-[0.55rem] w-px bg-black/10 dark:bg-white/15"
      />
      {[
        { rotulo: "Origem", texto: origem, cor: COR_ORIGEM },
        { rotulo: "Destino", texto: destino, cor: COR_DESTINO },
      ].map((ponto) => (
        <li key={ponto.rotulo} className="relative flex min-w-0 items-start gap-3">
          <span
            className="mt-1.5 size-[9px] shrink-0 rounded-full ring-2 ring-surface"
            style={{ backgroundColor: ponto.cor }}
          />
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {ponto.rotulo}
            </span>
            <span className="block truncate text-foreground" title={ponto.texto}>
              {ponto.texto || "Não informado"}
            </span>
          </span>
        </li>
      ))}
      {paradasExtras > 0 && (
        <li className="relative flex items-center gap-3 pl-[21px] text-xs text-muted">
          <Icon icon="solar:map-point-wave-linear" className="size-3.5 shrink-0" />
          mais {paradasExtras} {paradasExtras === 1 ? "parada" : "paradas"}
        </li>
      )}
    </ol>
  );
}

function ListaPassageiros({ nomes }: { nomes: string[] }) {
  if (nomes.length === 0) {
    return <p className="text-sm text-muted">Nenhum passageiro</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {nomes.slice(0, 4).map((nome, i) => (
        <span
          key={`${nome}-${i}`}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-black/[0.04] py-1 pl-1 pr-2.5 text-xs font-medium text-foreground dark:bg-white/[0.06]"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
            {nome.charAt(0).toUpperCase()}
          </span>
          <span className="truncate">{nome}</span>
        </span>
      ))}
      {nomes.length > 4 && (
        <span className="inline-flex items-center rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-medium text-muted dark:bg-white/[0.06]">
          +{nomes.length - 4}
        </span>
      )}
    </div>
  );
}

function CartaoProgramacao({
  programada,
  tipoViagem,
  motorista,
  acao,
  delay,
}: {
  programada: IProgramadas;
  tipoViagem?: string;
  motorista?: { nome: string; telefone: string; matricula: string };
  acao: ReactNode;
  delay: number;
}) {
  const enderecoPassageiro = programada.enderecosPassageiros[0] ?? "";
  // "Apanha" é Casa → Trabalho: nesse caso a empresa é o destino, não a origem.
  const ehApanha = tipoViagem === "Apanha";
  const origem = ehApanha ? enderecoPassageiro : programada.enderecoEmpresa;
  const destino = ehApanha ? programada.enderecoEmpresa : enderecoPassageiro;

  const detalhesMotorista = motorista
    ? [motorista.telefone, motorista.matricula ? `Matrícula ${motorista.matricula}` : ""]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <Bezel
      className="motion-safe:animate-rise"
      style={rise(delay)}
      coreClassName={cn(
        "flex h-full flex-col gap-4 p-5 transition-transform duration-500 hover:-translate-y-0.5",
        EASE
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Icon icon="solar:route-linear" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              Viagem #{programada.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="flex items-center gap-1.5 text-xs tabular-nums text-muted">
              <Icon icon="solar:clock-circle-linear" className="size-3.5 shrink-0" />
              {programada.horaSaida}
              {programada.horaRetorno ? ` → ${programada.horaRetorno}` : ""}
            </p>
          </div>
        </div>

        {tipoViagem && (
          <Chip size="sm" variant="tertiary" color="accent">
            {TIPO_VIAGEM_LABEL[tipoViagem] ?? tipoViagem}
          </Chip>
        )}
      </div>

      {motorista && (
        <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
            {motorista.nome.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{motorista.nome}</p>
            {detalhesMotorista && (
              <p className="truncate text-xs text-muted">{detalhesMotorista}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <Rotulo>Empresa</Rotulo>
          <p className="mt-1.5 truncate text-sm text-foreground" title={programada.nomeEmpresa}>
            {programada.nomeEmpresa}
          </p>
        </div>
        <div className="min-w-0">
          <Rotulo>Passageiros ({programada.nomesPassageiros.length})</Rotulo>
          <div className="mt-1.5">
            <ListaPassageiros nomes={programada.nomesPassageiros} />
          </div>
        </div>
      </div>

      <LinhaRota
        origem={origem}
        destino={destino}
        paradasExtras={Math.max(0, programada.enderecosPassageiros.length - 1)}
      />

      <div className="mt-auto border-t border-black/5 pt-4 dark:border-white/10">{acao}</div>
    </Bezel>
  );
}

function Vazio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Bezel
      className="motion-safe:animate-rise"
      coreClassName="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-default text-muted">
        <Icon icon="solar:routing-2-linear" className="size-7" />
      </span>
      <div>
        <p className="font-semibold text-foreground">{titulo}</p>
        <p className="mt-1 text-sm text-muted">{texto}</p>
      </div>
    </Bezel>
  );
}

/* ------------------------------------------------------------------ */

export default function ProgramadasClient({
  programadasSemMotorista,
  programadasComMotorista,
  motoristas,
  token,
}: ProgramadasClientProps) {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"sem-motorista" | "com-motorista">("sem-motorista");
  const [busca, setBusca] = useState("");

  const termo = busca.trim().toLowerCase();

  const semMotorista = useMemo(
    () =>
      programadasSemMotorista.filter((programada) =>
        !termo
          ? true
          : [programada.nomeEmpresa, ...programada.nomesPassageiros].some((campo) =>
              campo?.toLowerCase().includes(termo)
            )
      ),
    [programadasSemMotorista, termo]
  );

  const comMotorista = useMemo(
    () =>
      programadasComMotorista.filter((programada) =>
        !termo
          ? true
          : [programada.motoristaNome, programada.nomeEmpresa, ...programada.nomesPassageiros].some(
              (campo) => campo?.toLowerCase().includes(termo)
            )
      ),
    [programadasComMotorista, termo]
  );

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
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
                Viagens programadas
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                {programadasSemMotorista.length} aguardando motorista ·{" "}
                {programadasComMotorista.length} com motorista
              </p>
            </div>
          </div>

          <Button
            variant="tertiary"
            size="sm"
            className="shrink-0 rounded-full"
            onPress={() => router.refresh()}
          >
            <Icon icon="solar:refresh-linear" className="size-4" />
            Atualizar
          </Button>
        </header>

        <Tabs
          selectedKey={abaAtiva}
          onSelectionChange={(key) => setAbaAtiva(key as "sem-motorista" | "com-motorista")}
        >
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Filtro de viagens programadas">
                <Tabs.Tab id="sem-motorista">
                  Sem motorista ({semMotorista.length})
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="com-motorista">
                  <Tabs.Separator />
                  Com motorista ({comMotorista.length})
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <TextField
              className="w-full sm:max-w-xs"
              value={busca}
              onChange={setBusca}
              aria-label="Buscar por passageiro, motorista ou empresa"
            >
              <InputGroup>
                <InputGroup.Prefix>
                  <Icon icon="solar:magnifer-linear" className="size-4 text-muted" />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="Buscar passageiro, motorista..." />
                {busca && (
                  <InputGroup.Suffix>
                    <CloseButton aria-label="Limpar busca" onPress={() => setBusca("")} />
                  </InputGroup.Suffix>
                )}
              </InputGroup>
            </TextField>
          </div>

          <Tabs.Panel id="sem-motorista">
            <div className="grid gap-4 pt-5 lg:grid-cols-2">
              {semMotorista.length > 0 ? (
                semMotorista.map((programada, indice) => (
                  <CartaoProgramacao
                    key={programada.id}
                    programada={programada}
                    delay={Math.min(indice, 6) * 60}
                    acao={
                      <ActionButton
                        token={token}
                        motoristas={motoristas}
                        idProgramacao={programada.id}
                      />
                    }
                  />
                ))
              ) : (
                <div className="lg:col-span-2">
                  <Vazio
                    titulo="Nenhuma viagem aguardando motorista"
                    texto={
                      termo
                        ? `Nada corresponde a "${busca}"`
                        : "Todas as programações já têm motorista atribuído"
                    }
                  />
                </div>
              )}
            </div>
          </Tabs.Panel>

          <Tabs.Panel id="com-motorista">
            <div className="grid gap-4 pt-5 lg:grid-cols-2">
              {comMotorista.length > 0 ? (
                comMotorista.map((programada, indice) => (
                  <CartaoProgramacao
                    key={programada.id}
                    programada={programada}
                    tipoViagem={programada.tipoViagem}
                    motorista={{
                      nome: programada.motoristaNome,
                      telefone: programada.motoristaTelefone,
                      matricula: programada.motoristaMatricula,
                    }}
                    delay={Math.min(indice, 6) * 60}
                    acao={
                      <div className="flex justify-end">
                        <EncerrarButton idProgramacao={programada.id} token={token} />
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="lg:col-span-2">
                  <Vazio
                    titulo="Nenhuma viagem com motorista"
                    texto={
                      termo
                        ? `Nada corresponde a "${busca}"`
                        : "As programações atribuídas aparecem aqui"
                    }
                  />
                </div>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
