"use server";

export type ExclusaoContaState = {
  success: boolean;
  message: string;
  data: {
    nomeCompleto: string;
    contato: string;
    motivo: string;
  };
};

export async function handleSubmit(
  prevState: ExclusaoContaState,
  formData: FormData,
): Promise<ExclusaoContaState> {
  const data = {
    nomeCompleto: formData.get("nomeCompleto") as string,
    contato: formData.get("contato") as string,
    motivo: (formData.get("motivo") as string) ?? "",
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/lgpd/solicitar-exclusao-publica`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nomeCompleto: data.nomeCompleto,
        contato: data.contato,
        motivo: data.motivo || undefined,
      }),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok || !json?.success) {
      return {
        success: false,
        message: json?.message ?? "Não foi possível registrar a solicitação. Tente novamente.",
        data,
      };
    }

    return {
      success: true,
      message: "Solicitação registrada com sucesso.",
      data,
    };
  } catch (error: unknown) {
    console.error("Erro ao enviar solicitação de exclusão de conta:", error);
    return {
      success: false,
      message: "Erro ao enviar solicitação. Tente novamente mais tarde.",
      data,
    };
  }
}
