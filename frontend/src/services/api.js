const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '');

// Erro com os campos que a API devolve ({ erro, detalhes: [{ campo, mensagem }] }).
export class ApiError extends Error {
  constructor(mensagem, { status = 0, detalhes = [] } = {}) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

export async function requisicao(caminho, { metodo = 'GET', corpo } = {}) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
    );
  }

  if (resposta.status === 204) return null;

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    // resposta sem JSON válido: tratada abaixo
  }

  if (!resposta.ok) {
    throw new ApiError(dados?.erro || 'Ocorreu um erro inesperado. Tente novamente.', {
      status: resposta.status,
      detalhes: dados?.detalhes || [],
    });
  }

  return dados;
}
