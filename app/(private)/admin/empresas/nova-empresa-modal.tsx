"use client";

import { useState } from "react";
import {
  Button,
  Description,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
} from "@heroui/react";
import { CadastroEmpresaDto } from "@/src/model/empresa";
import { Cooperativa } from "@/src/model/cooperativas";
import { criarEmpresa } from "../actions/criar-empresa";

interface NovaEmpresaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cooperativas: Cooperativa[];
  onSucesso: () => void;
}

const CAMPOS_VAZIOS: CadastroEmpresaDto = {
  cooperativaID: "",
  nome: "",
  cnpj: "",
  dataFechamento: 10,
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

export default function NovaEmpresaModal({
  isOpen,
  onOpenChange,
  cooperativas,
  onSucesso,
}: NovaEmpresaModalProps) {
  const [dados, setDados] = useState(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function updateCampo<K extends keyof CadastroEmpresaDto>(campo: K, valor: CadastroEmpresaDto[K]) {
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

    const result = await criarEmpresa(dados);

    setEnviando(false);

    if (result.success) {
      setDados(CAMPOS_VAZIOS);
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível cadastrar a empresa.");
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
                  <Modal.Heading>Nova empresa</Modal.Heading>
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
                      value={dados.cooperativaID}
                      onChange={(key) => updateCampo("cooperativaID", key ? key.toString() : "")}
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
                      <Description>
                        A empresa nasce vinculada a esta cooperativa. Outras podem ser vinculadas
                        depois, na tela da empresa.
                      </Description>
                    </Select>

                    <TextField value={dados.nome} onChange={(v) => updateCampo("nome", v)} isRequired>
                      <Label>Nome da empresa</Label>
                      <Input />
                    </TextField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <TextField value={dados.cnpj} onChange={(v) => updateCampo("cnpj", v)} isRequired>
                        <Label>CNPJ</Label>
                        <Input placeholder="00.000.000/0000-00" />
                      </TextField>
                      <TextField
                        type="number"
                        value={String(dados.dataFechamento)}
                        onChange={(v) => updateCampo("dataFechamento", Number(v) || 10)}
                        isRequired
                      >
                        <Label>Dia de fechamento</Label>
                        <Input min={1} max={31} />
                        <Description>Dia do mês em que o faturamento fecha (1-31)</Description>
                      </TextField>
                    </div>

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
                        Cadastrar empresa
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
