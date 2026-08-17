"use client";

import { Button } from "@heroui/react";
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
    <Button
      variant="danger-soft"
      size="sm"
      onPress={handleEncerrar}
      isPending={loading}
      className="w-full"
    >
      {!loading && <Icon icon="solar:stop-circle-linear" />}
      {loading ? "Encerrando..." : "Encerrar programação"}
    </Button>
  );
}
