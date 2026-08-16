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
import { aplicarDescontoVoucher } from "../action/aplicar-desconto-voucher";
import { AplicarDescontoVoucherDto, VoucherCooperativa } from "../../../../../../src/model/relatorio-vouchers";

interface AplicarDescontoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherCooperativa | null;
  token: string;
  onSucesso: () => void;
}

const CAMPOS_VAZIOS: AplicarDescontoVoucherDto = { valorDesconto: 0, motivoDesconto: "" };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function AplicarDescontoModal({
  isOpen,
  onOpenChange,
  voucher,
  token,
  onSucesso,
}: AplicarDescontoModalProps) {
  const [dados, setDados] = useState<AplicarDescontoVoucherDto>(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function handleClose(onClose: () => void) {
    setDados(CAMPOS_VAZIOS);
    setErro(undefined);
    onClose();
  }

  async function handleSubmit() {
    if (!voucher) return;

    setEnviando(true);
    setErro(undefined);

    const result = await aplicarDescontoVoucher({ voucherId: voucher.id, dados, token });

    setEnviando(false);

    if (result.success) {
      setDados(CAMPOS_VAZIOS);
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível aplicar o desconto.");
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Aplicar desconto — {voucher?.numeroVoucher}
            </ModalHeader>
            <ModalBody>
              {voucher ? (
                <p className="text-sm text-default-600">
                  Valor bruto: <strong>{formatCurrency(voucher.valorTotal)}</strong>
                </p>
              ) : null}
              <Form
                className="flex flex-col gap-4 pb-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <Input
                  label="Valor do desconto"
                  type="number"
                  min={0.01}
                  step={0.01}
                  startContent={<span className="text-default-400">R$</span>}
                  value={dados.valorDesconto ? String(dados.valorDesconto) : ""}
                  onValueChange={(v) => setDados((prev) => ({ ...prev, valorDesconto: Number(v) || 0 }))}
                  isRequired
                />
                <Input
                  label="Motivo"
                  placeholder="Ex.: corrida com atraso reportado pelo passageiro"
                  value={dados.motivoDesconto}
                  onValueChange={(v) => setDados((prev) => ({ ...prev, motivoDesconto: v }))}
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
                    Aplicar
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
