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

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d{3})/, "$1-$2")
      .slice(0, 9);
  };

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
    <>
      {/* Back Button */}
      <div className="flex justify-center p-6 pb-0">
        <div className="w-full max-w-3xl">
          <Button
            variant="ghost"
            startContent={
              <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
            }
            onPress={() => router.back()}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Voltar
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="flex justify-center p-6 pt-4">
        <div className="w-full max-w-3xl">
          <Form
            key={JSON.stringify(state.data)}
            action={action}
            className="space-y-6"
            validationBehavior="native"
          >
        {/* Personal Information */}
        <Card className="border-0 shadow-none bg-transparent w-full max-w-4xl mx-auto">
          <CardHeader className="px-0 pb-4">
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Icon
                  icon="solar:user-linear"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Dados Pessoais
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Informações básicas do colaborador
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-0 pt-0">
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-blue-400 dark:hover:border-blue-500",
                    "focus-within:border-blue-500 dark:focus-within:border-blue-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-blue-400 dark:hover:border-blue-500",
                    "focus-within:border-blue-500 dark:focus-within:border-blue-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
                }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Address Section */}
        <Card className="border-0 shadow-none bg-transparent w-full max-w-4xl mx-auto">
          <CardHeader className="px-0 pb-4">
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Icon
                  icon="solar:home-linear"
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Endereço
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Localização residencial do colaborador
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-0 pt-0 space-y-4">
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-green-400 dark:hover:border-green-500",
                    "focus-within:border-green-500 dark:focus-within:border-green-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-green-400 dark:hover:border-green-500",
                    "focus-within:border-green-500 dark:focus-within:border-green-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-green-400 dark:hover:border-green-500",
                    "focus-within:border-green-500 dark:focus-within:border-green-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-green-400 dark:hover:border-green-500",
                    "focus-within:border-green-500 dark:focus-within:border-green-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-green-400 dark:hover:border-green-500",
                    "focus-within:border-green-500 dark:focus-within:border-green-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-green-400 dark:hover:border-green-500",
                    "focus-within:border-green-500 dark:focus-within:border-green-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
                }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Contact Section */}
        <Card className="border-0 shadow-none bg-transparent w-full max-w-4xl mx-auto">
          <CardHeader className="px-0 pb-4">
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Icon
                  icon="solar:phone-linear"
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Contato
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Informações para comunicação
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-0 pt-0 space-y-4">
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-purple-400 dark:hover:border-purple-500",
                    "focus-within:border-purple-500 dark:focus-within:border-purple-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
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
                    className="w-4 h-4 text-slate-400"
                  />
                }
                classNames={{
                  inputWrapper: [
                    "border-slate-300 dark:border-slate-600",
                    "bg-white dark:bg-slate-700",
                    "hover:border-purple-400 dark:hover:border-purple-500",
                    "focus-within:border-purple-500 dark:focus-within:border-purple-400",
                    "transition-colors duration-200",
                  ],
                  input: "text-slate-900 dark:text-white",
                  label: "text-slate-700 dark:text-slate-300",
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
                inputWrapper: [
                  "border-slate-300 dark:border-slate-600",
                  "bg-white dark:bg-slate-700",
                  "hover:border-purple-400 dark:hover:border-purple-500",
                  "focus-within:border-purple-500 dark:focus-within:border-purple-400",
                  "transition-colors duration-200",
                ],
                input: "text-slate-900 dark:text-white",
                label: "text-slate-700 dark:text-slate-300",
              }}
            />
          </CardBody>
        </Card>

        {/* Submit Section */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <Button
              type="submit"
              size="lg"
              className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
              isDisabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" color="white" />
                  Cadastrando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:user-plus-linear"
                    className="w-5 h-5"
                  />
                  Cadastrar Colaborador
                </div>
              )}
            </Button>

            {state.message && !state.success && (
              <div className="w-full max-w-md p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:warning-linear"
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                  />
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {state.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
          </Form>
        </div>
      </div>
    </>
  );
}
