"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
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
  const { isOpen, open, setOpen, close } = useOverlayState();
  const [loading, setLoading] = useState(false);

  // Antes a confirmação saía pelo confirm() do navegador: caixa cinza do
  // sistema, fora do padrão das outras confirmações do app.
  const handleEncerrar = async () => {
    setLoading(true);

    try {
      const result = await encerrarProgramacao({ idProgramacao, token });

      if (result.success) {
        ShowToast({ color: "success", title: "Programação encerrada" });
        close();
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
    <>
      <Button variant="danger-soft" size="sm" className="rounded-full" onPress={open}>
        <Icon icon="solar:stop-circle-linear" className="size-4" />
        Encerrar
      </Button>

      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={setOpen}>
          <Modal.Container placement="center">
            <Modal.Dialog className="w-full max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  Encerrar programação
                  <p className="text-sm font-normal text-muted">
                    A viagem sai da lista de programações ativas. Não dá para desfazer.
                  </p>
                </Modal.Heading>
              </Modal.Header>
              <Modal.Footer>
                <Button variant="tertiary" onPress={close} isDisabled={loading}>
                  Cancelar
                </Button>
                <Button variant="danger" onPress={handleEncerrar} isPending={loading}>
                  {loading ? "Encerrando..." : "Encerrar programação"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
