export async function criarMotorista({ nome, cnh, telefone }) {
  const res = await fetch("http://192.168.0.51:3001/cadmotorista", {
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
  const res = await fetch("http://192.168.0.51:3001/motoristas");

  if (!res.ok) {
    throw new Error("Erro ao listar motoristas");
  }

  return res.json();
}

export async function atualizarMotorista(id, { nome, cnh, telefone }) {
  const res = await fetch("http://192.168.0.51:3001/motoristas/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, cnh, telefone }),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar motorista");
  }

  return res.json();
}

export async function excluirMotorista(id) {
  const res = await fetch("http://192.168.0.51:3001/motoristas/" + id, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Erro ao excluir motorista");
  }

  return res.json();
}