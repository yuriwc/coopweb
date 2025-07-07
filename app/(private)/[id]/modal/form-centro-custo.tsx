"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import ShowToast from "@/src/components/Toast";

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
      const response = await fetch(
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
        variant="light"
        color="success"
        onPress={() => onOpen(true)}
        startContent={
          <Icon icon="solar:buildings-3-linear" className="w-4 h-4" />
        }
        className="backdrop-blur-sm bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-200/30 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-300 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25"
        size="sm"
      >
        Centro de Custo
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpen}
        size="lg"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Icon
                      icon="solar:buildings-3-linear"
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      Cadastrar Centro de Custo
                    </h3>
                    <p className="text-sm text-foreground-600">
                      Configure um novo centro de custo para a empresa
                    </p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="py-6 space-y-6">
                <Card className="border border-default-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Icon
                          icon="solar:document-text-linear"
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">
                          Informações Básicas
                        </h4>
                        <p className="text-sm text-foreground-600">
                          Dados identificadores do centro de custo
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0 space-y-4">
                    <Input
                      label="Código"
                      placeholder="Ex: CC001, ADM, VENDAS"
                      value={formData.codigo}
                      onChange={(e) =>
                        handleInputChange("codigo", e.target.value)
                      }
                      isRequired
                      variant="bordered"
                      startContent={
                        <Icon
                          icon="solar:hashtag-linear"
                          className="w-4 h-4 text-default-400"
                        />
                      }
                      classNames={{
                        inputWrapper: [
                          "border-default-200",
                          "hover:border-emerald-300",
                          "focus-within:border-emerald-500",
                        ],
                      }}
                    />

                    <Textarea
                      label="Descrição"
                      placeholder="Ex: Administrativo, Recursos Humanos, Vendas..."
                      value={formData.descricao}
                      onChange={(e) =>
                        handleInputChange("descricao", e.target.value)
                      }
                      isRequired
                      variant="bordered"
                      minRows={3}
                      maxRows={5}
                      classNames={{
                        inputWrapper: [
                          "border-default-200",
                          "hover:border-emerald-300",
                          "focus-within:border-emerald-500",
                        ],
                      }}
                    />
                  </CardBody>
                </Card>
              </ModalBody>

              <ModalFooter className="bg-default-50 dark:bg-default-100/50">
                <Button
                  variant="light"
                  onPress={handleClose}
                  startContent={
                    <Icon
                      icon="solar:close-circle-linear"
                      className="w-4 h-4"
                    />
                  }
                >
                  Cancelar
                </Button>
                <Button
                  color="success"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  startContent={
                    !isLoading ? (
                      <Icon
                        icon="solar:check-circle-linear"
                        className="w-4 h-4"
                      />
                    ) : null
                  }
                  className="bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold"
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
