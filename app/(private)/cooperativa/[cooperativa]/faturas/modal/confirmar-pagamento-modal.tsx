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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Confirmar pagamento — {voucher?.numeroVoucher}
            </ModalHeader>
            <ModalBody>
              <Form
                className="flex flex-col gap-4 pb-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <Input
                  label="Forma de pagamento"
                  placeholder="Ex.: PIX"
                  value={dados.formaPagamento}
                  onValueChange={(v) => setDados((prev) => ({ ...prev, formaPagamento: v }))}
                  isRequired
                />
                <Input
                  label="Referência"
                  placeholder="Ex.: código da transação"
                  value={dados.referenciaPagamento}
                  onValueChange={(v) => setDados((prev) => ({ ...prev, referenciaPagamento: v }))}
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
                    Confirmar
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
