// database/MotoristaDAO.js
import { getDb } from './db';

export async function criarMotorista({ nome, cnh, telefone }) {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO motorista (nome, cnh, telefone) VALUES (?, ?, ?)',
    [nome, cnh, telefone ?? null]
  );
  return result.lastInsertRowId;
}

export async function listarMotoristas() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM motorista ORDER BY nome');
}

export async function buscarMotoristaPorId(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM motorista WHERE id = ?', [id]);
}

export async function atualizarMotorista(id, { nome, cnh, telefone }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE motorista SET nome = ?, cnh = ?, telefone = ? WHERE id = ?',
    [nome, cnh, telefone ?? null, id]
  );
}

export async function excluirMotorista(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM motorista WHERE id = ?', [id]);
}
