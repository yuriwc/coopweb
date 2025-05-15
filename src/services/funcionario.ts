import { IColaborador } from "../interface/IColaborador";
import { getToken } from "../utils/token/get-token";

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
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(data),
    },
  );

  console.log(response, await getToken());
  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }

  return response.json();
}
