import { Button } from "@heroui/react";
import { Modal, useOverlayState } from "@heroui/react";

interface ModalProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => Promise<unknown>;
}

export default function App({ name, onCancel, onConfirm }: ModalProps) {
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
        variant="tertiary"
        className="
                  flex justify-center
                  w-full items-center
                  border-[0.5px] border-black
                  p-2 text-xs
                  font-light tracking-[0.5em] uppercase
                  hover:bg-black hover:text-white transition-colors
                "
        onPress={open}
      >
        Alocar Motorista
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
