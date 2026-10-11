const express = require("express");
const cors = require("cors");

require("./database");

const caminhoesRoutes = require("./routes/caminhoes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensagem: "API LoadFit funcionando!"
    });
});

app.use("/caminhoes", caminhoesRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});