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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Nova fila de atendimento</ModalHeader>
            <ModalBody>
              <Form
                className="flex flex-col gap-4 pb-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <Input
                  label="Nome do ponto"
                  placeholder="Ex.: Shopping Barra"
                  value={dados.nome}
                  onValueChange={(v) => updateCampo("nome", v)}
                  isRequired
                />
                <div className="grid grid-cols-3 gap-3 w-full">
                  <Input
                    className="col-span-2"
                    label="Rua"
                    value={dados.rua}
                    onValueChange={(v) => updateCampo("rua", v)}
                    isRequired
                  />
                  <Input
                    label="Número"
                    value={dados.numero}
                    onValueChange={(v) => updateCampo("numero", v)}
                    isRequired
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  <Input
                    label="Bairro"
                    value={dados.bairro}
                    onValueChange={(v) => updateCampo("bairro", v)}
                    isRequired
                  />
                  <Input
                    label="Cidade"
                    value={dados.cidade}
                    onValueChange={(v) => updateCampo("cidade", v)}
                    isRequired
                  />
                  <Input
                    label="Estado"
                    maxLength={2}
                    value={dados.estado}
                    onValueChange={(v) => updateCampo("estado", v)}
                    isRequired
                  />
                </div>
                <Input
                  label="CEP"
                  value={dados.cep}
                  onValueChange={(v) => updateCampo("cep", v)}
                  isRequired
                />

                {erro ? (
                  <p className="text-sm text-danger" role="alert">
                    {erro}
                  </p>
                ) : null}

                <div className="flex gap-2 justify-end w-full pt-2">
                  <Button variant="light" onPress={() => handleClose(onClose)} isDisabled={enviando}>
                    Cancelar
                  </Button>
                  <Button color="primary" type="submit" isLoading={enviando}>
                    Criar fila
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
