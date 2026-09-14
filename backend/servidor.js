const express = require("express");

const servidor = express();

const PORTA = 3000;

servidor.get ("/", (req,res)=> {
    res.send ("Conexão efetuada com sucesso");
});

servidor.listen(PORTA, () => {
    console.log("Conexão efetuada com sucesso");
    console.log(`Servidor está sendo executado na Porta ${PORTA}.`);
});