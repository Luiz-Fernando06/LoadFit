function validarMaterial(dados) {
    const erros = [];

    const {
        descricao,
        peso,
        cliente_id,
        caminhao_id
    } = dados;

    if (!descricao || descricao.trim() === "") {
        erros.push("A descrição do material é obrigatória.");
    }

    if (
        peso === undefined ||
        peso === null ||
        peso === ""
    ) {
        erros.push("O peso do material é obrigatório.");
    } else if (isNaN(peso)) {
        erros.push("O peso deve ser um número.");
    } else if (Number(peso) <= 0) {
        erros.push("O peso deve ser maior que zero.");
    }

    if (
        cliente_id === undefined ||
        cliente_id === null ||
        cliente_id === ""
    ) {
        erros.push("O cliente_id é obrigatório.");
    } else if (
        !Number.isInteger(Number(cliente_id)) ||
        Number(cliente_id) <= 0
    ) {
        erros.push("O cliente_id deve ser um número inteiro positivo.");
    }

    if (
        caminhao_id !== undefined &&
        caminhao_id !== null &&
        caminhao_id !== ""
    ) {
        if (
            !Number.isInteger(Number(caminhao_id)) ||
            Number(caminhao_id) <= 0
        ) {
            erros.push("O caminhao_id deve ser um número inteiro positivo.");
        }
    }

    return erros;
}

module.exports = validarMaterial;