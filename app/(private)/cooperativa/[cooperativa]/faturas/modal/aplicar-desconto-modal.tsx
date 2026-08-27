"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Form } from "@heroui/react";
import { TextField, Label, Input, InputGroup } from "@heroui/react";
import { Button } from "@heroui/react";
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
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Aplicar desconto — {voucher?.numeroVoucher}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
              {voucher ? (
                <p className="text-sm text-muted">
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
                <TextField
                  type="number"
                  value={dados.valorDesconto ? String(dados.valorDesconto) : ""}
                  onChange={(v) => setDados((prev) => ({ ...prev, valorDesconto: Number(v) || 0 }))}
                  isRequired
                >
                  <Label>Valor do desconto</Label>
                  <InputGroup>
                    <InputGroup.Prefix>
                      <span className="text-muted">R$</span>
                    </InputGroup.Prefix>
                    <InputGroup.Input min={0.01} step={0.01} />
                  </InputGroup>
                </TextField>
                <TextField
                  value={dados.motivoDesconto}
                  onChange={(v) => setDados((prev) => ({ ...prev, motivoDesconto: v }))}
                  isRequired
                >
                  <Label>Motivo</Label>
                  <Input placeholder="Ex.: corrida com atraso reportado pelo passageiro" />
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
                    Aplicar
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
