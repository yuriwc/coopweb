"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import ShowToast from "@/src/components/Toast";
import { fetchComLog } from "@/src/utils/log-fetch";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  empresa: string;
  token: string;
  onSuccess?: () => void;
}

export default function CentroCustoModal({
  isOpen,
  onOpen,
  token,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!formData.codigo.trim()) {
      ShowToast({
        color: "danger",
        title: "Código é obrigatório",
      });
      return false;
    }

    if (!formData.descricao.trim()) {
      ShowToast({
        color: "danger",
        title: "Descrição é obrigatória",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const response = await fetchComLog(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/centro-custo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        ShowToast({
          color: "success",
          title: "Centro de custo cadastrado com sucesso!",
        });

        setFormData({ codigo: "", descricao: "" });
        onOpen(false);
        onSuccess?.();
      } else {
        const errorData = await response.json();
        ShowToast({
          color: "danger",
          title: errorData.message || "Erro ao cadastrar centro de custo",
        });
      }
    } catch {
      ShowToast({
        color: "danger",
        title: "Erro ao cadastrar centro de custo. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ codigo: "", descricao: "" });
    onOpen(false);
  };

  return (
    <>
      <Button
        variant="flat"
        onPress={() => onOpen(true)}
        startContent={
          <Icon icon="solar:buildings-3-linear" className="w-4 h-4" />
        }
        size="sm"
      >
        Centro de Custo
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpen} size="md">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cadastrar Centro de Custo
              </ModalHeader>

              <ModalBody className="gap-4">
                <Input
                  label="Código"
                  placeholder="Ex: CC001, ADM, VENDAS"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                  isRequired
                  variant="bordered"
                />

                <Textarea
                  label="Descrição"
                  placeholder="Ex: Administrativo, Recursos Humanos, Vendas..."
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  isRequired
                  variant="bordered"
                  minRows={3}
                  maxRows={5}
                />
              </ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={handleClose} isDisabled={isLoading}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  startContent={
                    !isLoading && (
                      <Icon icon="solar:check-circle-linear" className="w-4 h-4" />
                    )
                  }
                >
                  Cadastrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
