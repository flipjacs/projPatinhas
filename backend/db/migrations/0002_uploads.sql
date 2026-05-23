-- ─────────────────────────────────────────────────────────
-- Projeto Patinhas — Sistema de Uploads
--
-- Cria a tabela canônica de uploads + relações:
--   • uploads             — registro único por arquivo carregado.
--   • animal_imagens      — junção many-to-many (animal pode ter N fotos).
--   • usuarios.avatar_upload_id  — FK opcional para foto de perfil.
--   • ongs.logo_upload_id        — FK opcional para logo da ONG.
--
-- Convenções herdadas:
--   • INT UNSIGNED em todas as PKs/FKs.
--   • Soft delete via `deletado_em`.
--   • Timestamps em UTC.
--
-- Os arquivos físicos vivem fora do banco; o caminho relativo é guardado
-- aqui. O hash da imagem original (sha256) permite deduplicação e nomes
-- imutáveis (compatível com `Cache-Control: immutable`).
-- ─────────────────────────────────────────────────────────

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ─── UPLOADS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS uploads (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id      INT UNSIGNED NOT NULL,
  tipo            ENUM('avatar','animal','ong') NOT NULL,
  hash            CHAR(64)      NOT NULL,
  nome_original   VARCHAR(255)  NOT NULL,
  mime            VARCHAR(50)   NOT NULL,
  tamanho_bytes   INT UNSIGNED  NOT NULL,
  largura         INT UNSIGNED  NULL,
  altura          INT UNSIGNED  NULL,
  -- Caminhos RELATIVOS ao UPLOADS_DIR (independentes do driver):
  caminho_original  VARCHAR(255) NOT NULL,
  caminho_otimizado VARCHAR(255) NULL,
  caminho_card      VARCHAR(255) NULL,
  caminho_thumb     VARCHAR(255) NULL,
  criado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletado_em     TIMESTAMP     NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY ix_uploads_usuario (usuario_id),
  KEY ix_uploads_hash (hash),
  KEY ix_uploads_tipo (tipo),
  KEY ix_uploads_deletado (deletado_em),
  CONSTRAINT fk_uploads_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── ANIMAL ↔ IMAGENS (1:N via tabela de junção) ───────────
-- Um animal pode ter várias fotos; a mesma imagem (caso seja deduplicada)
-- pode em tese ser usada em mais de um animal — mas o uso normal é 1:1
-- entre animal e uploads. UNIQUE garante que não duplica vínculos.
CREATE TABLE IF NOT EXISTS animal_imagens (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  animal_id       INT UNSIGNED NOT NULL,
  upload_id       INT UNSIGNED NOT NULL,
  ordem           INT UNSIGNED NOT NULL DEFAULT 0,
  capa            TINYINT(1)   NOT NULL DEFAULT 0,
  criado_em       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_animal_upload (animal_id, upload_id),
  KEY ix_animal_imagens_animal (animal_id),
  KEY ix_animal_imagens_capa (animal_id, capa),
  CONSTRAINT fk_animal_imagens_animal
    FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  CONSTRAINT fk_animal_imagens_upload
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── USUARIOS.avatar_upload_id (1:1 opcional) ──────────────
-- NOTA: MySQL não suporta `ADD COLUMN IF NOT EXISTS` (sintaxe é exclusiva
-- do MariaDB). A idempotência é garantida pelo ledger de migrations:
-- esta migração só roda uma vez por database.
ALTER TABLE usuarios
  ADD COLUMN avatar_upload_id INT UNSIGNED NULL AFTER foto_url,
  ADD CONSTRAINT fk_usuarios_avatar
    FOREIGN KEY (avatar_upload_id) REFERENCES uploads(id) ON DELETE SET NULL;

-- ─── ONGS.logo_upload_id (1:1 opcional) ────────────────────
ALTER TABLE ongs
  ADD COLUMN logo_upload_id INT UNSIGNED NULL AFTER endereco,
  ADD CONSTRAINT fk_ongs_logo
    FOREIGN KEY (logo_upload_id) REFERENCES uploads(id) ON DELETE SET NULL;
