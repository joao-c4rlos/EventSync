CREATE TABLE eventos (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    organizador_id    BIGINT        NOT NULL,
    titulo            VARCHAR(150)  NOT NULL,
    tipo              VARCHAR(20)   NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'RASCUNHO',
    slug              VARCHAR(180)  NOT NULL,
    data_inicio       DATE          NOT NULL,
    data_fim          DATE,
    hora_inicio       TIME          NOT NULL,
    hora_fim          TIME,
    local_evento      VARCHAR(200)  NOT NULL,
    capacidade        INT           NOT NULL,
    descricao         TEXT,
    gasto_previsto    DECIMAL(12, 2) NOT NULL DEFAULT 0,
    receita_prevista  DECIMAL(12, 2) NOT NULL DEFAULT 0,
    criado_em         DATETIME(6)   NOT NULL,
    atualizado_em     DATETIME(6)   NOT NULL,
    CONSTRAINT uk_eventos_slug UNIQUE (slug),
    CONSTRAINT fk_eventos_organizador FOREIGN KEY (organizador_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    INDEX idx_eventos_organizador_data (organizador_id, data_inicio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE inscricoes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    evento_id  BIGINT       NOT NULL,
    nome       VARCHAR(120) NOT NULL,
    email      VARCHAR(160) NOT NULL,
    telefone   VARCHAR(20),
    criado_em  DATETIME(6)  NOT NULL,
    CONSTRAINT uk_inscricoes_evento_email UNIQUE (evento_id, email),
    CONSTRAINT fk_inscricoes_evento FOREIGN KEY (evento_id) REFERENCES eventos (id) ON DELETE CASCADE,
    INDEX idx_inscricoes_evento_data (evento_id, criado_em)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE lancamentos (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    organizador_id  BIGINT         NOT NULL,
    evento_id       BIGINT,
    descricao       VARCHAR(150)   NOT NULL,
    tipo            VARCHAR(20)    NOT NULL,
    status          VARCHAR(20)    NOT NULL,
    valor           DECIMAL(12, 2) NOT NULL,
    data            DATE           NOT NULL,
    criado_em       DATETIME(6)    NOT NULL,
    atualizado_em   DATETIME(6)    NOT NULL,
    CONSTRAINT fk_lancamentos_organizador FOREIGN KEY (organizador_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT fk_lancamentos_evento FOREIGN KEY (evento_id) REFERENCES eventos (id) ON DELETE SET NULL,
    INDEX idx_lancamentos_organizador_data (organizador_id, data)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
