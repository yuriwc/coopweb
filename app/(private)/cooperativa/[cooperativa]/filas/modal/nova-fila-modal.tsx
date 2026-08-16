"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Form } from "@heroui/react";
import { TextField, Label, Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { criarFila } from "../action/criar-fila";
import { NovaFilaDto } from "../../../../../../src/model/fila";

interface NovaFilaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cooperativaId: string;
  token: string;
  onSucesso: () => void;
}

const CAMPOS_VAZIOS: NovaFilaDto = {
  nome: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  cep: "",
  estado: "",
};

export default function NovaFilaModal({
  isOpen,
  onOpenChange,
  cooperativaId,
  token,
  onSucesso,
}: NovaFilaModalProps) {
  const [dados, setDados] = useState<NovaFilaDto>(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function updateCampo<K extends keyof NovaFilaDto>(campo: K, valor: NovaFilaDto[K]) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleClose(onClose: () => void) {
    setDados(CAMPOS_VAZIOS);
    setErro(undefined);
    onClose();
  }

  async function handleSubmit() {
    setEnviando(true);
    setErro(undefined);

    const result = await criarFila({ cooperativaId, dados, token });

    setEnviando(false);

    if (result.success) {
      setDados(CAMPOS_VAZIOS);
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível localizar o endereço informado.");
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Nova fila de atendimento</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
              <Form
                className="flex flex-col gap-4 pb-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <TextField value={dados.nome} onChange={(v) => updateCampo("nome", v)} isRequired>
                  <Label>Nome do ponto</Label>
                  <Input placeholder="Ex.: Shopping Barra" />
                </TextField>
                <div className="grid grid-cols-3 gap-3 w-full">
                  <TextField
                    className="col-span-2"
                    value={dados.rua}
                    onChange={(v) => updateCampo("rua", v)}
                    isRequired
                  >
                    <Label>Rua</Label>
                    <Input />
                  </TextField>
                  <TextField value={dados.numero} onChange={(v) => updateCampo("numero", v)} isRequired>
                    <Label>Número</Label>
                    <Input />
                  </TextField>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  <TextField value={dados.bairro} onChange={(v) => updateCampo("bairro", v)} isRequired>
                    <Label>Bairro</Label>
                    <Input />
                  </TextField>
                  <TextField value={dados.cidade} onChange={(v) => updateCampo("cidade", v)} isRequired>
                    <Label>Cidade</Label>
                    <Input />
                  </TextField>
                  <TextField value={dados.estado} onChange={(v) => updateCampo("estado", v)} isRequired>
                    <Label>Estado</Label>
                    <Input maxLength={2} />
                  </TextField>
                </div>
                <TextField value={dados.cep} onChange={(v) => updateCampo("cep", v)} isRequired>
                  <Label>CEP</Label>
                  <Input />
                </TextField>

                {erro ? (
                  <p className="text-sm text-danger" role="alert">
                    {erro}
                  </p>
                ) : null}

                <div className="flex gap-2 justify-end w-full pt-2">
                  <Button variant="tertiary" onPress={() => handleClose(close)} isDisabled={enviando}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" isPending={enviando}>
                    Criar fila
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
