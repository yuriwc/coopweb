"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Button } from "@heroui/react";
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
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Reativar {motorista?.nome ?? motorista?.cpf}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p className="text-sm text-muted">
                    O motorista volta a poder aceitar corridas, entrar na fila e receber disparo direto.
                  </p>
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
                  <Button variant="primary" isPending={enviando} onPress={handleConfirm}>
                    Reativar
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
