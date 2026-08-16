"use client";

import { useState } from "react";
import { Modal } from "@heroui/react";
import { Form } from "@heroui/react";
import { TextField, Label, Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { pagarVoucher } from "../action/pagar-voucher";
import { PagarVoucherDto, VoucherCooperativa } from "../../../../../../src/model/relatorio-vouchers";

interface ConfirmarPagamentoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherCooperativa | null;
  token: string;
  onSucesso: () => void;
}

const CAMPOS_VAZIOS: PagarVoucherDto = { formaPagamento: "", referenciaPagamento: "" };

export default function ConfirmarPagamentoModal({
  isOpen,
  onOpenChange,
  voucher,
  token,
  onSucesso,
}: ConfirmarPagamentoModalProps) {
  const [dados, setDados] = useState<PagarVoucherDto>(CAMPOS_VAZIOS);
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

    const result = await pagarVoucher({ voucherId: voucher.id, dados, token });

    setEnviando(false);

    if (result.success) {
      setDados(CAMPOS_VAZIOS);
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível registrar o pagamento.");
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
                  <Modal.Heading>Confirmar pagamento — {voucher?.numeroVoucher}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
              <Form
                className="flex flex-col gap-4 pb-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <TextField
                  value={dados.formaPagamento}
                  onChange={(v) => setDados((prev) => ({ ...prev, formaPagamento: v }))}
                  isRequired
                >
                  <Label>Forma de pagamento</Label>
                  <Input placeholder="Ex.: PIX" />
                </TextField>
                <TextField
                  value={dados.referenciaPagamento}
                  onChange={(v) => setDados((prev) => ({ ...prev, referenciaPagamento: v }))}
                  isRequired
                >
                  <Label>Referência</Label>
                  <Input placeholder="Ex.: código da transação" />
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
                    Confirmar
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
