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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50/80 to-indigo-100/60 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/30">
      {/* Background aquático com partículas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-sky-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-tl from-sky-400/10 to-indigo-400/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 p-4 flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header com botão voltar */}
          <div className="mb-8">
            <Button
              variant="light"
              startContent={
                <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
              }
              onPress={() => router.back()}
              className="mb-6 backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
            >
              Voltar
            </Button>
          </div>

          <Form
            key={JSON.stringify(state.data)}
            action={action}
            className="space-y-8 w-full"
            validationBehavior="native"
          >
            {/* Seção: Dados Pessoais */}
            <Card className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center justify-center w-full text-center">
                  <div className="p-3 bg-blue-100/60 dark:bg-blue-900/40 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 mb-3">
                    <Icon
                      icon="solar:user-linear"
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      Dados Pessoais
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
                    }}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Seção: Endereço */}
            <Card className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center justify-center w-full text-center">
                  <div className="p-3 bg-sky-100/60 dark:bg-sky-900/40 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 mb-3">
                    <Icon
                      icon="solar:home-linear"
                      className="w-6 h-6 text-sky-600 dark:text-sky-400"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      Endereço
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
                    }}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Seção: Contato */}
            <Card className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center justify-center w-full text-center">
                  <div className="p-3 bg-indigo-100/60 dark:bg-indigo-900/40 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 mb-3">
                    <Icon
                      icon="solar:phone-linear"
                      className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      Contato
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
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
                        className="w-4 h-4 text-slate-400 dark:text-slate-500"
                      />
                    }
                    classNames={{
                      base: "backdrop-blur-sm",
                      mainWrapper: "backdrop-blur-sm",
                      inputWrapper: [
                        "backdrop-blur-md",
                        "bg-white/40 dark:bg-white/10",
                        "border-white/50 dark:border-white/20",
                        "hover:bg-white/50 dark:hover:bg-white/15",
                        "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                        "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                        "rounded-xl",
                        "shadow-lg",
                        "transition-all duration-300",
                      ],
                      input: [
                        "text-slate-800 dark:text-slate-200",
                        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                      ],
                      label: "text-slate-700 dark:text-slate-300 font-medium",
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
                    base: "backdrop-blur-sm",
                    mainWrapper: "backdrop-blur-sm",
                    inputWrapper: [
                      "backdrop-blur-md",
                      "bg-white/40 dark:bg-white/10",
                      "border-white/50 dark:border-white/20",
                      "hover:bg-white/50 dark:hover:bg-white/15",
                      "focus-within:bg-white/60 dark:focus-within:bg-white/20",
                      "group-data-[focus=true]:bg-white/60 dark:group-data-[focus=true]:bg-white/20",
                      "rounded-xl",
                      "shadow-lg",
                      "transition-all duration-300",
                    ],
                    input: [
                      "text-slate-800 dark:text-slate-200",
                      "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                    ],
                    label: "text-slate-700 dark:text-slate-300 font-medium",
                  }}
                />
              </CardBody>
            </Card>

            {/* Botão de envio */}
            <Card className="backdrop-blur-md bg-gradient-to-r from-blue-50/60 via-sky-50/40 to-indigo-50/60 dark:from-blue-950/40 dark:via-sky-950/30 dark:to-indigo-950/40 border border-white/30 dark:border-white/20 shadow-xl rounded-2xl">
              <CardBody className="py-8">
                <div className="flex flex-col items-center space-y-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full max-w-md backdrop-blur-md bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 hover:from-blue-600 hover:via-sky-600 hover:to-indigo-600 text-white font-semibold py-3 px-8 text-lg rounded-xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
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
                    <div className="w-full max-w-md p-4 backdrop-blur-md bg-red-50/60 dark:bg-red-950/40 border border-red-200/50 dark:border-red-800/50 rounded-xl shadow-lg">
                      <div className="flex items-center gap-2 justify-center">
                        <Icon
                          icon="solar:warning-linear"
                          className="w-5 h-5 text-red-600 dark:text-red-400"
                        />
                        <p className="text-sm text-red-700 dark:text-red-300 text-center font-medium">
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
    </div>
  );
}
