import { useEffect } from "react";

/**
 * Avisa o usuário ao fechar/atualizar a aba enquanto há alterações pendentes.
 *
 * O navegador SEMPRE usa sua própria mensagem (Chrome, Firefox e Safari
 * ignoram qualquer string que a gente retorne desde 2017). O que controlamos
 * é apenas se o prompt aparece — basta `e.preventDefault()` + `returnValue`.
 *
 * Limitações conhecidas:
 *   • Não bloqueia navegação interna (cliques em <Link>). Para isso seria
 *     preciso migrar para data router + useBlocker. O custo de migração não
 *     compensa neste momento; o aviso visível na UI + o modal de confirmação
 *     já protegem contra cliques acidentais em Salvar.
 *
 * @param {boolean} ativo — quando true, o handler fica registrado.
 */
export default function useUnsavedWarning(ativo) {
  useEffect(() => {
    if (!ativo) return undefined;
    function handler(e) {
      // O navegador exige AMBOS para mostrar o prompt em todos os engines.
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [ativo]);
}
