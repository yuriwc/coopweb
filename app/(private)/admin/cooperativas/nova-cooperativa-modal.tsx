"use client";

import { useState } from "react";
import { Button, Form, Input, Label, Modal, TextField } from "@heroui/react";
import { CadastroCooperativaDto } from "@/src/model/admin";
import { criarCooperativa } from "../actions/criar-cooperativa";

interface NovaCooperativaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSucesso: (codigo: string) => void;
}

const CAMPOS_VAZIOS: CadastroCooperativaDto = {
  nome: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  cep: "",
  estado: "",
  telefone: "",
  email: "",
  referencia: "",
};

export default function NovaCooperativaModal({
  isOpen,
  onOpenChange,
  onSucesso,
}: NovaCooperativaModalProps) {
  const [dados, setDados] = useState(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function updateCampo<K extends keyof CadastroCooperativaDto>(
    campo: K,
    valor: CadastroCooperativaDto[K],
  ) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleClose(close: () => void) {
    setDados(CAMPOS_VAZIOS);
    setErro(undefined);
    close();
  }

  async function handleSubmit() {
    setEnviando(true);
    setErro(undefined);

    const result = await criarCooperativa(dados);

    setEnviando(false);

    if (result.success && result.data) {
      setDados(CAMPOS_VAZIOS);
      onSucesso(result.data.codigo);
    } else {
      setErro(result.message ?? "Não foi possível cadastrar a cooperativa.");
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Nova cooperativa</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <Form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    <TextField
                      value={dados.nome}
                      onChange={(v) => updateCampo("nome", v)}
                      isRequired
                    >
                      <Label>Nome da cooperativa</Label>
                      <Input />
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
                      <TextField
                        value={dados.numero}
                        onChange={(v) => updateCampo("numero", v)}
                        isRequired
                      >
                        <Label>Número</Label>
                        <Input />
                      </TextField>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full">
                      <TextField
                        value={dados.bairro}
                        onChange={(v) => updateCampo("bairro", v)}
                        isRequired
                      >
                        <Label>Bairro</Label>
                        <Input />
                      </TextField>
                      <TextField
                        value={dados.cidade}
                        onChange={(v) => updateCampo("cidade", v)}
                        isRequired
                      >
                        <Label>Cidade</Label>
                        <Input />
                      </TextField>
                      <TextField
                        value={dados.estado}
                        onChange={(v) => updateCampo("estado", v)}
                        isRequired
                      >
                        <Label>Estado</Label>
                        <Input maxLength={2} placeholder="SP" />
                      </TextField>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <TextField value={dados.cep} onChange={(v) => updateCampo("cep", v)} isRequired>
                        <Label>CEP</Label>
                        <Input />
                      </TextField>
                      <TextField
                        value={dados.telefone}
                        onChange={(v) => updateCampo("telefone", v)}
                        isRequired
                      >
                        <Label>Telefone</Label>
                        <Input />
                      </TextField>
                    </div>

                    <TextField value={dados.email ?? ""} onChange={(v) => updateCampo("email", v)}>
                      <Label>E-mail (opcional)</Label>
                      <Input />
                    </TextField>
                    <TextField
                      value={dados.referencia ?? ""}
                      onChange={(v) => updateCampo("referencia", v)}
                    >
                      <Label>Referência (opcional)</Label>
                      <Input />
                    </TextField>

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
                        Cadastrar cooperativa
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
