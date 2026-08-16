"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Form } from "@heroui/react";
import { TextField, Input, Select, Label, ListBox } from "@heroui/react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { vincularVeiculo } from "../action/vincular-veiculo";
import {
  CATEGORIA_VEICULO_LABEL,
  CategoriaVeiculo,
  MotoristaCooperativa,
  VincularVeiculoDto,
} from "../../../../../../src/model/motorista";

interface VincularVeiculoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  motorista: MotoristaCooperativa | null;
  token: string;
  onSucesso: () => void;
}

const CAMPOS_VAZIOS: VincularVeiculoDto = {
  marca: "",
  modelo: "",
  placa: "",
  cor: "",
  capacidade: 4,
  categoria: "BASICO",
  ano: new Date().getFullYear(),
  chassi: "",
};

const CATEGORIAS = Object.entries(CATEGORIA_VEICULO_LABEL) as [CategoriaVeiculo, string][];

export default function VincularVeiculoModal({
  isOpen,
  onOpenChange,
  motorista,
  token,
  onSucesso,
}: VincularVeiculoModalProps) {
  const [dados, setDados] = useState<VincularVeiculoDto>(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function handleClose(onClose: () => void) {
    setDados(CAMPOS_VAZIOS);
    setErro(undefined);
    onClose();
  }

  async function handleSubmit() {
    if (!motorista) return;

    setEnviando(true);
    setErro(undefined);

    const result = await vincularVeiculo({ motoristaId: motorista.id, dados, token });

    setEnviando(false);

    if (result.success) {
      setDados(CAMPOS_VAZIOS);
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível cadastrar o veículo.");
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
                  <Modal.Heading>
                    {motorista?.veiculo ? "Substituir veículo" : "Vincular veículo"} — {motorista?.nome ?? motorista?.cpf}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
              {motorista?.veiculo ? (
                <div className="flex items-start gap-2 rounded-lg bg-warning-50 dark:bg-warning-950/30 border border-warning-200 dark:border-warning-800 p-3">
                  <Icon icon="solar:danger-triangle-linear" className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-warning-800 dark:text-warning-300">
                    Este motorista já tem o veículo de placa <strong>{motorista.veiculo.placa}</strong> vinculado.
                    Ao continuar, esse veículo ficará sem motorista.
                  </p>
                </div>
              ) : null}

              <Form
                className="flex flex-col gap-4 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="grid grid-cols-2 gap-3 w-full">
                  <TextField
                    value={dados.marca}
                    onChange={(v) => setDados((prev) => ({ ...prev, marca: v }))}
                    isRequired
                  >
                    <Label>Marca</Label>
                    <Input />
                  </TextField>
                  <TextField
                    value={dados.modelo}
                    onChange={(v) => setDados((prev) => ({ ...prev, modelo: v }))}
                    isRequired
                  >
                    <Label>Modelo</Label>
                    <Input />
                  </TextField>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <TextField
                    value={dados.placa}
                    onChange={(v) => setDados((prev) => ({ ...prev, placa: v }))}
                    isRequired
                  >
                    <Label>Placa</Label>
                    <Input />
                  </TextField>
                  <TextField
                    value={dados.cor}
                    onChange={(v) => setDados((prev) => ({ ...prev, cor: v }))}
                    isRequired
                  >
                    <Label>Cor</Label>
                    <Input />
                  </TextField>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  <TextField
                    type="number"
                    value={String(dados.capacidade)}
                    onChange={(v) => setDados((prev) => ({ ...prev, capacidade: Number(v) || 0 }))}
                    isRequired
                  >
                    <Label>Capacidade</Label>
                    <Input min={1} />
                  </TextField>
                  <Select
                    value={dados.categoria}
                    onChange={(key) => {
                      if (key) {
                        setDados((prev) => ({
                          ...prev,
                          categoria: key.toString() as CategoriaVeiculo,
                        }));
                      }
                    }}
                    isRequired
                  >
                    <Label>Categoria</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {CATEGORIAS.map(([key, label]) => (
                          <ListBox.Item key={key} id={key} textValue={label}>
                            {label}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  <TextField
                    type="number"
                    value={String(dados.ano)}
                    onChange={(v) => setDados((prev) => ({ ...prev, ano: Number(v) || 0 }))}
                    isRequired
                  >
                    <Label>Ano</Label>
                    <Input />
                  </TextField>
                </div>
                <TextField
                  value={dados.chassi}
                  onChange={(v) => setDados((prev) => ({ ...prev, chassi: v }))}
                  isRequired
                >
                  <Label>Chassi</Label>
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
                    {motorista?.veiculo ? "Substituir" : "Vincular"}
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
