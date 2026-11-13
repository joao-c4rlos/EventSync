ALTER TABLE eventos
    ADD COLUMN gratuito       BOOLEAN        NOT NULL DEFAULT TRUE,
    ADD COLUMN valor_ingresso DECIMAL(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE lancamentos
    ADD COLUMN inscricao_id BIGINT NULL,
    ADD CONSTRAINT uk_lancamentos_inscricao UNIQUE (inscricao_id),
    ADD CONSTRAINT fk_lancamentos_inscricao FOREIGN KEY (inscricao_id) REFERENCES inscricoes (id) ON DELETE CASCADE;
