const API_URL = "http://localhost:3001";

export async function criarMotorista({ nome, cnh, telefone }) {
  const res = await fetch(`${API_URL}/cadmotorista`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, cnh, telefone }),
  });

  if (!res.ok) {
    throw new Error("Erro ao criar motorista");
  }

  return res.json();
}

export async function listarMotoristas() {
  const res = await fetch(`${API_URL}/motoristas`);

  if (!res.ok) {
    throw new Error("Erro ao listar motoristas");
  }

  return res.json();
}