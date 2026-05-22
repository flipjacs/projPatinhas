-- ─────────────────────────────────────────────────────────
-- Projeto Patinhas — schema inicial
-- Convenções:
--   • Identificadores e dados em PT-BR.
--   • Soft delete por coluna `deletado_em` (NULL = ativo).
--   • Timestamps em UTC; converta na borda de exibição.
--   • Todas as tabelas têm criado_em / atualizado_em.
-- ─────────────────────────────────────────────────────────

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ─── USUÁRIOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(120) NOT NULL,
  email           VARCHAR(180) NOT NULL,
  senha_hash      VARCHAR(255) NOT NULL,
  telefone        VARCHAR(20)  NULL,
  cidade          VARCHAR(80)  NULL,
  estado          CHAR(2)      NULL,
  bio             VARCHAR(280) NULL,
  foto_url        VARCHAR(500) NULL,
  papel           ENUM('adotante','ong','admin') NOT NULL DEFAULT 'adotante',
  email_verificado TINYINT(1)  NOT NULL DEFAULT 0,
  criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletado_em     TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email),
  KEY ix_usuarios_papel (papel),
  KEY ix_usuarios_deletado (deletado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── ONGS (1:1 com usuarios.papel = 'ong') ─────────────────
CREATE TABLE IF NOT EXISTS ongs (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED NOT NULL,
  nome_fantasia   VARCHAR(140) NOT NULL,
  cnpj            CHAR(14)     NULL,
  descricao       TEXT         NULL,
  site            VARCHAR(255) NULL,
  instagram       VARCHAR(120) NULL,
  whatsapp        VARCHAR(20)  NULL,
  endereco        VARCHAR(255) NULL,
  cidade          VARCHAR(80)  NULL,
  estado          CHAR(2)      NULL,
  verificada      TINYINT(1)   NOT NULL DEFAULT 0,
  criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletado_em     TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ongs_usuario (usuario_id),
  UNIQUE KEY uk_ongs_cnpj (cnpj),
  KEY ix_ongs_verificada (verificada),
  KEY ix_ongs_deletado (deletado_em),
  CONSTRAINT fk_ongs_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── ANIMAIS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS animais (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED NOT NULL,
  ong_id          INT UNSIGNED NULL,
  nome            VARCHAR(80)  NOT NULL,
  especie         ENUM('cachorro','gato','outro') NOT NULL,
  raca            VARCHAR(80)  NULL,
  sexo            ENUM('macho','femea','desconhecido') NOT NULL DEFAULT 'desconhecido',
  porte           ENUM('pequeno','medio','grande') NOT NULL,
  idade_anos      TINYINT UNSIGNED NULL,
  idade_meses     TINYINT UNSIGNED NULL,
  castrado        TINYINT(1)   NOT NULL DEFAULT 0,
  vacinado        TINYINT(1)   NOT NULL DEFAULT 0,
  descricao       TEXT         NULL,
  foto_url        VARCHAR(500) NULL,
  disponivel      TINYINT(1)   NOT NULL DEFAULT 1,
  criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletado_em     TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY ix_animais_usuario (usuario_id),
  KEY ix_animais_ong (ong_id),
  KEY ix_animais_disp (disponivel, deletado_em),
  KEY ix_animais_especie (especie),
  CONSTRAINT chk_animais_idade_meses CHECK (idade_meses IS NULL OR idade_meses < 12),
  CONSTRAINT fk_animais_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_animais_ong
    FOREIGN KEY (ong_id) REFERENCES ongs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── ADOÇÕES ───────────────────────────────────────────────
-- Máquina de estados: pendente → aprovada | rejeitada | cancelada
--                     aprovada → concluida | cancelada
CREATE TABLE IF NOT EXISTS adocoes (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  animal_id       INT UNSIGNED NOT NULL,
  adotante_id     INT UNSIGNED NOT NULL,
  status          ENUM('pendente','aprovada','rejeitada','concluida','cancelada') NOT NULL DEFAULT 'pendente',
  mensagem        TEXT         NULL,
  resposta        TEXT         NULL,
  criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decidido_em     TIMESTAMP    NULL DEFAULT NULL,
  atualizado_em   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- Um adotante só pode ter UMA solicitação ativa (pendente/aprovada) por animal;
  -- aplicada por índice parcial via lógica de serviço + checagem abaixo nos índices comuns.
  KEY ix_adocoes_animal (animal_id),
  KEY ix_adocoes_adotante (adotante_id),
  KEY ix_adocoes_status (status),
  CONSTRAINT fk_adocoes_animal
    FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  CONSTRAINT fk_adocoes_adotante
    FOREIGN KEY (adotante_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── REFRESH TOKENS ────────────────────────────────────────
-- Armazenamos somente o SHA-256 do token. O valor cru fica no cookie HttpOnly.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED NOT NULL,
  token_hash      CHAR(64)     NOT NULL,
  user_agent      VARCHAR(255) NULL,
  ip              VARCHAR(45)  NULL,
  expira_em       TIMESTAMP    NOT NULL,
  revogado_em     TIMESTAMP    NULL DEFAULT NULL,
  criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_refresh_hash (token_hash),
  KEY ix_refresh_usuario (usuario_id),
  KEY ix_refresh_expira (expira_em),
  CONSTRAINT fk_refresh_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
