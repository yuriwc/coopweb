"use client";

import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { encerrarProgramacao } from "./encerrar-programacao";
import ShowToast from "../../../../../../src/components/Toast";

interface EncerrarButtonProps {
  idProgramacao: string;
  token: string;
}

export default function EncerrarButton({
  idProgramacao,
  token,
}: EncerrarButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleEncerrar = async () => {
    if (
      !confirm(
        "Tem certeza que deseja encerrar esta programação? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const result = await encerrarProgramacao({
        idProgramacao,
        token,
      });

      if (result.success) {
        ShowToast({
          color: "success",
          title: "Programação encerrada com sucesso!",
        });
      } else {
        ShowToast({
          color: "danger",
          title: "Erro ao encerrar programação",
          description: result.message,
        });
      }
    } catch {
      ShowToast({
        color: "danger",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao encerrar a programação",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-3 border-t border-white/20 dark:border-white/10">
      <Button
        color="danger"
        variant="flat"
        size="sm"
        onPress={handleEncerrar}
        isLoading={loading}
        startContent={!loading && <Icon icon="solar:stop-circle-linear" />}
        className="bg-red-50/50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/50 hover:bg-red-100/70 dark:hover:bg-red-900/70"
      >
        {loading ? "Encerrando..." : "Encerrar Programação"}
      </Button>
    </div>
  );
}
