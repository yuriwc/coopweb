import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  useDraggable,
} from "@heroui/modal";
import React from "react";

interface ModalProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => Promise<unknown>;
}

export default function App({ name, onCancel, onConfirm }: ModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Corrigido o tipo do ref para HTMLElement
  const targetRef = React.useRef<HTMLElement>(null);
  const { moveProps } = useDraggable({
    targetRef: targetRef as React.RefObject<HTMLElement>,
    canOverflow: true,
    isDisabled: !isOpen,
  });

  const handleClose = (onClose: () => void) => {
    onCancel();
    onClose();
  };
  const handleConfirm = (onClose: () => void) => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <Button
        className="
                  flex justify-center
                  w-full items-center
                  border-[0.5px] border-black
                  p-2 text-xs
                  font-light tracking-[0.5em] uppercase
                  hover:bg-black hover:text-white transition-colors
                "
        onPress={onOpen}
      >
        Alocar Motorista
      </Button>
      <Modal ref={targetRef} isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader {...moveProps} className="flex flex-col gap-1">
                Confirmar atribuição
              </ModalHeader>
              <ModalBody>
                <p>
                  Tem certeza que deseja atribuir o motorista <b>{name}</b> à
                  programação?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => handleClose(onClose)}
                >
                  Cancelar
                </Button>
                <Button color="primary" onPress={() => handleConfirm(onClose)}>
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
