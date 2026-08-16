"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Form } from "@heroui/react";
import { TextField, Label, Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { bloquearMotorista } from "../action/bloquear-motorista";
import { MotoristaCooperativa } from "../../../../../../src/model/motorista";

interface BloquearMotoristaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  motorista: MotoristaCooperativa | null;
  token: string;
  onSucesso: () => void;
}

export default function BloquearMotoristaModal({
  isOpen,
  onOpenChange,
  motorista,
  token,
  onSucesso,
}: BloquearMotoristaModalProps) {
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function handleClose(onClose: () => void) {
    setMotivo("");
    setErro(undefined);
    onClose();
  }

  async function handleSubmit() {
    if (!motorista) return;

    setEnviando(true);
    setErro(undefined);

    const result = await bloquearMotorista({ motoristaId: motorista.id, motivo, token });

    setEnviando(false);

    if (result.success) {
      setMotivo("");
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível bloquear o motorista.");
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="md">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Bloquear {motorista?.nome ?? motorista?.cpf}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
              <Form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <TextField value={motivo} onChange={setMotivo} isRequired>
                  <Label>Motivo</Label>
                  <Input placeholder="Ex.: CNH vencida desde 01/08/2026" />
                </TextField>

                {erro ? (
                  <p className="text-sm text-danger" role="alert">
                    {erro}
                  </p>
                ) : null}

                <div className="flex gap-2 justify-end w-full pt-2 pb-2">
                  <Button variant="tertiary" onPress={() => handleClose(close)} isDisabled={enviando}>
                    Cancelar
                  </Button>
                  <Button variant="danger" type="submit" isPending={enviando}>
                    Bloquear
                  </Button>
                </div>
              </Form>
                </Modal.Body>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
