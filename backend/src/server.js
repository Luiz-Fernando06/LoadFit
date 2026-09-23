require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { conectarBanco, query, client } = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", banco: client });
});

app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome?.trim() || !email?.trim() || !senha) {
      return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const existente = await query(
      "SELECT id FROM usuarios WHERE email = $1",
      [emailNormalizado]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({ erro: "Já existe um usuário com este e-mail." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    if (client === "postgres") {
      const resultado = await query(
        `INSERT INTO usuarios (nome, email, senha_hash)
         VALUES ($1, $2, $3)
         RETURNING id, nome, email`,
        [nome.trim(), emailNormalizado, senhaHash]
      );

      return res.status(201).json(resultado.rows[0]);
    }

    const resultado = await query(
      `INSERT INTO usuarios (nome, email, senha_hash)
       VALUES ($1, $2, $3)`,
      [nome.trim(), emailNormalizado, senhaHash]
    );

    return res.status(201).json({
      id: resultado.insertId,
      nome: nome.trim(),
      email: emailNormalizado,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email?.trim() || !senha) {
      return res.status(400).json({ erro: "Informe o e-mail e a senha." });
    }

    const resultado = await query(
      "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    const usuario = resultado.rows[0];

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao realizar login." });
  }
});

app.get("/materiais", async (req, res) => {
  try {
    const resultado = await query(
      `SELECT id, nome, categoria, peso, quantidade
       FROM materiais
       ORDER BY id DESC`
    );

    const materiais = resultado.rows.map((item) => ({
      ...item,
      peso: Number(item.peso),
      quantidade: Number(item.quantidade),
    }));

    return res.json(materiais);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao buscar materiais." });
  }
});

app.post("/materiais", async (req, res) => {
  try {
    const { nome, categoria, peso, quantidade } = req.body;
    const pesoNumero = Number(peso);
    const quantidadeNumero = Number(quantidade);

    if (!nome?.trim() || !categoria?.trim()) {
      return res.status(400).json({ erro: "Nome e categoria são obrigatórios." });
    }

    if (!Number.isFinite(pesoNumero) || pesoNumero <= 0) {
      return res.status(400).json({ erro: "O peso deve ser maior que zero." });
    }

    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
      return res.status(400).json({ erro: "A quantidade deve ser um número inteiro maior que zero." });
    }

    if (client === "postgres") {
      const resultado = await query(
        `INSERT INTO materiais (nome, categoria, peso, quantidade)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nome, categoria, peso, quantidade`,
        [nome.trim(), categoria.trim(), pesoNumero, quantidadeNumero]
      );

      const material = resultado.rows[0];
      return res.status(201).json({
        ...material,
        peso: Number(material.peso),
        quantidade: Number(material.quantidade),
      });
    }

    const resultado = await query(
      `INSERT INTO materiais (nome, categoria, peso, quantidade)
       VALUES ($1, $2, $3, $4)`,
      [nome.trim(), categoria.trim(), pesoNumero, quantidadeNumero]
    );

    return res.status(201).json({
      id: resultado.insertId,
      nome: nome.trim(),
      categoria: categoria.trim(),
      peso: pesoNumero,
      quantidade: quantidadeNumero,
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao cadastrar material." });
  }
});

app.delete("/materiais/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: "Material inválido." });
    }

    const resultado = await query("DELETE FROM materiais WHERE id = $1", [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: "Material não encontrado." });
    }

    return res.status(204).send();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao remover material." });
  }
});

async function iniciar() {
  try {
    await conectarBanco();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API LoadFit disponível em http://0.0.0.0:${PORT}`);
    });
  } catch (erro) {
    console.error("Não foi possível iniciar a API:", erro.message);
    process.exit(1);
  }
}

iniciar();
