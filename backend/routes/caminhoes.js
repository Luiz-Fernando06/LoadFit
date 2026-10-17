const express = require("express");
const router = express.Router();

const db = require("../banco");

router.post("/", (req, res) => {

    const { placa, modelo, capacidade } = req.body;

    if (!placa || !modelo || !capacidade) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos."
        });
    }

    const sql = `
        INSERT INTO caminhoes (placa, modelo, capacidade)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [placa, modelo, capacidade],
        (erro, resultado) => {

            if (erro) {
                console.error("Erro ao cadastrar caminhão:", erro);

                return res.status(500).json({
                    mensagem: "Erro ao cadastrar caminhão."
                });
            }

            res.status(201).json({
                mensagem: "Caminhão cadastrado com sucesso!",
                id: resultado.insertId
            });
        }
    );
});

module.exports = router;