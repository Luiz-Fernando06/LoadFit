const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "loadfit"
});

db.connect((err) => {
  if (err) {
    console.error("Deu ruim na conexão com o MySQL:", err);
  } else {
    console.log("MySQL conectado com sucesso!");
  }
});

app.post("/cadcliente", (req, res) => {
  const { nome, endereco, telefone } = req.body;
  const sql = "INSERT INTO cliente (nome, endereco, telefone) VALUES (?, ?, ?)";
  db.query(sql, [nome, endereco, telefone], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao salvar os dados." }); }
    res.status(201).json({ id: result.insertId, nome, endereco, telefone });
  });
});

app.get("/clientes", (req, res) => {
  db.query("SELECT * FROM cliente ORDER BY nome", (err, resultados) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao buscar os dados." }); }
    res.json(resultados);
  });
});

app.post("/cadmotorista", (req, res) => {
  const { nome, cnh, telefone } = req.body;
  const sql = "INSERT INTO motorista (nome, cnh, telefone) VALUES (?, ?, ?)";
  db.query(sql, [nome, cnh, telefone], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao salvar os dados." }); }
    res.status(201).json({ id: result.insertId, nome, cnh, telefone });
  });
});

app.get("/motoristas", (req, res) => {
  db.query("SELECT * FROM motorista ORDER BY nome", (err, resultados) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao buscar os dados." }); }
    res.json(resultados);
  });
});

app.post("/cadcaminhao", (req, res) => {
  const { placa, modelo, capacidade_maxima, motorista_id } = req.body;
  const sql = "INSERT INTO caminhao (placa, modelo, capacidade_maxima, motorista_id) VALUES (?, ?, ?, ?)";
  db.query(sql, [placa, modelo, capacidade_maxima, motorista_id || null], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao salvar os dados." }); }
    res.status(201).json({ id: result.insertId, placa, modelo, capacidade_maxima, motorista_id });
  });
});

app.get("/caminhoes", (req, res) => {
  const sql = `
    SELECT caminhao.*, motorista.nome AS motorista_nome
    FROM caminhao
    LEFT JOIN motorista ON motorista.id = caminhao.motorista_id
    ORDER BY caminhao.placa
  `;
  db.query(sql, (err, resultados) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao buscar os dados." }); }
    res.json(resultados);
  });
});

app.post("/cadmaterial", (req, res) => {
  const { descricao, peso, cliente_id, caminhao_id } = req.body;
  const sql = "INSERT INTO material (descricao, peso, cliente_id, caminhao_id) VALUES (?, ?, ?, ?)";
  db.query(sql, [descricao, peso, cliente_id, caminhao_id || null], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao salvar os dados." }); }
    res.status(201).json({ id: result.insertId, descricao, peso, cliente_id, caminhao_id });
  });
});

app.get("/materiais", (req, res) => {
  db.query("SELECT * FROM material ORDER BY id DESC", (err, resultados) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao buscar os dados." }); }
    res.json(resultados);
  });
});

app.post("/cadusuario", (req, res) => {
  const { nome, email, senha } = req.body;
  const sql = "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)";
  db.query(sql, [nome, email, senha], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao salvar os dados." }); }
    res.status(201).json({ id: result.insertId, nome, email });
  });
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const sql = "SELECT id, nome, email FROM usuario WHERE email = ? AND senha = ?";
  db.query(sql, [email, senha], (err, resultados) => {
    if (err) { console.error(err); return res.status(500).json({ message: "Erro ao verificar os dados." }); }
    if (resultados.length === 0) return res.status(401).json({ message: "E-mail ou senha inválidos." });
    res.json(resultados[0]);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});