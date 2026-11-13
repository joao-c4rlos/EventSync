-- Inscrição manual: nome, e-mail e data de nascimento passam a ser opcionais (dado de controle).
ALTER TABLE inscricoes
    MODIFY nome  VARCHAR(120) NULL,
    MODIFY email VARCHAR(160) NULL,
    ADD COLUMN data_nascimento DATE NULL AFTER telefone,
    ADD COLUMN origem VARCHAR(20) NOT NULL DEFAULT 'PUBLICA' AFTER data_nascimento;
-- A unicidade (evento_id, email) continua valendo: o MySQL aceita vários e-mails NULL.
