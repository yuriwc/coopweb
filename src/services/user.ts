export async function login(
  username: string,
  password: string
): Promise<{ token: string } | null> {
  const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER;
  console.log('Server URL:', serverUrl);
  const response = await fetch(
    `${serverUrl}/api/v1/auth/authenticate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    }
  );

  console.log(response);

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }

  return response.json();
}
