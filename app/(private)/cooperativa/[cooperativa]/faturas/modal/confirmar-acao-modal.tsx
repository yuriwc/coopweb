"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Button } from "@heroui/react";

interface ConfirmarAcaoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  corConfirmar: "primary" | "danger";
  onConfirmar: () => Promise<{ success: boolean; message?: string }>;
  onSucesso: () => void;
}

export default function ConfirmarAcaoModal({
  isOpen,
  onOpenChange,
  titulo,
  descricao,
  rotuloConfirmar,
  corConfirmar,
  onConfirmar,
  onSucesso,
}: ConfirmarAcaoModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  async function handleConfirm() {
    setEnviando(true);
    setErro(undefined);

    const result = await onConfirmar();

    setEnviando(false);

    if (result.success) {
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível concluir a ação.");
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>{titulo}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p className="text-sm text-default-600">{descricao}</p>
                  {erro ? (
                    <p className="text-sm text-danger" role="alert">
                      {erro}
                    </p>
                  ) : null}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="tertiary" onPress={close} isDisabled={enviando}>
                    Cancelar
                  </Button>
                  <Button variant={corConfirmar} isPending={enviando} onPress={handleConfirm}>
                    {rotuloConfirmar}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
