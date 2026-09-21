const API_URL = "http://localhost:3001";

export async function criarCliente({ nome, endereco, telefone }) {
  const res = await fetch(`${API_URL}/cadcliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, endereco, telefone }),
  });

  if (!res.ok) {
    throw new Error("Erro ao criar cliente");
  }

  return res.json();
}

export async function listarClientes() {
  const res = await fetch(`${API_URL}/clientes`);

  if (!res.ok) {
    throw new Error("Erro ao listar clientes");
  }

  return res.json();
}