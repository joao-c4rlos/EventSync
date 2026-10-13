CREATE TABLE usuarios (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL,
    senha_hash      VARCHAR(100) NOT NULL,
    telefone        VARCHAR(20),
    celular         VARCHAR(20),
    data_nascimento DATE,
    sexo            VARCHAR(20),
    cidade          VARCHAR(100),
    foto_url        VARCHAR(500),
    idioma          VARCHAR(10)  NOT NULL DEFAULT 'pt-BR',
    fuso_horario    VARCHAR(50)  NOT NULL DEFAULT 'America/Sao_Paulo',
    tema            VARCHAR(10)  NOT NULL DEFAULT 'CLARO',
    plano           VARCHAR(20)  NOT NULL DEFAULT 'GRATUITO',
    criado_em       DATETIME(6)  NOT NULL,
    atualizado_em   DATETIME(6)  NOT NULL,
    CONSTRAINT uk_usuarios_email UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE tokens_redefinicao_senha (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL,
    token_hash  VARCHAR(64)  NOT NULL,
    expira_em   DATETIME(6)  NOT NULL,
    usado_em    DATETIME(6),
    criado_em   DATETIME(6)  NOT NULL,
    CONSTRAINT uk_tokens_redefinicao_hash UNIQUE (token_hash),
    CONSTRAINT fk_tokens_redefinicao_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
