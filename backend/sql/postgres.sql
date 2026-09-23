-- Primeiro crie um banco chamado "loadfit" no PostgreSQL e conecte-se a ele.
-- Depois execute este arquivo dentro desse banco.

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materiais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    peso NUMERIC(10, 2) NOT NULL CHECK (peso > 0),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
