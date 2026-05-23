-- ─────────────────────────────────────────────────────────
-- Projeto Patinhas — Validações de integridade
--
-- Foco: travar dados essenciais que hoje aceitam NULL.
--
-- Princípios:
--   • Só viramos NOT NULL onde existe um default seguro (sem inventar
--     dados de usuários). Para campos sem default razoável, a obrigatoriedade
--     é garantida pelas camadas de Zod + UI.
--   • Backfill ANTES do MODIFY — caso contrário um único NULL pré-existente
--     trava a migração inteira.
--   • Sem `IF NOT EXISTS` (sintaxe inexistente no MySQL puro). A idempotência
--     vem do ledger de schema_migrations.
--
-- Resumo das mudanças:
--   • animais.raca       → NOT NULL DEFAULT 'SRD' (backfill 'SRD' nos NULLs)
--   • animais.descricao  → NOT NULL (já era requerido em prática)
--   • CHECK animais.idade_anos < 41  (defesa numérica extra)
--
-- Por que NÃO mexemos em outras colunas:
--   • animais.foto_url, usuarios.{telefone,cidade,estado,foto_url}:
--     existem usuários/animais com NULL e qualquer "default" seria invenção
--     de dado. Mantemos nullable no banco e exigimos via Zod (POST) +
--     formulários do front. Novos cadastros não conseguem mais ser
--     incompletos. Cadastros antigos preservados.
-- ─────────────────────────────────────────────────────────

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ─── animais.raca ─────────────────────────────────────────
-- Backfill: animais existentes sem raça viram 'SRD' (Sem Raça Definida) —
-- exatamente o que a UI já mostra quando raca é NULL, então a leitura não
-- muda para quem está vendo a lista.
UPDATE animais SET raca = 'SRD' WHERE raca IS NULL OR raca = '';

ALTER TABLE animais
  MODIFY raca VARCHAR(80) NOT NULL DEFAULT 'SRD';

-- ─── animais.descricao ─────────────────────────────────────
-- Sempre foi obrigatória na UI/API (min 10 caracteres). O banco aceitava
-- NULL por inércia. Backfill defensivo + NOT NULL.
UPDATE animais
   SET descricao = 'Animal aguardando descrição completa.'
 WHERE descricao IS NULL OR LENGTH(TRIM(descricao)) = 0;

ALTER TABLE animais
  MODIFY descricao TEXT NOT NULL;

-- ─── CHECK: limites numéricos de idade ─────────────────────
-- Já existia um CHECK para idade_meses < 12 na 0001. Adicionamos o teto
-- de idade_anos para evitar dados absurdos (até cães longevos não passam
-- de ~25 anos; usamos 40 como folga generosa).
ALTER TABLE animais
  ADD CONSTRAINT chk_animais_idade_anos
    CHECK (idade_anos IS NULL OR idade_anos <= 40);
