function validarMotorista(dados) {
    const erros = [];

    const { nome, cnh, telefone } = dados;

    if (!nome || nome.trim() === "") {
        erros.push("O nome do motorista é obrigatório.");
    }

    if (!cnh || cnh.trim() === "") {
        erros.push("A CNH do motorista é obrigatória.");
    }

    if (cnh) {
        const cnhLimpa = cnh.replace(/\D/g, "");

        if (cnhLimpa.length !== 11) {
            erros.push("A CNH deve possuir 11 números.");
        }
    }

    if (!telefone || telefone.trim() === "") {
        erros.push("O telefone do motorista é obrigatório.");
    }

    if (telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, "");

        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            erros.push("O telefone deve possuir 10 ou 11 números.");
        }
    }

    return erros;
}

module.exports = validarMotorista;