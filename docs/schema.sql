-- ======================================================================
-- TABELA DE GRUPOS
-- ======================================================================
CREATE TABLE IF NOT EXISTS grupos (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'ATIVO',
    deletado BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO grupos (descricao) VALUES ('Administrador'), ('Supervisor'), ('Visitante');
UPDATE grupos
SET status = 'INATIVO', deletado = true
WHERE id = 3;
SELECT * FROM grupos;
