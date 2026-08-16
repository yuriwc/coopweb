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
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {motorista?.veiculo ? "Substituir veículo" : "Vincular veículo"} — {motorista?.nome ?? motorista?.cpf}
            </ModalHeader>
            <ModalBody>
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
                  <Input
                    label="Marca"
                    value={dados.marca}
                    onValueChange={(v) => setDados((prev) => ({ ...prev, marca: v }))}
                    isRequired
                  />
                  <Input
                    label="Modelo"
                    value={dados.modelo}
                    onValueChange={(v) => setDados((prev) => ({ ...prev, modelo: v }))}
                    isRequired
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Input
                    label="Placa"
                    value={dados.placa}
                    onValueChange={(v) => setDados((prev) => ({ ...prev, placa: v }))}
                    isRequired
                  />
                  <Input
                    label="Cor"
                    value={dados.cor}
                    onValueChange={(v) => setDados((prev) => ({ ...prev, cor: v }))}
                    isRequired
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  <Input
                    label="Capacidade"
                    type="number"
                    min={1}
                    value={String(dados.capacidade)}
                    onValueChange={(v) => setDados((prev) => ({ ...prev, capacidade: Number(v) || 0 }))}
                    isRequired
                  />
                  <Select
                    label="Categoria"
                    selectedKeys={[dados.categoria]}
                    onSelectionChange={(keys) => {
                      const [selected] = Array.from(keys) as CategoriaVeiculo[];
                      if (selected) setDados((prev) => ({ ...prev, categoria: selected }));
                    }}
                    isRequired
                  >
                    {CATEGORIAS.map(([key, label]) => (
                      <SelectItem key={key}>{label}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Ano"
                    type="number"
                    value={String(dados.ano)}
                    onValueChange={(v) => setDados((prev) => ({ ...prev, ano: Number(v) || 0 }))}
                    isRequired
                  />
                </div>
                <Input
                  label="Chassi"
                  value={dados.chassi}
                  onValueChange={(v) => setDados((prev) => ({ ...prev, chassi: v }))}
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
                    {motorista?.veiculo ? "Substituir" : "Vincular"}
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
