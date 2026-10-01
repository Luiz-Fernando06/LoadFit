export async function criarCliente({ nome, endereco, telefone }) {
  const res = await fetch("http://192.168.0.51:3001/cadcliente", {
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
  const res = await fetch("http://192.168.0.51:3001/clientes");

  if (!res.ok) {
    throw new Error("Erro ao listar clientes");
  }

  return res.json();
}

export async function atualizarCliente(id, { nome, endereco, telefone }) {
  const res = await fetch("http://192.168.0.51:3001/clientes/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, endereco, telefone }),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar cliente");
  }

  return res.json();
}

export async function excluirCliente(id) {
  const res = await fetch("http://192.168.0.51:3001/clientes/" + id, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Erro ao excluir cliente");
  }

  return res.json();
}