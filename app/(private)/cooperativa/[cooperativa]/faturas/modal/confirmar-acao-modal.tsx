"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{titulo}</ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-600">{descricao}</p>
              {erro ? (
                <p className="text-sm text-danger" role="alert">
                  {erro}
                </p>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={enviando}>
                Cancelar
              </Button>
              <Button color={corConfirmar} isLoading={enviando} onPress={handleConfirm}>
                {rotuloConfirmar}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
