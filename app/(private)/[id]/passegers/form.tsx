"use client";

import React, { useActionState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Form } from "@heroui/form";
import { Textarea } from "@heroui/input";
import { Input } from "@heroui/input";
import { handleSubmit } from "./actions";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { IForm } from "@/src/interface/IForm";
import { IColaborador } from "@/src/interface/IColaborador";

interface Props {
  id: string;
}

export default function App({ id }: Props) {
  const router = useRouter();

  const [state, action, isLoading] = useActionState(
    (prevState: IForm<IColaborador>, formData: FormData) =>
      handleSubmit(prevState, formData, id),
    {
      success: false,
      message: "",
      data: {
        nome: "",
        sobrenome: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        cep: "",
        estado: "",
        telefone: "",
        email: "",
        referencia: "",
      },
    }
  );

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d{3})/, "$1-$2")
      .slice(0, 9);
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})/, "$1-$2")
      .slice(0, 15);
  };

  useEffect(() => {
    if (state.success) {
      addToast({
        title: "Sucesso",
        description: "Colaborador cadastrado com sucesso",
        variant: "solid",
        color: "success",
      });
      router.back();
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-4 flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header com botão voltar */}
        <div className="mb-8">
          <Button
            variant="light"
            startContent={
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
            }
            onPress={() => router.back()}
            className="mb-6"
          >
            Voltar
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Novo Colaborador
            </h1>
            <p className="text-foreground-600 text-lg">
              Preencha as informações para cadastrar um novo colaborador
            </p>
          </div>
        </div>

        <Form
          key={JSON.stringify(state.data)}
          action={action}
          className="space-y-8 w-full"
          validationBehavior="native"
        >
          {/* Seção: Dados Pessoais */}
          <Card className="border border-default-200 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 w-full justify-center">
                <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <Icon
                    icon="solar:user-linear"
                    className="w-6 h-6 text-violet-600 dark:text-violet-400"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground">
                    Dados Pessoais
                  </h2>
                  <p className="text-sm text-foreground-600">
                    Informações básicas do colaborador
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="nome"
                  label="Nome"
                  placeholder="Digite o nome"
                  defaultValue={state.data.nome}
                  isRequired
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:user-circle-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
                <Input
                  name="sobrenome"
                  label="Sobrenome"
                  placeholder="Digite o sobrenome"
                  defaultValue={state.data.sobrenome}
                  isRequired
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:user-circle-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
              </div>
            </CardBody>
          </Card>

          {/* Seção: Endereço */}
          <Card className="border border-default-200 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 w-full justify-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Icon
                    icon="solar:home-linear"
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground">
                    Endereço
                  </h2>
                  <p className="text-sm text-foreground-600">
                    Localização residencial do colaborador
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="rua"
                  label="Rua/Avenida"
                  placeholder="Digite o nome da rua"
                  defaultValue={state.data.rua}
                  isRequired
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:map-point-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
                <Input
                  name="numero"
                  label="Número"
                  placeholder="Ex: 123"
                  defaultValue={state.data.numero}
                  isRequired
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:hashtag-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="bairro"
                  label="Bairro"
                  placeholder="Digite o bairro"
                  defaultValue={state.data.bairro}
                  isRequired
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:buildings-2-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
                <Input
                  name="cep"
                  label="CEP"
                  placeholder="00000-000"
                  defaultValue={state.data.cep}
                  isRequired
                  variant="bordered"
                  maxLength={9}
                  onChange={(e) => {
                    e.target.value = formatCEP(e.target.value);
                  }}
                  startContent={
                    <Icon
                      icon="solar:location-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="cidade"
                  label="Cidade"
                  placeholder="Digite a cidade"
                  defaultValue={state.data.cidade}
                  isRequired
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:city-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
                <Input
                  name="estado"
                  label="Estado"
                  placeholder="Ex: SP, RJ, MG"
                  defaultValue={state.data.estado}
                  isRequired
                  variant="bordered"
                  maxLength={2}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                  startContent={
                    <Icon
                      icon="solar:global-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
              </div>
            </CardBody>
          </Card>

          {/* Seção: Contato */}
          <Card className="border border-default-200 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 w-full justify-center">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Icon
                    icon="solar:phone-linear"
                    className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground">
                    Contato
                  </h2>
                  <p className="text-sm text-foreground-600">
                    Informações para comunicação
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="telefone"
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  defaultValue={state.data.telefone}
                  isRequired
                  variant="bordered"
                  maxLength={15}
                  onChange={(e) => {
                    e.target.value = formatPhone(e.target.value);
                  }}
                  startContent={
                    <Icon
                      icon="solar:phone-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
                <Input
                  name="email"
                  type="email"
                  label="Email (opcional)"
                  placeholder="exemplo@email.com"
                  defaultValue={state.data.email}
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:letter-linear"
                      className="w-4 h-4 text-default-400"
                    />
                  }
                  classNames={{
                    input: "text-foreground",
                    label: "text-foreground-700",
                  }}
                />
              </div>

              <Textarea
                name="referencia"
                label="Ponto de Referência (opcional)"
                placeholder="Ex: Próximo ao supermercado, em frente à padaria..."
                defaultValue={state.data.referencia}
                variant="bordered"
                minRows={3}
                maxRows={5}
                classNames={{
                  input: "text-foreground",
                  label: "text-foreground-700",
                }}
              />
            </CardBody>
          </Card>

          {/* Botão de envio */}
          <Card className="border border-default-200 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-950/50 dark:to-blue-950/50 shadow-lg">
            <CardBody className="py-8">
              <div className="flex flex-col items-center space-y-4">
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full max-w-md bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold py-3 px-8 text-lg"
                  isDisabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" color="white" />
                      Cadastrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:user-plus-linear" className="w-5 h-5" />
                      Cadastrar Colaborador
                    </div>
                  )}
                </Button>

                {state.message && !state.success && (
                  <div className="w-full max-w-md p-4 bg-danger-50 dark:bg-danger-950/50 border border-danger-200 dark:border-danger-800 rounded-lg">
                    <div className="flex items-center gap-2 justify-center">
                      <Icon
                        icon="solar:warning-linear"
                        className="w-5 h-5 text-danger-600"
                      />
                      <p className="text-sm text-danger-700 dark:text-danger-400 text-center">
                        {state.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Form>
      </div>
    </div>
  );
}
