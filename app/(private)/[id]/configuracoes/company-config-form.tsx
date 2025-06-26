"use client";

import React, { useActionState, useEffect, useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  getCompanyConfigsClient,
  updateCompanyConfigsClient,
} from "@/src/services/company-config-client";
import {
  CompanyConfig,
  CompanyConfigsUpdateDto,
} from "@/src/model/company-config";

interface FormState {
  success: boolean;
  message: string;
  data: CompanyConfigsUpdateDto;
}

async function handleSubmit(
  prevState: FormState,
  formData: FormData,
  empresaId: string,
  token: string
): Promise<FormState> {
  try {
    const updateData: CompanyConfigsUpdateDto = {};

    const dataFechamento = formData.get("dataFechamento");
    const calcularPrecoAutomatico = formData.get("calcularPrecoAutomatico");
    const precoPorKm = formData.get("precoPorKm");

    if (dataFechamento) {
      const day = parseInt(dataFechamento.toString());
      if (day >= 1 && day <= 31) {
        updateData.dataFechamento = day;
      }
    }

    if (calcularPrecoAutomatico !== null) {
      updateData.calcularPrecoAutomatico = calcularPrecoAutomatico === "true";
    }

    if (precoPorKm) {
      const price = parseFloat(precoPorKm.toString());
      if (price > 0) {
        updateData.precoPorKm = price;
      }
    }

    const result = await updateCompanyConfigsClient(
      empresaId,
      updateData,
      token
    );

    if (result) {
      return {
        success: true,
        message: "Configurações atualizadas com sucesso!",
        data: updateData,
      };
    } else {
      return {
        success: false,
        message: "Erro ao atualizar configurações.",
        data: updateData,
      };
    }
  } catch (error) {
    console.error("Erro:", error);
    return {
      success: false,
      message: "Erro interno do sistema.",
      data: {},
    };
  }
}

interface Props {
  empresaId: string;
  token: string;
  initialConfig: CompanyConfig | null;
}

export default function CompanyConfigForm({
  empresaId,
  token,
  initialConfig,
}: Props) {
  const router = useRouter();
  const [currentConfig, setCurrentConfig] = useState<CompanyConfig | null>(
    initialConfig
  );

  const [state, action, isLoading] = useActionState(
    (prevState: FormState, formData: FormData) =>
      handleSubmit(prevState, formData, empresaId, token),
    {
      success: false,
      message: "",
      data: {},
    }
  );

  // Recarregar configurações quando necessário
  const reloadConfigs = useCallback(async () => {
    try {
      const configs = await getCompanyConfigsClient(empresaId, token);
      setCurrentConfig(configs);
    } catch (error) {
      console.error("Erro ao recarregar configurações:", error);
    }
  }, [empresaId, token]);

  // Mostrar toast quando houver resultado
  useEffect(() => {
    if (state.message) {
      addToast({
        title: state.success ? "Sucesso" : "Erro",
        description: state.message,
        color: state.success ? "success" : "danger",
      });

      if (state.success) {
        // Recarregar configurações após sucesso
        reloadConfigs();
      }
    }
  }, [state, reloadConfigs]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Configurações da Empresa
        </h1>
        {currentConfig && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {currentConfig.empresaNome}
          </p>
        )}
      </div>

      <Card>
        <CardHeader className="flex gap-3">
          <Icon icon="mdi:cog" className="text-2xl text-primary" />
          <div className="flex flex-col">
            <p className="text-md font-semibold">Configurações Gerais</p>
            <p className="text-small text-default-500">
              Gerencie as configurações da sua empresa
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Form action={action} className="space-y-6">
            <Input
              name="dataFechamento"
              label="Dia do Fechamento Mensal"
              placeholder="15"
              type="number"
              min="1"
              max="31"
              defaultValue={currentConfig?.dataFechamento?.toString() || ""}
              description="Dia do mês para fechamento (1-31)"
              startContent={
                <Icon
                  icon="mdi:calendar"
                  className="text-lg text-default-400"
                />
              }
            />

            <div className="flex flex-col gap-2">
              <Switch
                name="calcularPrecoAutomatico"
                defaultSelected={
                  currentConfig?.calcularPrecoAutomatico || false
                }
                value="true"
              >
                Ativar cálculo automático por quilômetro
              </Switch>
              <p className="text-xs text-gray-500">
                Quando ativo, o preço será calculado automaticamente baseado na
                distância
              </p>
            </div>

            <Input
              name="precoPorKm"
              label="Preço por Quilômetro (R$)"
              placeholder="2.50"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={currentConfig?.precoPorKm?.toString() || ""}
              description="Valor cobrado por quilômetro rodado"
              startContent={
                <span className="text-lg text-default-400">R$</span>
              }
            />

            <div className="flex gap-4 justify-end pt-4">
              <Button
                color="default"
                variant="bordered"
                onPress={() => router.back()}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isLoading}
                startContent={
                  !isLoading && (
                    <Icon icon="mdi:content-save" className="text-lg" />
                  )
                }
              >
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>

      {currentConfig && (
        <Card className="mt-6">
          <CardHeader>
            <Icon icon="mdi:information" className="text-xl text-blue-500" />
            <p className="text-md font-semibold ml-2">Configurações Atuais</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Dia do Fechamento:</span>
                <span className="ml-2">{currentConfig.dataFechamento}</span>
              </div>
              <div>
                <span className="font-medium">Cálculo Automático:</span>
                <span className="ml-2">
                  {currentConfig.calcularPrecoAutomatico ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div>
                <span className="font-medium">Preço por Km:</span>
                <span className="ml-2">
                  R$ {currentConfig.precoPorKm?.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-medium">ID da Empresa:</span>
                <span className="ml-2 font-mono text-xs">
                  {currentConfig.empresaId}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
