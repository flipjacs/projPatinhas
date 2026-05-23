import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

import "./PageHeader.css";

/**
 * Cabeçalho unificado das páginas internas.
 *
 * Composição:
 *   • Trilha (breadcrumbs) em desktop / Back link compacto em mobile.
 *   • Título h1.
 *   • Descrição curta.
 *   • Ações opcionais (botões à direita; empilham no mobile).
 *
 * Por que dois componentes (Breadcrumbs + BackLink) no mesmo arquivo:
 *   Coesão. As páginas internas usam SEMPRE um header com o mesmo padrão
 *   — manter tudo aqui evita inconsistências (ex: bloquear uma página que
 *   esqueceu de importar o BackLink, ou estilos divergentes).
 *
 * Props:
 *   • trilha          — array de { label, para? }. A última é a página atual
 *                       e SEMPRE renderiza sem link. Quando há ao menos um
 *                       item anterior, o mobile mostra "← {pai}" como atalho.
 *   • titulo          — h1 da página. Recebe o id que a `<section>` da página
 *                       referencia via aria-labelledby.
 *   • tituloId        — id opcional para o h1.
 *   • descricao       — parágrafo curto abaixo do título.
 *   • acoes           — node renderizado no lado direito (mobile: abaixo).
 *   • children        — node extra abaixo do descricao (raro; ex: chips).
 */
export default function PageHeader({
  trilha,
  titulo,
  tituloId,
  descricao,
  acoes,
  children,
}) {
  const trilhaValida = Array.isArray(trilha) && trilha.length > 0;

  return (
    <header className="ph">
      {trilhaValida && <Trilha trilha={trilha} />}

      <div className="ph-row">
        <div className="ph-text">
          <h1 id={tituloId} className="ph-title">{titulo}</h1>
          {descricao && <p className="ph-desc">{descricao}</p>}
          {children}
        </div>
        {acoes && <div className="ph-acoes">{acoes}</div>}
      </div>
    </header>
  );
}

/**
 * Breadcrumbs propriamente ditos. Em viewports estreitos exibe apenas
 * o "Back" pro penúltimo item, mantendo o padding leve. Em viewports
 * largos exibe todos os ancestrais separados por chevron, com a página
 * atual marcada via aria-current.
 */
function Trilha({ trilha }) {
  // Página atual = último item. Pai imediato = penúltimo, se houver.
  const pai = trilha.length > 1 ? trilha[trilha.length - 2] : null;

  return (
    <nav aria-label="Trilha de navegação" className="ph-trilha">
      {/* Mobile: só o pai como atalho de voltar. */}
      {pai && pai.para && (
        <Link to={pai.para} className="ph-back ph-back--mobile">
          <FaChevronLeft aria-hidden="true" className="ph-back-icon" />
          <span>{pai.label}</span>
        </Link>
      )}

      {/* Desktop: lista completa de ancestrais. */}
      <ol className="ph-crumbs">
        {trilha.map((item, i) => {
          const ehUltimo = i === trilha.length - 1;
          return (
            <li key={`${i}-${item.label}`} className="ph-crumb">
              {ehUltimo || !item.para ? (
                <span
                  className="ph-crumb-atual"
                  aria-current={ehUltimo ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <Link to={item.para} className="ph-crumb-link">{item.label}</Link>
                  <FaChevronRight
                    aria-hidden="true"
                    className="ph-crumb-sep"
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * BackLink autônomo — para páginas que querem só o atalho de voltar sem
 * a trilha completa (ex: páginas públicas como AnimalDetalhe, onde a
 * hierarquia não está clara para o visitante).
 */
export function BackLink({ para, children, className = "" }) {
  return (
    <Link to={para} className={`ph-back ${className}`}>
      <FaChevronLeft aria-hidden="true" className="ph-back-icon" />
      <span>{children}</span>
    </Link>
  );
}
