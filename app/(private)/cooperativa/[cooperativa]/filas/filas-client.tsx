"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Icon } from "@iconify/react";
import { useDisclosure } from "@heroui/modal";
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
  const novaFilaDisclosure = useDisclosure();

  const totalFilas = filasAdministrativas.length;
  const limiteAtingido = contagemDisponivel && totalFilas >= LIMITE_FILAS;

  function handleSucesso() {
    novaFilaDisclosure.onClose();
    ShowToast({ color: "success", title: "Fila criada com sucesso" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-7xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="bordered" onPress={() => router.back()}>
              ← Voltar
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Gestão de Filas
                </h1>
                {contagemDisponivel ? (
                  <Chip size="sm" color={limiteAtingido ? "warning" : "default"} variant="flat">
                    {totalFilas} de {LIMITE_FILAS} filas
                  </Chip>
                ) : null}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pontos de atendimento da cooperativa
              </p>
            </div>
          </div>

          <Tooltip content="Limite de 5 filas atingido" isDisabled={!limiteAtingido}>
            <span>
              <Button
                color="primary"
                startContent={<Icon icon="solar:add-circle-linear" />}
                isDisabled={limiteAtingido}
                onPress={novaFilaDisclosure.onOpen}
              >
                Nova fila
              </Button>
            </span>
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
        onOpenChange={novaFilaDisclosure.onOpenChange}
        cooperativaId={cooperativaId}
        token={token}
        onSucesso={handleSucesso}
      />
    </div>
  );
}
