const API_URL = "http://localhost:3001";

export async function criarCaminhao({ placa, modelo, capacidade_maxima, motorista_id }) {
  const res = await fetch(`${API_URL}/cadcaminhao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ placa, modelo, capacidade_maxima, motorista_id }),
  });

  if (!res.ok) {
    throw new Error("Erro ao criar caminhão");
  }

  return res.json();
}

export async function listarCaminhoes() {
  const res = await fetch(`${API_URL}/caminhoes`);

  if (!res.ok) {
    throw new Error("Erro ao listar caminhões");
  }

  return res.json();
}