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
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-2xl rounded-xl shadow-lg p-8">
        <div className="flex flex-row">
          <h1 className="text-2xl font-semibold mb-6 text-center">
            Fazer login no sistema
          </h1>
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
          />
          <Spacer x={4} />
          <Input
            name="password"
            type="password"
            label="Senha"
            defaultValue={state.data.password}
            isRequired
            variant="bordered"
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
