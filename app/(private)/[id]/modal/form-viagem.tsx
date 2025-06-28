"use client";

import { useState } from "react";
import { Funcionario } from "@/src/model/funcionario";
import TipoViagem from "../tipoViagem";
import ShowToast from "@/src/components/Toast";
import SelectCooperativas from "../select/cooperativas";
import SelectCentrosCusto from "../select/centros-custo";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  passagers: Funcionario[];
  empresa: string;
  token: string;
}

export default function TripRequestModal({
  isOpen,
  onOpen,
  passagers,
  empresa,
  token,
}: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [cooperativa, setCooperativa] = useState<string>("");
  const [centroCusto, setCentroCusto] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Função de validação
  function validate() {
    const cidades = passagers.map((passager) => passager.cidade);

    if (!selectedPlan) {
      ShowToast({
        color: "danger",
        title: "Selecione um plano de viagem",
      });
      return false;
    }

    if (!centroCusto) {
      ShowToast({
        color: "danger",
        title: "Selecione um centro de custo",
      });
      return false;
    }

    if (new Set(cidades).size !== 1) {
      ShowToast({
        color: "danger",
        title: "Todos os passageiros devem ser da mesma cidade!",
      });
      return false;
    }

    return true;
  }

  // Função para gerar os dados do request
  function generateDataToRequest() {
    const passagersID = passagers.map((passager) => passager.id);

    return {
      empresaID: empresa,
      tipoViagem: selectedPlan,
      cooperativaID: cooperativa,
      centroCustoId: centroCusto,
      passageiros: passagersID,
    };
  }

  // Função para realizar a solicitação da viagem
  async function requestViagem() {
    const data = generateDataToRequest();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/viagem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      await response.json();

      ShowToast({
        color: "success",
        title: "Viagem solicitada com sucesso!",
      });
    } catch (error) {
      console.error(error);
      ShowToast({
        color: "danger",
        title: "Erro ao solicitar a viagem. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSolicitarViagem() {
    if (validate()) {
      await requestViagem();
      onOpen(false);
    }
  }

  return (
    <>
      <Button
        variant="solid"
        color="primary"
        onPress={() => onOpen(true)}
        startContent={<Icon icon="solar:bolt-linear" className="w-4 h-4" />}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
      >
        Viagem Imediata
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpen}
        size="2xl"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon
                      icon="solar:map-point-wave-linear"
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Solicitar Viagem
                    </h3>
                    <p className="text-sm text-foreground-600">
                      Configure sua viagem imediata
                    </p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="py-6 space-y-6">
                {/* Seção: Cooperativa */}
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
                          Cooperativa
                        </h4>
                        <p className="text-sm text-foreground-600">
                          Selecione a cooperativa responsável
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <SelectCooperativas
                      setCooperativa={setCooperativa}
                      empresa={empresa}
                      token={token}
                    />
                  </CardBody>
                </Card>

                {/* Seção: Centro de Custo */}
                <Card className="border border-default-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Icon
                          icon="solar:wallet-money-linear"
                          className="w-5 h-5 text-orange-600 dark:text-orange-400"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">
                          Centro de Custo
                        </h4>
                        <p className="text-sm text-foreground-600">
                          Selecione o centro de custo para a viagem
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <SelectCentrosCusto
                      setCentroCusto={setCentroCusto}
                      empresa={empresa}
                      token={token}
                    />
                  </CardBody>
                </Card>

                {/* Seção: Passageiros */}
                <Card className="border border-default-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 w-full justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                          <Icon
                            icon="solar:users-group-two-rounded-linear"
                            className="w-5 h-5 text-violet-600 dark:text-violet-400"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">
                            Passageiros
                          </h4>
                          <p className="text-sm text-foreground-600">
                            Lista de colaboradores selecionados
                          </p>
                        </div>
                      </div>
                      <Badge
                        content={passagers.length}
                        color="primary"
                        shape="circle"
                      >
                        <Chip variant="flat" color="primary" size="sm">
                          {passagers.length} selecionado
                          {passagers.length !== 1 ? "s" : ""}
                        </Chip>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                      {passagers.map((passager, index) => (
                        <div
                          key={passager.id}
                          className="flex items-center gap-4 p-3 bg-default-50 dark:bg-default-100/50 rounded-lg border border-default-200"
                        >
                          <Avatar
                            size="sm"
                            name={passager.name?.charAt(0).toUpperCase()}
                            classNames={{
                              base: "bg-gradient-to-r from-violet-600 to-blue-600",
                              name: "text-white font-semibold",
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {passager.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Icon
                                icon="solar:phone-linear"
                                className="w-3 h-3 text-default-400"
                              />
                              <p className="text-xs text-foreground-600">
                                {passager.phone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Chip variant="flat" size="sm" color="secondary">
                              #{index + 1}
                            </Chip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Seção: Tipo de Viagem */}
                <Card className="border border-default-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <Icon
                          icon="solar:route-linear"
                          className="w-5 h-5 text-amber-600 dark:text-amber-400"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">
                          Tipo de Viagem
                        </h4>
                        <p className="text-sm text-foreground-600">
                          Escolha o tipo de serviço desejado
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <TipoViagem setSelectedPlan={setSelectedPlan} />
                  </CardBody>
                </Card>
              </ModalBody>

              <ModalFooter className="bg-default-50 dark:bg-default-100/50">
                <Button
                  variant="light"
                  onPress={onClose}
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
                  color="primary"
                  onPress={handleSolicitarViagem}
                  isLoading={isLoading}
                  startContent={
                    !isLoading ? (
                      <Icon icon="solar:plane-linear" className="w-4 h-4" />
                    ) : null
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                >
                  {isLoading ? "Solicitando..." : "Solicitar Viagem"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
