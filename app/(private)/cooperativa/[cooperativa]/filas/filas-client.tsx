"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useOverlayState } from "@heroui/react";
import ShowToast from "../../../../../src/components/Toast";
import { FilasDisplay } from "../../../../../src/components/FilasDisplay";
import { FilaAdministrativa } from "../../../../../src/model/fila";
import NovaFilaModal from "./modal/nova-fila-modal";

const LIMITE_FILAS = 5;

interface FilasClientProps {
  cooperativaId: string;
  filasAdministrativas: FilaAdministrativa[];
  contagemDisponivel: boolean;
  token: string;
}

export default function FilasClient({
  cooperativaId,
  filasAdministrativas,
  contagemDisponivel,
  token,
}: FilasClientProps) {
  const router = useRouter();
  const novaFilaDisclosure = useOverlayState();

  const totalFilas = filasAdministrativas.length;
  const limiteAtingido = contagemDisponivel && totalFilas >= LIMITE_FILAS;

  function handleSucesso() {
    novaFilaDisclosure.close();
    ShowToast({ color: "success", title: "Fila criada com sucesso" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onPress={() => router.back()}>
              ← Voltar
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Gestão de Filas
                </h1>
                {contagemDisponivel ? (
                  <Chip size="sm" color={limiteAtingido ? "warning" : "default"} variant="tertiary">
                    {totalFilas} de {LIMITE_FILAS} filas
                  </Chip>
                ) : null}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pontos de atendimento da cooperativa
              </p>
            </div>
          </div>

          <Tooltip delay={0} isDisabled={!limiteAtingido}>
            <Tooltip.Trigger>
              <span>
                <Button
                  variant="primary"
                  isDisabled={limiteAtingido}
                  onPress={novaFilaDisclosure.open}
                >
                  <Icon icon="solar:add-circle-linear" />
                  Nova fila
                </Button>
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Limite de 5 filas atingido</p>
            </Tooltip.Content>
          </Tooltip>
        </header>

        <FilasDisplay
          cooperativaId={cooperativaId}
          showHeader={false}
          filasAdministrativas={filasAdministrativas}
        />
      </div>

      <NovaFilaModal
        isOpen={novaFilaDisclosure.isOpen}
        onOpenChange={novaFilaDisclosure.setOpen}
        cooperativaId={cooperativaId}
        token={token}
        onSucesso={handleSucesso}
      />
    </div>
  );
}
