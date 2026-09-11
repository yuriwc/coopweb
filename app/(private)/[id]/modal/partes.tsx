"use client";

import type { ReactNode } from "react";
import { Avatar, Button, Chip, Radio, RadioGroup, Switch, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Funcionario } from "@/src/model/funcionario";
import LocationEntry, { LocationFormState } from "../components/location-entry";

// Peças compartilhadas pelos modais de solicitar e programar viagem, que antes
// repetiam o mesmo bloco de passageiros, trajeto e seleção de tipo.

export function Secao({
  titulo,
  descricao,
  children,
  className,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {titulo}
        </h3>
        {descricao && <p className="mt-1 text-xs text-muted">{descricao}</p>}
      </div>
      {children}
    </section>
  );
}

export function ListaPassageiros({ passageiros }: { passageiros: Funcionario[] }) {
  if (passageiros.length === 0) {
    return <p className="text-sm text-muted">Nenhum passageiro selecionado</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {passageiros.map((passageiro) => (
        <Chip key={passageiro.id} variant="tertiary" color="accent">
          <Avatar size="sm">
            <Avatar.Fallback>
              {passageiro.name
                .split(" ")
                .map((parte) => parte[0])
                .join("")
                .slice(0, 2)}
            </Avatar.Fallback>
          </Avatar>
          {passageiro.name}
        </Chip>
      ))}
    </div>
  );
}

export interface OpcaoViagem {
  /** Valor enviado à API — não traduzir. */
  valor: string;
  titulo: string;
  descricao: string;
  icone: string;
}

export function SeletorTipoViagem({
  opcoes,
  valor,
  onChange,
  rotulo,
  className,
}: {
  opcoes: OpcaoViagem[];
  valor: string;
  onChange: (valor: string) => void;
  rotulo: string;
  className?: string;
}) {
  return (
    <RadioGroup
      value={valor}
      onChange={onChange}
      aria-label={rotulo}
      className={cn("grid gap-3", className)}
    >
      {opcoes.map((opcao) => (
        <Radio
          key={opcao.valor}
          value={opcao.valor}
          className={cn(
            "m-0 cursor-pointer rounded-2xl border-2 border-transparent bg-surface-secondary p-4",
            "transition-colors duration-200 hover:border-accent/40",
            "data-[selected=true]:border-accent"
          )}
        >
          <Radio.Content className="items-start gap-3">
            <Radio.Control className="mt-0.5">
              <Radio.Indicator />
            </Radio.Control>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon icon={opcao.icone} className="size-4 shrink-0 text-accent" />
                {opcao.titulo}
              </span>
              <span className="text-xs font-normal text-muted">{opcao.descricao}</span>
            </span>
          </Radio.Content>
        </Radio>
      ))}
    </RadioGroup>
  );
}

export interface TrajetoProps {
  ativo: boolean;
  onAtivoChange: (ativo: boolean) => void;
  origem: LocationFormState;
  destino: LocationFormState;
  paradas: LocationFormState[];
  onOrigemUpdate: (updates: Partial<LocationFormState>) => void;
  onDestinoUpdate: (updates: Partial<LocationFormState>) => void;
  onParadaUpdate: (indice: number, updates: Partial<LocationFormState>) => void;
  onParadaAdd: () => void;
  onParadaRemove: (indice: number) => void;
}

export function BlocoTrajeto({
  ativo,
  onAtivoChange,
  origem,
  destino,
  paradas,
  onOrigemUpdate,
  onDestinoUpdate,
  onParadaUpdate,
  onParadaAdd,
  onParadaRemove,
}: TrajetoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-secondary p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Definir origem e destino</p>
          <p className="mt-0.5 text-xs text-muted">
            {ativo
              ? "Escolha os locais no mapa, com paradas se precisar"
              : "Desligado, a viagem usa o endereço cadastrado do passageiro e da empresa"}
          </p>
        </div>
        <Switch
          isSelected={ativo}
          onChange={onAtivoChange}
          aria-label="Definir origem e destino personalizados"
        >
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
        </Switch>
      </div>

      {ativo && (
        <div className="space-y-3">
          <LocationEntry
            label="Origem"
            placeholder="Buscar local de origem..."
            icon="solar:routing-2-linear"
            location={origem}
            onPlaceSelect={(place) => onOrigemUpdate({ place })}
            onUpdate={onOrigemUpdate}
          />

          {paradas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Icon icon="solar:map-point-wave-linear" className="size-4 text-muted" />
                <span className="text-xs font-medium text-muted">
                  Paradas intermediárias ({paradas.length})
                </span>
              </div>
              {paradas.map((parada, indice) => (
                <LocationEntry
                  key={indice}
                  label={`Parada ${indice + 1}`}
                  placeholder="Buscar local da parada..."
                  icon="solar:map-point-linear"
                  location={parada}
                  onPlaceSelect={(place) => onParadaUpdate(indice, { place })}
                  onUpdate={(updates) => onParadaUpdate(indice, updates)}
                  onRemove={() => onParadaRemove(indice)}
                />
              ))}
            </div>
          )}

          <Button size="sm" variant="tertiary" onPress={onParadaAdd} className="w-full">
            <Icon icon="solar:add-circle-linear" className="size-4" />
            Adicionar parada intermediária
          </Button>

          <LocationEntry
            label="Destino"
            placeholder="Buscar local de destino..."
            icon="solar:flag-linear"
            location={destino}
            onPlaceSelect={(place) => onDestinoUpdate({ place })}
            onUpdate={onDestinoUpdate}
          />
        </div>
      )}
    </div>
  );
}
