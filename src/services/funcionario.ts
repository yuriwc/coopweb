import { IColaborador } from "@/app/interface/IColaborador";

export async function createFuncionario(
  data: IColaborador,
  empresa: string,
): Promise<{ id: string } | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/passageiro/${empresa}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }

  return response.json();
}
