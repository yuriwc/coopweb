"use server";

import { cookies } from "next/headers";
import { login } from "@/src/services/user";

export async function handleSubmit(
  prevState: {
    success: boolean;
    message: string;
    redirect: string;
    data: { username: string; password: string };
  },
  formData: FormData,
) {
  const cookieStore = await cookies();
  const data = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  try {
    const response = await login(data.username, data.password);

    if (!response || !response.token) {
      return {
        success: false,
        message: "Erro ao fazer login",
        redirect: "",
        data,
      };
    }

    const isProd = process.env.NODE_ENV === "production";
    cookieStore.set("token", response.token, {
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return {
      success: true,
      message: "",
      redirect: "/home",
      data,
    };
  } catch (error: unknown) {
    console.error("Erro ao enviar formulário:", error);
    return {
      success: false,
      message: "Erro ao enviar formulário",
      redirect: "",
      data,
    };
  }
}
