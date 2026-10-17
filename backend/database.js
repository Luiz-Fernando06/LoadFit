const mysql = require("mysql2");

const banco = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "loadfit"
});

banco.connect((erro) => {
    if (erro) {
        console.log("Erro ao conectar com o MySQL:", erro);
        return;
    }

    console.log("MySQL conectado!");
});

module.exports = banco;