"use client";

import { useState } from "react";
import { Button, Card, Chip, Description, Form, Input, Label, Modal, TextField } from "@heroui/react";
import { Icon } from "@iconify/react";
import { MotoristaLookup } from "@/src/model/admin";
import { buscarMotoristaPorCpf } from "../../actions/buscar-motorista-por-cpf";
import { vincularMotoristaACooperativa } from "../../actions/vincular-motorista-cooperativa";

interface VincularMotoristaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cooperativaId: string;
  cooperativaNome: string | null;
  onSucesso: () => void;
}

export default function VincularMotoristaModal({
  isOpen,
  onOpenChange,
  cooperativaId,
  cooperativaNome,
  onSucesso,
}: VincularMotoristaModalProps) {
  const [cpf, setCpf] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [vinculando, setVinculando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);
  const [motorista, setMotorista] = useState<MotoristaLookup | null>(null);

  const jaNestaCooperativa = motorista?.cooperativaId === cooperativaId;
  const emOutraCooperativa = motorista?.cooperativaId != null && !jaNestaCooperativa;

  function resetar() {
    setCpf("");
    setMotorista(null);
    setErro(undefined);
  }

  function handleClose(close: () => void) {
    resetar();
    close();
  }

  async function handleBuscar() {
    setBuscando(true);
    setErro(undefined);
    setMotorista(null);

    const result = await buscarMotoristaPorCpf(cpf);

    setBuscando(false);

    if (result.success && result.data) {
      setMotorista(result.data);
    } else {
      setErro(result.message ?? "Nenhum motorista encontrado para este CPF.");
    }
  }

  async function handleVincular() {
    if (!motorista) return;

    setVinculando(true);
    setErro(undefined);

    const result = await vincularMotoristaACooperativa(cooperativaId, motorista.id);

    setVinculando(false);

    if (result.success) {
      resetar();
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível vincular o motorista.");
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
                  <Modal.Heading>Vincular motorista existente</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="flex flex-col gap-4">
                    <Form
                      className="flex flex-col gap-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleBuscar();
                      }}
                    >
                      <TextField value={cpf} onChange={setCpf} isRequired>
                        <Label>CPF do motorista</Label>
                        <Input placeholder="000.000.000-00" />
                        <Description>
                          Busque o motorista já cadastrado para vinculá-lo a{" "}
                          {cooperativaNome ?? "esta cooperativa"}.
                        </Description>
                      </TextField>

                      <div className="flex justify-end w-full">
                        <Button variant="secondary" type="submit" isPending={buscando}>
                          <Icon icon="solar:magnifer-linear" className="w-4 h-4" />
                          Buscar
                        </Button>
                      </div>
                    </Form>

                    {motorista ? (
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <Card.Content className="flex flex-col gap-3 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">
                                {motorista.nome ?? "Nome não informado"}
                              </p>
                              <p className="text-sm text-muted font-mono">{motorista.cpf}</p>
                            </div>
                            <Chip
                              size="sm"
                              variant="tertiary"
                              color={motorista.ativo === false ? "danger" : "success"}
                            >
                              {motorista.ativo === false ? "Bloqueado" : "Ativo"}
                            </Chip>
                          </div>

                          <p className="text-sm">
                            {motorista.cooperativaNome ? (
                              <>
                                Cooperativa atual:{" "}
                                <span className="font-medium">{motorista.cooperativaNome}</span>
                              </>
                            ) : (
                              <span className="text-muted italic">
                                Sem cooperativa vinculada
                              </span>
                            )}
                          </p>

                          {jaNestaCooperativa ? (
                            <p className="text-sm text-muted">
                              Este motorista já pertence a esta cooperativa.
                            </p>
                          ) : null}

                          {emOutraCooperativa ? (
                            <p className="text-sm text-warning">
                              O motorista pertence a outra cooperativa. Desvincule-o de lá antes de
                              movê-lo — um motorista só pode estar em uma cooperativa.
                            </p>
                          ) : null}
                        </Card.Content>
                      </Card>
                    ) : null}

                    {erro ? (
                      <p className="text-sm text-danger" role="alert">
                        {erro}
                      </p>
                    ) : null}

                    <div className="flex gap-2 justify-end w-full pt-2 pb-2">
                      <Button
                        variant="tertiary"
                        onPress={() => handleClose(close)}
                        isDisabled={buscando || vinculando}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onPress={handleVincular}
                        isPending={vinculando}
                        isDisabled={!motorista || jaNestaCooperativa || emOutraCooperativa}
                      >
                        Vincular
                      </Button>
                    </div>
                  </div>
                </Modal.Body>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
