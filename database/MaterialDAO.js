export async function criarMaterial({ descricao, peso, cliente_id, caminhao_id }) {
  const res = await fetch("http://192.168.0.51:3001/cadmaterial", {
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
  const res = await fetch("http://192.168.0.51:3001/materiais");

  if (!res.ok) {
    throw new Error("Erro ao listar materiais");
  }

  return res.json();
}

export async function atualizarMaterial(id, { descricao, peso, cliente_id, caminhao_id }) {
  const res = await fetch("http://192.168.0.51:3001/materiais/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descricao, peso, cliente_id, caminhao_id }),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar material");
  }

  return res.json();
}

export async function excluirMaterial(id) {
  const res = await fetch("http://192.168.0.51:3001/materiais/" + id, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Erro ao excluir material");
  }

  return res.json();
}