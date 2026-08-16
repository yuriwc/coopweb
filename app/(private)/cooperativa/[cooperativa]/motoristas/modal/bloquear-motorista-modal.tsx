"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/modal";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Bloquear {motorista?.nome ?? motorista?.cpf}
            </ModalHeader>
            <ModalBody>
              <Form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <Input
                  label="Motivo"
                  placeholder="Ex.: CNH vencida desde 01/08/2026"
                  value={motivo}
                  onValueChange={setMotivo}
                  isRequired
                />

                {erro ? (
                  <p className="text-sm text-danger" role="alert">
                    {erro}
                  </p>
                ) : null}

                <div className="flex gap-2 justify-end w-full pt-2 pb-2">
                  <Button variant="light" onPress={() => handleClose(onClose)} isDisabled={enviando}>
                    Cancelar
                  </Button>
                  <Button color="danger" type="submit" isLoading={enviando}>
                    Bloquear
                  </Button>
                </div>
              </Form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
