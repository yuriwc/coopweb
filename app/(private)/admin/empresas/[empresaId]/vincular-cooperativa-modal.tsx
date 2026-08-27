"use client";

import { useState } from "react";
import { Button, Form, Label, ListBox, Modal, Select } from "@heroui/react";
import { Cooperativa } from "@/src/model/cooperativas";
import { vincularCooperativaAEmpresa } from "../../actions/vincular-cooperativa-empresa";

interface VincularCooperativaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  cooperativas: Cooperativa[];
  onSucesso: () => void;
}

export default function VincularCooperativaModal({
  isOpen,
  onOpenChange,
  empresaId,
  cooperativas,
  onSucesso,
}: VincularCooperativaModalProps) {
  const [cooperativaId, setCooperativaId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function handleClose(close: () => void) {
    setCooperativaId("");
    setErro(undefined);
    close();
  }

  async function handleSubmit() {
    if (!cooperativaId) {
      setErro("Selecione uma cooperativa.");
      return;
    }

    setEnviando(true);
    setErro(undefined);

    const result = await vincularCooperativaAEmpresa(empresaId, cooperativaId);

    setEnviando(false);

    if (result.success) {
      setCooperativaId("");
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível vincular a cooperativa.");
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
                  <Modal.Heading>Vincular cooperativa</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <Form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    <Select
                      value={cooperativaId}
                      onChange={(key) => setCooperativaId(key ? key.toString() : "")}
                      isRequired
                    >
                      <Label>Cooperativa</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {cooperativas.map((cooperativa) => (
                            <ListBox.Item
                              key={cooperativa.id}
                              id={cooperativa.id}
                              textValue={cooperativa.nome}
                            >
                              {cooperativa.nome}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    {erro ? (
                      <p className="text-sm text-danger" role="alert">
                        {erro}
                      </p>
                    ) : null}

                    <div className="flex gap-2 justify-end w-full pt-2 pb-2">
                      <Button
                        variant="tertiary"
                        onPress={() => handleClose(close)}
                        isDisabled={enviando}
                      >
                        Cancelar
                      </Button>
                      <Button variant="primary" type="submit" isPending={enviando}>
                        Vincular
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
