const http = require('http');

const PORTA = 3000;

const servidor = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    res.end(JSON.stringify({
        mensagem: 'Conexão efetuada com sucesso'
    }));
});

servidor.listen(PORTA, () => {
    console.log('Servidor iniciado com sucesso!');
    console.log('Conexão efetuada com sucesso');
    console.log(`Servidor rodando na porta ${PORTA}`);
});