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
import { reativarMotorista } from "../action/reativar-motorista";
import { MotoristaCooperativa } from "../../../../../../src/model/motorista";

interface ReativarMotoristaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  motorista: MotoristaCooperativa | null;
  token: string;
  onSucesso: () => void;
}

export default function ReativarMotoristaModal({
  isOpen,
  onOpenChange,
  motorista,
  token,
  onSucesso,
}: ReativarMotoristaModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  async function handleConfirm() {
    if (!motorista) return;

    setEnviando(true);
    setErro(undefined);

    const result = await reativarMotorista({ motoristaId: motorista.id, token });

    setEnviando(false);

    if (result.success) {
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível reativar o motorista.");
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Reativar {motorista?.nome ?? motorista?.cpf}
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-600">
                O motorista volta a poder aceitar corridas, entrar na fila e receber disparo direto.
              </p>
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
              <Button color="primary" isLoading={enviando} onPress={handleConfirm}>
                Reativar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
