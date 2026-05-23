import "./Skeleton.css";

/**
 * Grid de cards "fantasma" que replicam o layout final dos cards reais.
 * Reduz CLS (mantém o tamanho) e dá melhor sensação de velocidade que um
 * spinner centralizado. Anim. respeita prefers-reduced-motion via CSS.
 */
export default function SkeletonCards({ quantidade = 6 }) {
  return (
    <ul className="cards" aria-hidden="true" aria-busy="true">
      {Array.from({ length: quantidade }).map((_, i) => (
        <li key={i} className="card skeleton-card">
          <div className="skeleton-media" />
          <div className="card-content">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--meta" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-btn" />
          </div>
        </li>
      ))}
    </ul>
  );
}
