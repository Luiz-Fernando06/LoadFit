// database/MaterialDAO.js
import { getDb } from './db';
import { pesoAtualDoCaminhao, buscarCaminhaoPorId } from './CaminhaoDAO';

export async function criarMaterial({ descricao, peso, cliente_id, caminhao_id }) {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO material (descricao, peso, cliente_id, caminhao_id) VALUES (?, ?, ?, ?)',
    [descricao, peso, cliente_id, caminhao_id ?? null]
  );
  return result.lastInsertRowId;
}

export async function listarMateriais() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM material ORDER BY id DESC');
}

// Materiais que ainda não foram colocados em nenhum caminhão.
export async function listarMateriaisSemCaminhao() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM material WHERE caminhao_id IS NULL');
}

export async function listarMateriaisDoCaminhao(caminhaoId) {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM material WHERE caminhao_id = ?', [caminhaoId]);
}

export async function buscarMaterialPorId(id) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM material WHERE id = ?', [id]);
}

export async function atualizarMaterial(id, { descricao, peso, cliente_id, caminhao_id }) {
  const db = await getDb();
  await db.runAsync(
    'UPDATE material SET descricao = ?, peso = ?, cliente_id = ?, caminhao_id = ? WHERE id = ?',
    [descricao, peso, cliente_id, caminhao_id ?? null, id]
  );
}

export async function excluirMaterial(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM material WHERE id = ?', [id]);
}

/**
 * Regra de negócio central do LoadFit: tenta alocar um material a um
 * caminhão, mas só efetiva se não estourar a capacidade máxima do veículo.
 *
 * Retorna { sucesso: true } ou { sucesso: false, motivo: string }.
 */
export async function alocarMaterialAoCaminhao(materialId, caminhaoId) {
  const caminhao = await buscarCaminhaoPorId(caminhaoId);
  if (!caminhao) {
    return { sucesso: false, motivo: 'Caminhão não encontrado.' };
  }

  const material = await buscarMaterialPorId(materialId);
  if (!material) {
    return { sucesso: false, motivo: 'Material não encontrado.' };
  }

  const pesoAtual = await pesoAtualDoCaminhao(caminhaoId);
  const pesoFinal = pesoAtual + material.peso;

  if (pesoFinal > caminhao.capacidade_maxima) {
    return {
      sucesso: false,
      motivo: `Capacidade excedida: ${pesoFinal}kg > ${caminhao.capacidade_maxima}kg.`,
    };
  }

  await atualizarMaterial(materialId, {
    descricao: material.descricao,
    peso: material.peso,
    cliente_id: material.cliente_id,
    caminhao_id: caminhaoId,
  });

  return { sucesso: true };
}
