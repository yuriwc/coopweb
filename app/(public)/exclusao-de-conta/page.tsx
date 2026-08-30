"use client";

import React, { useActionState } from "react";
import { Button, TextField, TextArea, Label, InputGroup, FieldError } from "@heroui/react";
import { Form } from "@heroui/react";
import { Spinner } from "@heroui/react/spinner";
import { handleSubmit, type ExclusaoContaState } from "./actions";

const initialState: ExclusaoContaState = {
  success: false,
  message: "",
  data: {
    nomeCompleto: "",
    contato: "",
    motivo: "",
  },
};

export default function ExclusaoDeContaPage() {
  const [state, action, isLoading] = useActionState(handleSubmit, initialState);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F5F5F5] dark:bg-[#060607]">
      <div className="relative z-10 flex justify-center items-center min-h-screen p-4 py-12">
        <div className="w-full max-w-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-wide mb-2">
              CoopGo
            </h1>
            <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-slate-600 dark:text-slate-300">
              Solicitação de exclusão de conta
            </h2>
          </div>

          {state.success ? (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
              <p className="text-green-800 dark:text-green-300 font-semibold mb-2">
                Solicitação recebida
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                Sua solicitação de exclusão de conta e dados foi registrada. Ela será analisada e
                processada em até 15 dias úteis. Se precisar, entre em contato pelos canais de
                suporte do aplicativo informando o mesmo telefone ou e-mail cadastrado.
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 mb-8">
                <p>
                  Use este formulário para solicitar a exclusão da sua conta e dos seus dados
                  pessoais no CoopGo, conforme a Lei Geral de Proteção de Dados (LGPD).
                </p>
                <p>
                  Ao confirmar a exclusão, seus dados de cadastro (nome, contato, endereço) serão
                  removidos ou anonimizados. Registros de viagens podem ser mantidos por até 5
                  anos, conforme exigido pela legislação fiscal, mas deixam de ser associados à
                  sua identidade. O processamento leva até 15 dias úteis.
                </p>
              </div>

              <Form
                key={JSON.stringify(state.data)}
                action={action}
                className="space-y-6"
                validationBehavior="native"
              >
                <TextField name="nomeCompleto" defaultValue={state.data.nomeCompleto} isRequired>
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    Nome completo
                  </Label>
                  <InputGroup className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus-within:bg-white dark:focus-within:bg-gray-600 rounded-xl shadow-sm transition-all duration-300">
                    <InputGroup.Input className="text-slate-800 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                  </InputGroup>
                  <FieldError className="text-xs text-red-600 dark:text-red-400" />
                </TextField>

                <TextField name="contato" defaultValue={state.data.contato} isRequired>
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    Telefone ou e-mail cadastrado no app
                  </Label>
                  <InputGroup className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus-within:bg-white dark:focus-within:bg-gray-600 rounded-xl shadow-sm transition-all duration-300">
                    <InputGroup.Input className="text-slate-800 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                  </InputGroup>
                  <FieldError className="text-xs text-red-600 dark:text-red-400" />
                </TextField>

                <TextField name="motivo" defaultValue={state.data.motivo}>
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    Motivo (opcional)
                  </Label>
                  <TextArea
                    className="w-full min-h-24 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 rounded-xl shadow-sm transition-all duration-300 p-3 text-slate-800 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    placeholder="Conte, se quiser, o motivo da exclusão"
                  />
                </TextField>

                <Button
                  variant="primary"
                  isDisabled={isLoading}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md border border-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105 text-sm tracking-widest uppercase"
                >
                  {isLoading ? <Spinner color="current" /> : "Solicitar exclusão"}
                </Button>

                {state.message && !state.success && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 shadow-sm">
                    <p className="text-sm text-center text-red-700 dark:text-red-300 font-medium">
                      {state.message}
                    </p>
                  </div>
                )}
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
