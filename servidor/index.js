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

// ---------- CLIENTE ----------
app.put("/clientes/:id", (req, res) => {
  const id = req.params.id;
  const { nome, endereco, telefone } = req.body;

  const sql = "UPDATE cliente SET nome = ?, endereco = ?, telefone = ? WHERE id = ?";

  db.query(sql, [nome, endereco, telefone, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar cliente:", err);
      return res.status(500).json({ message: "Erro ao atualizar." });
    }
    res.json({ message: "Cliente atualizado!" });
  });
});

app.delete("/clientes/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM cliente WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir cliente:", err);
      return res.status(500).json({ message: "Erro ao excluir." });
    }
    res.json({ message: "Cliente excluído!" });
  });
});

// ---------- MOTORISTA ----------
app.put("/motoristas/:id", (req, res) => {
  const id = req.params.id;
  const { nome, cnh, telefone } = req.body;

  const sql = "UPDATE motorista SET nome = ?, cnh = ?, telefone = ? WHERE id = ?";

  db.query(sql, [nome, cnh, telefone, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar motorista:", err);
      return res.status(500).json({ message: "Erro ao atualizar." });
    }
    res.json({ message: "Motorista atualizado!" });
  });
});

app.delete("/motoristas/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM motorista WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir motorista:", err);
      return res.status(500).json({ message: "Erro ao excluir." });
    }
    res.json({ message: "Motorista excluído!" });
  });
});

// ---------- CAMINHAO ----------
app.put("/caminhoes/:id", (req, res) => {
  const id = req.params.id;
  const { placa, modelo, capacidade_maxima, motorista_id } = req.body;

  const sql = "UPDATE caminhao SET placa = ?, modelo = ?, capacidade_maxima = ?, motorista_id = ? WHERE id = ?";

  db.query(sql, [placa, modelo, capacidade_maxima, motorista_id || null, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar caminhão:", err);
      return res.status(500).json({ message: "Erro ao atualizar." });
    }
    res.json({ message: "Caminhão atualizado!" });
  });
});

app.delete("/caminhoes/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM caminhao WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir caminhão:", err);
      return res.status(500).json({ message: "Erro ao excluir." });
    }
    res.json({ message: "Caminhão excluído!" });
  });
});

// ---------- MATERIAL ----------
app.put("/materiais/:id", (req, res) => {
  const id = req.params.id;
  const { descricao, peso, cliente_id, caminhao_id } = req.body;

  const sql = "UPDATE material SET descricao = ?, peso = ?, cliente_id = ?, caminhao_id = ? WHERE id = ?";

  db.query(sql, [descricao, peso, cliente_id, caminhao_id || null, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar material:", err);
      return res.status(500).json({ message: "Erro ao atualizar." });
    }
    res.json({ message: "Material atualizado!" });
  });
});

app.delete("/materiais/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM material WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir material:", err);
      return res.status(500).json({ message: "Erro ao excluir." });
    }
    res.json({ message: "Material excluído!" });
  });
});

// ---------- USUARIO ----------
app.get("/usuarios", (req, res) => {
  db.query("SELECT id, nome, email FROM usuario ORDER BY nome", (err, resultados) => {
    if (err) {
      console.error("Erro ao buscar usuarios:", err);
      return res.status(500).json({ message: "Erro ao buscar os dados." });
    }
    res.json(resultados);
  });
});

app.put("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  const { nome, email, senha } = req.body;

  const sql = "UPDATE usuario SET nome = ?, email = ?, senha = ? WHERE id = ?";

  db.query(sql, [nome, email, senha, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar usuario:", err);
      return res.status(500).json({ message: "Erro ao atualizar." });
    }
    res.json({ message: "Usuário atualizado!" });
  });
});

app.delete("/usuarios/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM usuario WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir usuario:", err);
      return res.status(500).json({ message: "Erro ao excluir." });
    }
    res.json({ message: "Usuário excluído!" });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});