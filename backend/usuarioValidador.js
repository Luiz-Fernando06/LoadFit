function validarUsuario(dados) {
    const erros = [];

    const { nome, email, senha } = dados;

    if (!nome || nome.trim() === "") {
        erros.push("O nome do usuário é obrigatório.");
    }

    if (!email || email.trim() === "") {
        erros.push("O e-mail do usuário é obrigatório.");
    } else {
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!emailValido) {
            erros.push("O e-mail informado é inválido.");
        }
    }

    if (!senha || senha.trim() === "") {
        erros.push("A senha do usuário é obrigatória.");
    } else if (senha.length < 6) {
        erros.push("A senha deve possuir pelo menos 6 caracteres.");
    }

    return erros;
}

module.exports = validarUsuario;