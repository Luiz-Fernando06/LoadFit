function validarCaminhao(dados) {
    const erros = [];

    const {
        placa,
        modelo,
        capacidade_maxima,
        motorista_id
    } = dados;

    if (!placa || placa.trim() === "") {
        erros.push("A placa do caminhão é obrigatória.");
    }

    if (placa) {
        const placaLimpa = placa
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase();

        const placaValida = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placaLimpa);

        if (!placaValida) {
            erros.push("A placa do caminhão é inválida.");
        }
    }

    if (!modelo || modelo.trim() === "") {
        erros.push("O modelo do caminhão é obrigatório.");
    }

    if (
        capacidade_maxima === undefined ||
        capacidade_maxima === null ||
        capacidade_maxima === ""
    ) {
        erros.push("A capacidade máxima é obrigatória.");
    } else if (isNaN(capacidade_maxima)) {
        erros.push("A capacidade máxima deve ser um número.");
    } else if (Number(capacidade_maxima) <= 0) {
        erros.push("A capacidade máxima deve ser maior que zero.");
    }

    if (
        motorista_id !== undefined &&
        motorista_id !== null &&
        motorista_id !== ""
    ) {
        if (!Number.isInteger(Number(motorista_id)) || Number(motorista_id) <= 0) {
            erros.push("O motorista_id deve ser um número inteiro positivo.");
        }
    }

    return erros;
}

module.exports = validarCaminhao;