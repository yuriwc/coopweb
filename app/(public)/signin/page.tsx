"use client";

import React, { useActionState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Spacer } from "@heroui/spacer";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { handleSubmit } from "./actions";

export default function App() {
  const router = useRouter();
  const [state, action, isLoading] = useActionState(handleSubmit, {
    success: false,
    message: "",
    redirect: "",
    data: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (state.success && state.redirect) {
      addToast({
        title: "Sucesso",
        description: "Login efetuado com sucesso",
        variant: "solid",
        color: "success",
      });

      router.push(state.redirect);
    }
  }, [router, state.success, state.redirect]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F5F5F5] dark:bg-[#060607]">
      <div className="relative z-10 flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg">
          {/* Header com logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-wide mb-2">
              CoopGo
            </h1>
            <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-slate-600 dark:text-slate-300">
              Gestão e Controle de mobilidade
            </h2>
          </div>

          <Form
            key={JSON.stringify(state.data)}
            action={action}
            className="space-y-6"
            validationBehavior="native"
          >
            <Input
              name="username"
              label="Usuário"
              defaultValue={state.data.username}
              isRequired
              variant="bordered"
              classNames={{
                base: "",
                mainWrapper: "",
                inputWrapper: [
                  "bg-gray-50 dark:bg-gray-700",
                  "border-gray-200 dark:border-gray-600",
                  "hover:bg-gray-100 dark:hover:bg-gray-600",
                  "focus-within:bg-white dark:focus-within:bg-gray-600",
                  "group-data-[focus=true]:bg-white dark:group-data-[focus=true]:bg-gray-600",
                  "rounded-xl",
                  "shadow-sm",
                  "transition-all duration-300",
                ],
                input: [
                  "text-slate-800 dark:text-slate-200",
                  "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                ],
                label: "text-slate-700 dark:text-slate-300 font-medium",
              }}
            />
            <Spacer x={2} />
            <Input
              name="password"
              type="password"
              label="Senha"
              defaultValue={state.data.password}
              isRequired
              variant="bordered"
              classNames={{
                base: "",
                mainWrapper: "",
                inputWrapper: [
                  "bg-gray-50 dark:bg-gray-700",
                  "border-gray-200 dark:border-gray-600",
                  "hover:bg-gray-100 dark:hover:bg-gray-600",
                  "focus-within:bg-white dark:focus-within:bg-gray-600",
                  "group-data-[focus=true]:bg-white dark:group-data-[focus=true]:bg-gray-600",
                  "rounded-xl",
                  "shadow-sm",
                  "transition-all duration-300",
                ],
                input: [
                  "text-slate-800 dark:text-slate-200",
                  "placeholder:text-slate-500 dark:placeholder:text-slate-400",
                ],
                label: "text-slate-700 dark:text-slate-300 font-medium",
              }}
            />

            <Button
              isDisabled={isLoading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md border border-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105 text-sm tracking-widest uppercase"
            >
              {isLoading ? (
                <Spinner
                  classNames={{ label: "text-white" }}
                  variant="wave"
                  color="white"
                />
              ) : (
                "Entrar"
              )}
            </Button>

            {state.message && !state.success && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 shadow-sm">
                <p className="text-sm text-center text-red-700 dark:text-red-300 font-medium tracking-widest uppercase">
                  {state.message}
                </p>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
