"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../../../../scripts/firebase-config";
import ViagemCard from "../../../../../src/components/ViagemCard";
import { useRouter } from "next/navigation";
import { ISelect } from "../../../../../src/interface/ISelect";
import { Passageiro, ViagemRealTime } from "../../../../../src/model/viagem";
import { Select, Label, ListBox } from "@heroui/react";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface Props {
  cooperativas: ISelect[];
}

export default function ViagemList({ cooperativas }: Props) {
  const [viagens, setViagens] = useState<ViagemRealTime[]>([]);
  const [cooperativaId, setCooperativaId] = useState<string>(() => {
    // Seleciona automaticamente a primeira cooperativa se houver apenas uma
    return cooperativas.length === 1 ? cooperativas[0].value : "";
  });
  const router = useRouter();

  useEffect(() => {
    if (!cooperativaId) return;
    const motoristasRef = ref(database, `${cooperativaId}/motorista`);
    const unsubscribe = onValue(motoristasRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const viagensArray: ViagemRealTime[] = [];

      type DadosDaViagem = {
        idViagem: string;
        statusViagem?: string;
        enderecoEmpresa?: string;
        latitudeOrigem?: number;
        longitudeOrigem?: number;
        latitudeDestino?: number;
        longitudeDestino?: number;
        latitudeMotorista?: number;
        longitudeMotorista?: number;
        passageiros?: Record<string, Passageiro> | Passageiro[];
      };
      type MotoristaValue = {
        dadosDaViagem?: DadosDaViagem;
      };

      Object.entries(data as Record<string, MotoristaValue>).forEach(
        ([motoristaId, motoristaValue]) => {
          const dados = motoristaValue.dadosDaViagem;
          if (!dados) return;

          let passageiros: Passageiro[] = [];
          if (dados.passageiros) {
            if (Array.isArray(dados.passageiros)) {
              passageiros = dados.passageiros;
            } else {
              passageiros = Object.values(dados.passageiros);
            }
          }

          viagensArray.push({
            id: dados.idViagem,
            motoristaId,
            passageiros,
            statusViagem: dados.statusViagem ?? "",
            enderecoEmpresa: dados.enderecoEmpresa ?? "",
            latitudeOrigem: dados.latitudeOrigem ?? 0,
            longitudeOrigem: dados.longitudeOrigem ?? 0,
            latitudeDestino: dados.latitudeDestino ?? 0,
            longitudeDestino: dados.longitudeDestino ?? 0,
            latitudeMotorista: dados.latitudeMotorista,
            longitudeMotorista: dados.longitudeMotorista,
          });
        }
      );

      setViagens(viagensArray);
    });

    return () => unsubscribe();
  }, [cooperativaId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl w-full p-4 sm:p-8">
        <header className="flex items-center gap-4 mb-8">
          <Button
            isIconOnly
            variant="tertiary"
            aria-label="Voltar"
            className="bg-default dark:bg-default"
            onPress={() => router.back()}
          >
            <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Viagens em Tempo Real
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Acompanhe as viagens em andamento
            </p>
          </div>
        </header>

        {/* Superfície única: seleção de cooperativa + viagens */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <Card.Content className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Select
                placeholder={
                  cooperativas.length === 0
                    ? "Nenhuma cooperativa disponível"
                    : "Escolha uma cooperativa"
                }
                value={cooperativaId || null}
                onChange={(key) => setCooperativaId(key?.toString() || "")}
                isDisabled={cooperativas.length === 0}
                className="w-full sm:max-w-md"
                variant="secondary"
              >
                <Label>Selecione a Cooperativa</Label>
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

              {cooperativaId && viagens.length > 0 && (
                <Chip color="success" variant="tertiary" size="sm">
                  {viagens.length} {viagens.length === 1 ? "viagem ativa" : "viagens ativas"}
                </Chip>
              )}
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700 my-6" />

            {cooperativaId && viagens.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {viagens.map((viagem, index) => (
                  <ViagemCard
                    key={viagem.id + index}
                    cooperativaId={cooperativaId}
                    viagem={viagem}
                    motoristaId={viagem.motoristaId}
                  />
                ))}
              </div>
            )}

            {cooperativaId && viagens.length === 0 && (
              <div className="text-center py-12">
                <Icon
                  icon="solar:routing-2-linear"
                  className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Nenhuma viagem em andamento
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Não há viagens ativas no momento para esta cooperativa
                </p>
              </div>
            )}

            {!cooperativaId && cooperativas.length > 0 && (
              <div className="text-center py-12">
                <Icon
                  icon="solar:buildings-2-linear"
                  className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Selecione uma cooperativa
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Escolha uma cooperativa para visualizar as viagens em tempo real
                </p>
              </div>
            )}

            {cooperativas.length === 0 && (
              <div className="text-center py-12">
                <Icon
                  icon="solar:danger-triangle-linear"
                  className="w-10 h-10 mx-auto text-orange-400 mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Nenhuma cooperativa encontrada
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Não foram encontradas cooperativas para esta empresa
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
