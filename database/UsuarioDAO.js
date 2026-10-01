export async function criarUsuario({ nome, email, senha }) {
  const res = await fetch("http://192.168.0.51:3001/cadusuario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });

  if (!res.ok) {
    throw new Error("Erro ao criar usuário");
  }

  return res.json();
}

export async function loginUsuario({ email, senha }) {
  const res = await fetch("http://192.168.0.51:3001/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    throw new Error("E-mail ou senha inválidos");
  }

  return res.json();
}

export async function listarUsuarios() {
  const res = await fetch("http://192.168.0.51:3001/usuarios");

  if (!res.ok) {
    throw new Error("Erro ao listar usuários");
  }

  return res.json();
}

export async function atualizarUsuario(id, { nome, email, senha }) {
  const res = await fetch("http://192.168.0.51:3001/usuarios/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });

  if (!res.ok) {
    throw new Error("Erro ao atualizar usuário");
  }

  return res.json();
}

export async function excluirUsuario(id) {
  const res = await fetch("http://192.168.0.51:3001/usuarios/" + id, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Erro ao excluir usuário");
  }

  return res.json();
}