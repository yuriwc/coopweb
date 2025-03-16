"use server";

import { IForm } from "@/src/interface/IForm";
import { login } from "@/src/services/user";
import { cookies } from "next/headers";

export async function handleSubmit(
  prevState: IForm<{ username: string; password: string }>,
  formData: FormData,
) {
  const cookieStore = await cookies();
  const data = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  try {
    const response = await login(data.username, data.password);

    if (!response) {
      return {
        success: false,
        message: "Erro ao fazer login",
        data,
      };
    }

    if (!response.token) {
      return {
        success: false,
        message: "Erro ao fazer login",
        data,
      };
    }

    cookieStore.set("token", response.token, { secure: true });
    return {
      success: true,
      data: {
        username: "",
        password: "",
      },
      message: "Login Efetuado com sucesso",
    };
  } catch (error: unknown) {
    console.error("Erro ao enviar formulário:", error);
    return {
      success: false,
      message: "Erro ao enviar formulário",
      data,
    };
  }
}
