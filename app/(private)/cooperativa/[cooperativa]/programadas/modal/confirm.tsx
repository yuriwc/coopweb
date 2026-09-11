import { Button } from "@heroui/react";
import { Modal, useOverlayState } from "@heroui/react";

interface ModalProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => Promise<unknown>;
  /** Sem motorista escolhido não há o que confirmar. */
  isDisabled?: boolean;
}

export default function App({ name, onCancel, onConfirm, isDisabled }: ModalProps) {
  const { isOpen, open, setOpen } = useOverlayState();

  const handleClose = (close: () => void) => {
    onCancel();
    close();
  };
  const handleConfirm = (close: () => void) => {
    onConfirm();
    close();
  };

  return (
    <>
      <Button
        variant="primary"
        className="shrink-0"
        onPress={open}
        isDisabled={isDisabled}
      >
        Alocar motorista
      </Button>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={setOpen}>
          <Modal.Container>
            <Modal.Dialog>
              {({ close }) => (
                <>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>Confirmar atribuição</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p>
                      Tem certeza que deseja atribuir o motorista <b>{name}</b> à
                      programação?
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="danger-soft"
                      onPress={() => handleClose(close)}
                    >
                      Cancelar
                    </Button>
                    <Button variant="primary" onPress={() => handleConfirm(close)}>
                      Confirmar
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
