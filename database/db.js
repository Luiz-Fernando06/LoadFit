// database/db.js
//
// Conexão única com o banco SQLite local do app (via expo-sqlite).
// Todo o resto do banco (DAOs) importa "getDb()" ou "initDatabase()" daqui.
//
// Instalação necessária (rodar no terminal, dentro da pasta do projeto):
//   npx expo install expo-sqlite
//
// Uso típico (ex: dentro do App.js ou de um contexto):
//   import { initDatabase } from './database/db';
//   useEffect(() => { initDatabase(); }, []);

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'loadfit.db';

let dbInstance = null;

/**
 * Abre (ou reaproveita) a conexão com o banco.
 * expo-sqlite mantém apenas UMA conexão por nome de arquivo,
 * então é seguro chamar isso várias vezes.
 */
export async function getDb() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbInstance;
}

/**
 * Cria as tabelas (se não existirem) e liga o suporte a chaves
 * estrangeiras, que no SQLite vem DESLIGADO por padrão.
 *
 * Chame isso uma vez, o mais cedo possível (ex: no início do App.js).
 */
export async function initDatabase() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS motorista (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      cnh       TEXT NOT NULL,
      telefone  TEXT
    );

    CREATE TABLE IF NOT EXISTS caminhao (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      placa               TEXT NOT NULL UNIQUE,
      modelo              TEXT NOT NULL,
      capacidade_maxima   REAL NOT NULL,
      motorista_id        INTEGER,
      FOREIGN KEY (motorista_id) REFERENCES motorista (id)
        ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS cliente (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      endereco  TEXT,
      telefone  TEXT
    );

    CREATE TABLE IF NOT EXISTS material (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao     TEXT NOT NULL,
      peso          REAL NOT NULL,
      cliente_id    INTEGER NOT NULL,
      caminhao_id   INTEGER,
      FOREIGN KEY (cliente_id) REFERENCES cliente (id)
        ON DELETE CASCADE,
      FOREIGN KEY (caminhao_id) REFERENCES caminhao (id)
        ON DELETE SET NULL
    );
  `);
}

/**
 * Útil durante o desenvolvimento, quando você mexe no schema
 * e quer recomeçar do zero. NÃO chamar isso em produção.
 */
export async function resetDatabase() {
  const db = await getDb();
  await db.execAsync(`
    DROP TABLE IF EXISTS material;
    DROP TABLE IF EXISTS caminhao;
    DROP TABLE IF EXISTS cliente;
    DROP TABLE IF EXISTS motorista;
  `);
  await initDatabase();
}
