"use server";

import { IColaborador } from "@/app/interface/IColaborador";
import { IForm } from "@/app/interface/IForm";
import { createFuncionario } from "@/src/services/funcionario";

export async function handleSubmit(
  prevState: IForm<IColaborador>,
  formData: FormData,
) {
  const data = {
    nome: formData.get("nome") as string,
    sobrenome: formData.get("sobrenome") as string,
    rua: formData.get("rua") as string,
    numero: formData.get("numero") as string,
    bairro: formData.get("bairro") as string,
    cidade: formData.get("cidade") as string,
    cep: formData.get("cep") as string,
    estado: formData.get("estado") as string,
    telefone: formData.get("telefone") as string,
    email: formData.get("email") as string,
    referencia: formData.get("referencia") as string,
  };

  try {
    const response = await createFuncionario(
      data,
      "5f461c7e-07dd-437c-b3f4-76956a3945ff",
    );

    if (!response) {
      return {
        success: false,
        message: "Erro ao enviar formulário",
        data,
      };
    }

    return {
      success: true,
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
      message: "Cadastro enviado com sucesso",
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
