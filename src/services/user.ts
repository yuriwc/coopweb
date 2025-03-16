export async function login(
  username: string,
  password: string,
): Promise<{ token: string } | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/auth/authenticate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    },
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }

  return response.json();
}
