function validarCliente(dados) {
    const erros = [];

    const { nome, endereco, telefone } = dados;

    if (!nome || nome.trim() === "") {
        erros.push("O nome do cliente é obrigatório.");
    }

    if (!endereco || endereco.trim() === "") {
        erros.push("O endereço do cliente é obrigatório.");
    }

    if (!telefone || telefone.trim() === "") {
        erros.push("O telefone do cliente é obrigatório.");
    }

    if (telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, "");

        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            erros.push("O telefone deve possuir 10 ou 11 números.");
        }
    }

    return erros;
}

module.exports = validarCliente;