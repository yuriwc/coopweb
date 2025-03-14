"use client";

import React, { useActionState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Textarea } from "@heroui/input";
import { Input } from "@heroui/input";
import { handleSubmit } from "./actions";
import { Spinner } from "@heroui/spinner";
import { Spacer } from "@heroui/spacer";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function App() {
  const router = useRouter();
  const [state, action, isLoading] = useActionState(handleSubmit, {
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
  });

  useEffect(() => {
    if (state.success) {
      addToast({
        title: "Sucesso",
        description: "Colaborador cadastrado com sucesso",
        variant: "solid",
        color: "success",
      });
    }
  }, [state.success]);

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl rounded-xl shadow-lg p-8">
        <div className="flex flex-row">
          <Icon
            cursor="pointer"
            onClick={() => router.back()}
            icon="material-symbols-light:arrow-back"
            height={30}
          />
          <Spacer x={4} />
          <h1 className="text-2xl font-semibold mb-6 text-center">
            Cadastrar um novo colaborador
          </h1>
        </div>
        <Form
          key={JSON.stringify(state.data)}
          action={action}
          className="space-y-6"
          validationBehavior="native"
        >
          <div className="flex flex-row justify-between w-full">
            <Input
              className="w-full"
              name="nome"
              label="Nome"
              defaultValue={state.data.nome}
              isRequired
              variant="bordered"
            />
            <Spacer x={4} />
            <Input
              name="sobrenome"
              label="Sobrenome"
              defaultValue={state.data.sobrenome}
              isRequired
              variant="bordered"
            />
          </div>
          <div className="flex flex-row justify-between w-full">
            <Input
              name="rua"
              label="Rua"
              defaultValue={state.data.rua}
              isRequired
              variant="bordered"
            />
            <Spacer x={4} />
            <Input
              className="w-80"
              name="numero"
              label="Número"
              defaultValue={state.data.numero}
              isRequired
              variant="bordered"
            />
            <Spacer x={4} />
            <Input
              name="bairro"
              label="Bairro"
              defaultValue={state.data.bairro}
              isRequired
              variant="bordered"
            />
          </div>
          <div className="flex flex-row justify-between w-full">
            <Input
              name="cidade"
              label="Cidade"
              defaultValue={state.data.cidade}
              isRequired
              variant="bordered"
            />
            <Spacer x={4} />
            <Input
              name="cep"
              label="CEP"
              defaultValue={state.data.cep}
              isRequired
              variant="bordered"
            />
          </div>
          <div className="flex flex-row justify-between w-full">
            <Input
              name="estado"
              label="Estado"
              defaultValue={state.data.estado}
              isRequired
              variant="bordered"
            />
            <Spacer x={4} />
            <Input
              name="telefone"
              label="Telefone"
              defaultValue={state.data.telefone}
              isRequired
              variant="bordered"
            />
          </div>
          <Input
            name="email"
            type="email"
            label="Email"
            defaultValue={state.data.email}
            isRequired
            variant="bordered"
          />
          <Textarea
            name="referencia"
            label="Referência"
            defaultValue={state.data.referencia}
            isRequired
            variant="bordered"
            minRows={4}
          />

          <Button type="submit" color="primary" className="w-full">
            {isLoading ? (
              <Spinner
                classNames={{ label: "text-foreground mt-4" }}
                label="wave"
                variant="wave"
              />
            ) : (
              "Enviar"
            )}
          </Button>

          {state.message && !state.success && (
            <p className={`text-sm text-center "text-red-600"}`}>
              {state.message}
            </p>
          )}
        </Form>
      </div>
    </div>
  );
}
