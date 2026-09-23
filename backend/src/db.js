require("dotenv").config();

const { Pool } = require("pg");
const mysql = require("mysql2/promise");

const client = (process.env.DB_CLIENT || "postgres").toLowerCase();
let conexao;

function mysqlSql(sql) {
  // As consultas do projeto usam $1, $2... no estilo PostgreSQL.
  // Para MySQL, os parâmetros são convertidos para ?.
  return sql.replace(/\$\d+/g, "?");
}

async function conectarBanco() {
  if (client === "postgres") {
    conexao = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await conexao.query("SELECT 1");
    console.log("Banco PostgreSQL conectado.");
    return;
  }

  if (client === "mysql") {
    conexao = await mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    await conexao.query("SELECT 1");
    console.log("Banco MySQL conectado.");
    return;
  }

  throw new Error('DB_CLIENT deve ser "postgres" ou "mysql".');
}

async function query(sql, parametros = []) {
  if (!conexao) {
    throw new Error("Banco de dados ainda não foi conectado.");
  }

  if (client === "postgres") {
    const resultado = await conexao.query(sql, parametros);
    return {
      rows: resultado.rows,
      rowCount: resultado.rowCount,
      insertId: resultado.rows?.[0]?.id,
    };
  }

  const [resultado] = await conexao.execute(mysqlSql(sql), parametros);

  if (Array.isArray(resultado)) {
    return {
      rows: resultado,
      rowCount: resultado.length,
      insertId: undefined,
    };
  }

  return {
    rows: [],
    rowCount: resultado.affectedRows || 0,
    insertId: resultado.insertId,
  };
}

module.exports = {
  conectarBanco,
  query,
  client,
};
