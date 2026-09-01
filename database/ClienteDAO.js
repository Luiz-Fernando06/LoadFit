// database/ClienteDAO.js
import { getDb } from './db';

export async function criarCliente({ nome, endereco, telefone }) {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO cliente (nome, endereco, telefone) VALUES (?, ?, ?)',
    [nome, endereco ?? null, telefone ?? null]
  );
  return result.lastInsertRowId;
}

export async function listarClientes() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM cliente ORDER BY nome');
}

export async function buscarClientePorId(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM cliente WHERE id = ?', [id]);
}

export async function atualizarCliente(id, { nome, endereco, telefone }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE cliente SET nome = ?, endereco = ?, telefone = ? WHERE id = ?',
    [nome, endereco ?? null, telefone ?? null, id]
  );
}

export async function excluirCliente(id) {
  const db = await getDb();
  // Os materiais desse cliente são apagados junto (ON DELETE CASCADE no schema).
  await db.runAsync('DELETE FROM cliente WHERE id = ?', [id]);
}
