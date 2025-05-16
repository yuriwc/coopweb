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
    data: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (state.success) {
      addToast({
        title: "Sucesso",
        description: "Login efetuado com sucesso",
        variant: "solid",
        color: "success",
      });

      router.push("/home");
    }
  }, [router, state.success]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md border-[1px] border-black rounded-none p-8 bg-white">
        <h1 className="text-center text-2xl font-light tracking-[0.35em] uppercase mb-1 text-black">
          CoopGo
        </h1>
        <h2 className="text-center text-xs font-light tracking-[0.25em] uppercase mb-8 text-black">
          Gestão e Controle de mobilidade
        </h2>
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
            className="border-black border-[1px] rounded-none text-xs tracking-[0.18em] uppercase bg-white text-black placeholder:text-black/40"
          />
          <Spacer x={2} />
          <Input
            name="password"
            type="password"
            label="Senha"
            defaultValue={state.data.password}
            isRequired
            variant="bordered"
            className="border-black border-[1px] rounded-none text-xs tracking-[0.18em] uppercase bg-white text-black placeholder:text-black/40"
          />

          <Button
            isDisabled={isLoading}
            type="submit"
            color="primary"
            className="w-full flex justify-center items-center border-[1px] border-black rounded-none bg-white text-black text-xs tracking-[0.2em] uppercase font-light hover:bg-black hover:text-white transition"
          >
            {isLoading ? (
              <Spinner
                classNames={{ label: "text-foreground" }}
                variant="wave"
              />
            ) : (
              "Entrar"
            )}
          </Button>

          {state.message && !state.success && (
            <p className="text-xs text-center text-red-600 tracking-[0.1em] uppercase">
              {state.message}
            </p>
          )}
        </Form>
      </div>
    </div>
  );
}
