"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
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

  const handleClose = () => {
    setSelectedCentroCusto("");
    onOpen(false);
  };

  return (
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
        {(_) => (
          <>
            <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Icon
                    icon="solar:link-linear"
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Vincular Centro de Custo
                  </h3>
                  <p className="text-sm text-foreground-600">
                    Associar funcionário a um centro de custo
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="py-6 space-y-6">
              {/* Informações do Funcionário */}
              <Card className="border border-default-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Icon
                        icon="solar:user-linear"
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        Funcionário Selecionado
                      </h4>
                      <p className="text-sm text-foreground-600">
                        Dados do colaborador
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="flex items-center gap-4 p-4 bg-default-50 dark:bg-default-100/50 rounded-lg border border-default-200">
                    <Avatar
                      size="md"
                      name={funcionario.name?.charAt(0).toUpperCase()}
                      classNames={{
                        base: "bg-gradient-to-r from-purple-600 to-blue-600",
                        name: "text-white font-semibold",
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {funcionario.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Icon
                          icon="solar:phone-linear"
                          className="w-3 h-3 text-default-400"
                        />
                        <p className="text-sm text-foreground-600">
                          {funcionario.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Icon
                          icon="solar:location-linear"
                          className="w-3 h-3 text-default-400"
                        />
                        <p className="text-sm text-foreground-600">
                          {funcionario.cidade}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Chip variant="flat" color="primary" size="sm">
                        ID: {funcionario.id}
                      </Chip>
                      {funcionario.centroCustoCodigo && (
                        <Chip variant="flat" color="secondary" size="sm">
                          Centro: {funcionario.centroCustoCodigo}
                        </Chip>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Seleção do Centro de Custo */}
              <Card className="border border-default-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Icon
                        icon="solar:buildings-3-linear"
                        className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        Centro de Custo
                      </h4>
                      <p className="text-sm text-foreground-600">
                        {funcionario.centroCustoCodigo
                          ? `Atual: ${funcionario.centroCustoCodigo} - ${
                              funcionario.centroCustoDescricao || "N/A"
                            }`
                          : "Selecione o centro de custo para vincular"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <SelectCentrosCusto
                    empresa={empresa}
                    token={token}
                    setCentroCusto={setSelectedCentroCusto}
                  />
                </CardBody>
              </Card>
            </ModalBody>

            <ModalFooter className="bg-default-50 dark:bg-default-100/50">
              <Button
                variant="light"
                onPress={handleClose}
                startContent={
                  <Icon icon="solar:close-circle-linear" className="w-4 h-4" />
                }
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isLoading}
                startContent={
                  !isLoading ? (
                    <Icon icon="solar:link-linear" className="w-4 h-4" />
                  ) : null
                }
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
              >
                {isLoading ? "Vinculando..." : "Vincular"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
