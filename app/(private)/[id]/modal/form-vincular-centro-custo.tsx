"use client";

import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import ShowToast from "@/src/components/Toast";
import { Funcionario } from "@/src/model/funcionario";
import SelectCentrosCusto from "../select/centros-custo";
import { vincularCentroCusto } from "../actions/centro-custo";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  funcionario: Funcionario;
  empresa: string;
  token: string;
  onSuccess?: () => void;
}

export default function VincularCentroCustoModal({
  isOpen,
  onOpen,
  funcionario,
  empresa,
  token,
  onSuccess,
}: Props) {
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!selectedCentroCusto) {
      ShowToast({
        color: "danger",
        title: "Selecione um centro de custo",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const result = await vincularCentroCusto(
        funcionario.id,
        parseInt(selectedCentroCusto),
        token
      );

      if (result.success) {
        ShowToast({
          color: "success",
          title: "Funcionário vinculado ao centro de custo com sucesso!",
        });

        setSelectedCentroCusto("");
        onOpen(false);
        onSuccess?.();
      } else {
        ShowToast({
          color: "danger",
          title: result.error,
        });
      }
    } catch (error) {
      console.error(error);
      ShowToast({
        color: "danger",
        title: "Erro ao vincular funcionário. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpen} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Vincular Centro de Custo
            </ModalHeader>

            <ModalBody className="gap-6">
              <div className="flex items-center gap-3 p-3 rounded-medium bg-default-50 dark:bg-default-100/10">
                <Avatar
                  size="sm"
                  name={funcionario.name?.charAt(0).toUpperCase()}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {funcionario.name}
                  </p>
                  <p className="text-xs text-default-500 truncate">
                    {funcionario.phone || funcionario.cidade || "—"}
                  </p>
                </div>
                {funcionario.centroCustoCodigo && (
                  <Chip variant="flat" color="secondary" size="sm">
                    {funcionario.centroCustoCodigo}
                  </Chip>
                )}
              </div>

              <SelectCentrosCusto
                empresa={empresa}
                token={token}
                setCentroCusto={setSelectedCentroCusto}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  setSelectedCentroCusto("");
                  onClose();
                }}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isLoading}
                startContent={
                  !isLoading && <Icon icon="solar:link-linear" className="w-4 h-4" />
                }
              >
                Vincular
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
