"use server";

import { IForm } from "@/src/interface/IForm";
import { login } from "@/src/services/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

    // Ajuste para secure/sameSite conforme ambiente
    const isProd = process.env.NODE_ENV === "production";
    cookieStore.set("token", response.token, {
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    redirect("/home");
  } catch (error: unknown) {
    console.error("Erro ao enviar formulário:", error);
    return {
      success: false,
      message: "Erro ao enviar formulário",
      data,
    };
  }
}
