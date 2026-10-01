"use client";

import { useState } from "react";
import { Alert, Button, Modal } from "@heroui/react";
import { RotaTabelaPreco } from "@/src/model/tabela-preco";
import { desativarRotaTabelaPreco } from "../../actions/desativar-rota-tabela-preco";

interface DesativarRotaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  rota: RotaTabelaPreco | null;
  onSucesso: () => void;
}

export default function DesativarRotaModal({
  isOpen,
  onOpenChange,
  empresaId,
  rota,
  onSucesso,
}: DesativarRotaModalProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  const [abertoAntes, setAbertoAntes] = useState(isOpen);
  if (isOpen !== abertoAntes) {
    setAbertoAntes(isOpen);
    if (isOpen) setErro(undefined);
  }

  const nomeRota = rota ? `${rota.cidadeOrigem} ↔ ${rota.cidadeDestino}` : "";

  async function handleConfirm() {
    if (!rota) return;

    setEnviando(true);
    setErro(undefined);

    const result = await desativarRotaTabelaPreco(empresaId, rota.id);

    setEnviando(false);

    if (result.success) {
      onSucesso();
    } else {
      setErro(result.message ?? "Não foi possível desativar a rota.");
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="md">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Desativar {nomeRota}?</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                  <p className="text-sm text-muted">
                    A rota deixa de ser usada no preço das próximas viagens desta empresa. Viagens
                    já criadas com ela não mudam.
                  </p>
                  <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Esta ação é definitiva</Alert.Title>
                      <Alert.Description>
                        Não há como reativar a rota, e {nomeRota} não poderá ser cadastrada de novo
                        para esta empresa, em nenhum sentido. Para mudar valores, use Editar.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                  {erro ? (
                    <p className="text-sm text-danger" role="alert">
                      {erro}
                    </p>
                  ) : null}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="tertiary" onPress={close} isDisabled={enviando}>
                    Cancelar
                  </Button>
                  <Button variant="danger" isPending={enviando} onPress={handleConfirm}>
                    Desativar definitivamente
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
