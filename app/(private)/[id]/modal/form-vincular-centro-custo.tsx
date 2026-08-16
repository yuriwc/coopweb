"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Modal } from "@heroui/react";
import { Avatar } from "@heroui/react";
import { Chip } from "@heroui/react";
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
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpen}>
        <Modal.Container size="md">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Vincular Centro de Custo</Modal.Heading>
                </Modal.Header>

                <Modal.Body className="gap-6">
              <div className="flex items-center gap-3 p-3 rounded-md bg-default-50 dark:bg-default-100/10">
                <Avatar size="sm">
                  <Avatar.Fallback>
                    {funcionario.name?.charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {funcionario.name}
                  </p>
                  <p className="text-xs text-default-500 truncate">
                    {funcionario.phone || funcionario.cidade || "—"}
                  </p>
                </div>
                {funcionario.centroCustoCodigo && (
                  <Chip variant="tertiary" color="default" size="sm">
                    {funcionario.centroCustoCodigo}
                  </Chip>
                )}
              </div>

              <SelectCentrosCusto
                empresa={empresa}
                token={token}
                setCentroCusto={setSelectedCentroCusto}
              />
                </Modal.Body>

                <Modal.Footer>
                  <Button
                    variant="tertiary"
                    onPress={() => {
                      setSelectedCentroCusto("");
                      close();
                    }}
                    isDisabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleSubmit}
                    isPending={isLoading}
                  >
                    {!isLoading && <Icon icon="solar:link-linear" className="w-4 h-4" />}
                    Vincular
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
