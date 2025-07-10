async function attemptLogin(
  serverUrl: string,
  username: string,
  password: string,
  attempt: number = 1
): Promise<{ token: string } | null> {
  console.log(`🔄 Tentativa ${attempt} de login para:`, username);
  const startTime = Date.now();
  
  try {
    const response = await fetch(
      `${serverUrl}/api/v1/auth/authenticate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        // Timeout maior para cold start
        signal: AbortSignal.timeout(60000), // 60 segundos
      }
    );

    const endTime = Date.now();
    console.log(`⏱️ Tentativa ${attempt} - Tempo de resposta: ${endTime - startTime}ms`);
    console.log('📊 Status da resposta:', response.status);

    if (response.status === 504 && attempt === 1) {
      console.log('🔄 Gateway Timeout detectado, tentando novamente...');
      // Retry após 504 (cold start)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s
      return attemptLogin(serverUrl, username, password, 2);
    }

    if (!response.ok) {
      console.error("❌ Erro na requisição:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Login successful, token received');
    return data;
  } catch (error) {
    const endTime = Date.now();
    console.error(`❌ Erro na tentativa ${attempt} após ${endTime - startTime}ms:`, error);
    
    if (attempt === 1) {
      console.log('🔄 Primeira tentativa falhou, tentando novamente...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s
      return attemptLogin(serverUrl, username, password, 2);
    }
    
    return null;
  }
}

export async function login(
  username: string,
  password: string
): Promise<{ token: string } | null> {
  const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER;
  console.log('🚀 Iniciando login para:', username);
  console.log('🌐 Server URL:', serverUrl);
  
  if (!serverUrl) {
    console.error('❌ ERRO: URL do servidor não configurada!');
    return null;
  }
  
  return attemptLogin(serverUrl, username, password);
}
