// database/CaminhaoDAO.js
import { getDb } from './db';

export async function criarCaminhao({ placa, modelo, capacidade_maxima, motorista_id }) {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO caminhao (placa, modelo, capacidade_maxima, motorista_id) VALUES (?, ?, ?, ?)',
    [placa, modelo, capacidade_maxima, motorista_id ?? null]
  );
  return result.lastInsertRowId;
}

export async function listarCaminhoes() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM caminhao ORDER BY placa');
}

// Traz o caminhão já com o nome do motorista (JOIN), útil pra telas de listagem.
export async function listarCaminhoesComMotorista() {
  const db = await getDb();
  return db.getAllAsync(`
    SELECT
      caminhao.*,
      motorista.nome AS motorista_nome
    FROM caminhao
    LEFT JOIN motorista ON motorista.id = caminhao.motorista_id
    ORDER BY caminhao.placa
  `);
}

export async function buscarCaminhaoPorId(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM caminhao WHERE id = ?', [id]);
}

export async function atualizarCaminhao(id, { placa, modelo, capacidade_maxima, motorista_id }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE caminhao SET placa = ?, modelo = ?, capacidade_maxima = ?, motorista_id = ? WHERE id = ?',
    [placa, modelo, capacidade_maxima, motorista_id ?? null, id]
  );
}

export async function excluirCaminhao(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM caminhao WHERE id = ?', [id]);
}

/**
 * Soma o peso de todos os materiais já alocados nesse caminhão.
 * Serve de base para a lógica de "capacidade excedida" do app.
 */
export async function pesoAtualDoCaminhao(caminhaoId) {
  const db = await getDb();
  const row = await db.getFirstAsync(
    'SELECT COALESCE(SUM(peso), 0) AS peso_total FROM material WHERE caminhao_id = ?',
    [caminhaoId]
  );
  return row.peso_total;
}
