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
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-blue-50 via-sky-50/80 to-indigo-100/60 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/30">
      {/* Background aquático com partículas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-400/20 to-sky-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-indigo-400/15 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-linear-to-br from-cyan-400/10 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-linear-to-tl from-sky-400/10 to-indigo-400/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-md backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-8 shadow-xl">
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
            <Spacer x={2} />
            <Input
              name="password"
              type="password"
              label="Senha"
              defaultValue={state.data.password}
              isRequired
              variant="bordered"
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

            <Button
              isDisabled={isLoading}
              type="submit"
              className="w-full backdrop-blur-md bg-linear-to-r from-blue-500 via-sky-500 to-indigo-500 hover:from-blue-600 hover:via-sky-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105 text-sm tracking-widest uppercase"
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
              <div className="backdrop-blur-md bg-red-50/60 dark:bg-red-950/40 border border-red-200/50 dark:border-red-800/50 rounded-xl p-3 shadow-lg">
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
