const express = require("express");
const cors = require("cors");
const validarCliente = require("./clienteValidador");
const validarMotorista = require("./motoristaValidador");
const validarCaminhao = require("./caminhaoValidador");
const validarMaterial = require("./validador/materialValidador");
const servidor = express();

const PORTA = 3001;

servidor.use(cors());
servidor.use(express.json());

servidor.get("/", (req, res) => {
    res.json({
        mensagem: "API LoadFit funcionando!"
    });
});

// CLIENTE
servidor.post("/clientes", (req, res) => {

    const erros = validarCliente(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            sucesso: false,
            erros: erros
        });
    }

    res.status(200).json({
        sucesso: true,
        mensagem: "Cliente validado com sucesso!",
        dados: req.body
    });
});


// MOTORISTA
servidor.post("/motoristas", (req, res) => {

    const erros = validarMotorista(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            sucesso: false,
            erros: erros
        });
    }

    res.status(200).json({
        sucesso: true,
        mensagem: "Motorista validado com sucesso!",
        dados: req.body
    });
});


// CAMINHÃO
servidor.post("/caminhoes", (req, res) => {

    const erros = validarCaminhao(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            sucesso: false,
            erros: erros
        });
    }

    res.status(200).json({
        sucesso: true,
        mensagem: "Caminhão validado com sucesso!",
        dados: req.body
    });
});


// MATERIAL
servidor.post("/materiais", (req, res) => {

    const erros = validarMaterial(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            sucesso: false,
            erros: erros
        });
    }

    res.status(200).json({
        sucesso: true,
        mensagem: "Material validado com sucesso!",
        dados: req.body
    });
});


servidor.listen(PORTA, () => {
    console.log(`Servidor LoadFit rodando na porta ${PORTA}.`);
});
