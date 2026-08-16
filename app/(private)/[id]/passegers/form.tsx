"use client";

import React, { useActionState, useEffect } from "react";
import { Button, TextField, Label, InputGroup } from "@heroui/react";
import { Card } from "@heroui/react";
import { Form } from "@heroui/react";
import { handleSubmit } from "./actions";
import { Spinner } from "@heroui/react/spinner";
import { toast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { IForm } from "@/src/interface/IForm";
import { IColaborador } from "@/src/interface/IColaborador";

interface Props {
  id: string;
}

const FIELD_LABEL_CLASS = "text-slate-700 dark:text-slate-300";
const FIELD_INPUT_CLASS = "text-slate-900 dark:text-white";

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
      toast("Sucesso", {
        description: "Colaborador cadastrado com sucesso",
        variant: "success",
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
            onPress={() => router.back()}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <Icon icon="solar:arrow-left-linear" className="w-5 h-5" />
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
          <Card.Header className="px-0 pb-4">
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
          </Card.Header>
          <Card.Content className="px-0 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField name="nome" defaultValue={state.data.nome} isRequired>
                <Label className={FIELD_LABEL_CLASS}>Nome</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:user-circle-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder="Digite o nome" className={FIELD_INPUT_CLASS} />
                </InputGroup>
              </TextField>
              <TextField name="sobrenome" defaultValue={state.data.sobrenome} isRequired>
                <Label className={FIELD_LABEL_CLASS}>Sobrenome</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:user-circle-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder="Digite o sobrenome" className={FIELD_INPUT_CLASS} />
                </InputGroup>
              </TextField>
            </div>
          </Card.Content>
        </Card>

        {/* Address Section */}
        <Card className="border-0 shadow-none bg-transparent w-full max-w-4xl mx-auto">
          <Card.Header className="px-0 pb-4">
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
          </Card.Header>
          <Card.Content className="px-0 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField name="rua" defaultValue={state.data.rua} isRequired>
                <Label className={FIELD_LABEL_CLASS}>Rua/Avenida</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-green-400 dark:hover:border-green-500 focus-within:border-green-500 dark:focus-within:border-green-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:map-point-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder="Digite o nome da rua" className={FIELD_INPUT_CLASS} />
                </InputGroup>
              </TextField>
              <TextField name="numero" defaultValue={state.data.numero} isRequired>
                <Label className={FIELD_LABEL_CLASS}>Número</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-green-400 dark:hover:border-green-500 focus-within:border-green-500 dark:focus-within:border-green-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:hashtag-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder="Ex: 123" className={FIELD_INPUT_CLASS} />
                </InputGroup>
              </TextField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField name="bairro" defaultValue={state.data.bairro} isRequired>
                <Label className={FIELD_LABEL_CLASS}>Bairro</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-green-400 dark:hover:border-green-500 focus-within:border-green-500 dark:focus-within:border-green-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:buildings-2-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder="Digite o bairro" className={FIELD_INPUT_CLASS} />
                </InputGroup>
              </TextField>
              <TextField name="cep" defaultValue={state.data.cep} isRequired>
                <Label className={FIELD_LABEL_CLASS}>CEP</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-green-400 dark:hover:border-green-500 focus-within:border-green-500 dark:focus-within:border-green-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:location-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    placeholder="00000-000"
                    maxLength={9}
                    className={FIELD_INPUT_CLASS}
                    onChange={(e) => {
                      e.target.value = formatCEP(e.target.value);
                    }}
                  />
                </InputGroup>
              </TextField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField name="cidade" defaultValue={state.data.cidade} isRequired>
                <Label className={FIELD_LABEL_CLASS}>Cidade</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-green-400 dark:hover:border-green-500 focus-within:border-green-500 dark:focus-within:border-green-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:city-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder="Digite a cidade" className={FIELD_INPUT_CLASS} />
                </InputGroup>
              </TextField>
              <TextField name="estado" defaultValue={state.data.estado} isRequired>
                <Label className={FIELD_LABEL_CLASS}>Estado</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-green-400 dark:hover:border-green-500 focus-within:border-green-500 dark:focus-within:border-green-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:global-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    placeholder="Ex: SP, RJ, MG"
                    maxLength={2}
                    className={FIELD_INPUT_CLASS}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }}
                  />
                </InputGroup>
              </TextField>
            </div>
          </Card.Content>
        </Card>

        {/* Contact Section */}
        <Card className="border-0 shadow-none bg-transparent w-full max-w-4xl mx-auto">
          <Card.Header className="px-0 pb-4">
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
          </Card.Header>
          <Card.Content className="px-0 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField name="telefone" defaultValue={state.data.telefone} isRequired>
                <Label className={FIELD_LABEL_CLASS}>Telefone</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-purple-400 dark:hover:border-purple-500 focus-within:border-purple-500 dark:focus-within:border-purple-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:phone-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={FIELD_INPUT_CLASS}
                    onChange={(e) => {
                      e.target.value = formatPhone(e.target.value);
                    }}
                  />
                </InputGroup>
              </TextField>
              <TextField name="email" type="email" defaultValue={state.data.email}>
                <Label className={FIELD_LABEL_CLASS}>Email (opcional)</Label>
                <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-purple-400 dark:hover:border-purple-500 focus-within:border-purple-500 dark:focus-within:border-purple-400 transition-colors duration-200">
                  <InputGroup.Prefix>
                    <Icon icon="solar:letter-linear" className="w-4 h-4 text-slate-400" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder="exemplo@email.com" className={FIELD_INPUT_CLASS} />
                </InputGroup>
              </TextField>
            </div>

            <TextField name="referencia" defaultValue={state.data.referencia}>
              <Label className={FIELD_LABEL_CLASS}>Ponto de Referência (opcional)</Label>
              <InputGroup className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-purple-400 dark:hover:border-purple-500 focus-within:border-purple-500 dark:focus-within:border-purple-400 transition-colors duration-200">
                <InputGroup.TextArea
                  placeholder="Ex: Próximo ao supermercado, em frente à padaria..."
                  rows={3}
                  className={FIELD_INPUT_CLASS}
                />
              </InputGroup>
            </TextField>
          </Card.Content>
        </Card>

        {/* Submit Section */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <Button
              variant="primary"
              type="submit"
              size="lg"
              className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
              isDisabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" color="current" />
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
