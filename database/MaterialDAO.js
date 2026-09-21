const API_URL = "http://localhost:3001";

export async function criarMaterial({ descricao, peso, cliente_id, caminhao_id }) {
  const res = await fetch(`${API_URL}/cadmaterial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descricao, peso, cliente_id, caminhao_id }),
  });

  if (!res.ok) {
    throw new Error("Erro ao criar material");
  }

  return res.json();
}

export async function listarMateriais() {
  const res = await fetch(`${API_URL}/materiais`);

  if (!res.ok) {
    throw new Error("Erro ao listar materiais");
  }

  return res.json();
}