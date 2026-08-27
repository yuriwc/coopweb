"use client";

import React, { useActionState, useEffect, useState, useCallback } from "react";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Form } from "@heroui/react";
import { TextField, Label, Description, InputGroup } from "@heroui/react";
import { Switch } from "@heroui/react";
import { toast } from "@heroui/react";
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
    const precoPorKm = formData.get("precoPorKm");
    const precoBase = formData.get("precoBase");

    // Para o switch, vamos pegar todos os valores e verificar se "true" está presente
    const calcularPrecoAutomaticoValues = formData.getAll(
      "calcularPrecoAutomatico"
    );
    const switchIsOn = calcularPrecoAutomaticoValues.includes("true");

    if (dataFechamento) {
      const day = parseInt(dataFechamento.toString());
      if (day >= 1 && day <= 31) {
        updateData.dataFechamento = day;
      }
    }

    // Sempre incluir o valor do switch no update
    updateData.calcularPrecoAutomatico = switchIsOn;

    if (precoPorKm) {
      const price = parseFloat(precoPorKm.toString());
      if (price > 0) {
        updateData.precoPorKm = price;
      }
    }

    if (precoBase) {
      const basePrice = parseFloat(precoBase.toString());
      if (basePrice > 0) {
        updateData.precoBase = basePrice;
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
      toast(state.success ? "Sucesso" : "Erro", {
        description: state.message,
        variant: state.success ? "success" : "danger",
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
        <Card.Header className="flex gap-3">
          <Icon icon="mdi:cog" className="text-2xl text-accent" />
          <div className="flex flex-col">
            <p className="text-md font-semibold">Configurações Gerais</p>
            <p className="text-sm text-muted">
              Gerencie as configurações da sua empresa
            </p>
          </div>
        </Card.Header>
        <Card.Content>
          <Form action={action} className="space-y-6">
            <TextField
              name="dataFechamento"
              type="number"
              defaultValue={currentConfig?.dataFechamento?.toString() || ""}
            >
              <Label>Dia do Fechamento Mensal</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <Icon icon="mdi:calendar" className="text-lg text-muted" />
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="15" min="1" max="31" />
              </InputGroup>
              <Description>Dia do mês para fechamento (1-31)</Description>
            </TextField>

            <div className="flex flex-col gap-2">
              <Switch
                name="calcularPrecoAutomatico"
                defaultSelected={
                  currentConfig?.calcularPrecoAutomatico || false
                }
                value="true"
              >
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  Ativar cálculo automático por quilômetro
                </Switch.Content>
              </Switch>
              {/* Input hidden para garantir que sempre temos um valor quando o switch está off */}
              <input
                type="hidden"
                name="calcularPrecoAutomatico"
                value="false"
              />
              <p className="text-xs text-gray-500">
                Quando ativo, o preço será calculado automaticamente baseado na
                distância
              </p>
            </div>

            <TextField
              name="precoPorKm"
              type="number"
              defaultValue={currentConfig?.precoPorKm?.toString() || ""}
            >
              <Label>Preço por Quilômetro (R$)</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <span className="text-lg text-muted">R$</span>
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="2.50" step="0.01" min="0.01" />
              </InputGroup>
              <Description>Valor cobrado por quilômetro rodado</Description>
            </TextField>

            <TextField
              name="precoBase"
              type="number"
              defaultValue={currentConfig?.precoBase?.toString() || ""}
            >
              <Label>Preço Base da Corrida (R$)</Label>
              <InputGroup>
                <InputGroup.Prefix>
                  <span className="text-lg text-muted">R$</span>
                </InputGroup.Prefix>
                <InputGroup.Input placeholder="5.00" step="0.01" min="0.01" />
              </InputGroup>
              <Description>Valor fixo base para cada corrida</Description>
            </TextField>

            <div className="flex gap-4 justify-end pt-4">
              <Button
                variant="secondary"
                onPress={() => router.back()}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                isPending={isLoading}
              >
                {!isLoading && (
                  <Icon icon="mdi:content-save" className="text-lg" />
                )}
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </Form>
        </Card.Content>
      </Card>

      {currentConfig && (
        <Card className="mt-6">
          <Card.Header>
            <Icon icon="mdi:information" className="text-xl text-blue-500" />
            <p className="text-md font-semibold ml-2">Configurações Atuais</p>
          </Card.Header>
          <Card.Content>
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
                <span className="font-medium">Preço Base:</span>
                <span className="ml-2">
                  R$ {currentConfig.precoBase?.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-medium">ID da Empresa:</span>
                <span className="ml-2 font-mono text-xs">
                  {currentConfig.empresaId}
                </span>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}
