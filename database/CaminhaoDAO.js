export async function criarCaminhao({ placa, modelo, capacidade_maxima, motorista_id }) {
  const res = await fetch("http://192.168.0.51:3001/cadcaminhao", {
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
  const res = await fetch("http://192.168.0.51:3001/caminhoes");

  if (!res.ok) {
    throw new Error("Erro ao listar caminhões");
  }

  return res.json();
}

export async function atualizarCaminhao(id, { placa, modelo, capacidade_maxima, motorista_id }) {
  const res = await fetch("http://192.168.0.51:3001/caminhoes/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ placa, modelo, capacidade_maxima, motorista_id }),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar caminhão");
  }

  return res.json();
}

export async function excluirCaminhao(id) {
  const res = await fetch("http://192.168.0.51:3001/caminhoes/" + id, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Erro ao excluir caminhão");
  }

  return res.json();
}