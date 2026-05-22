import "./Loading.css";

function Loading({ label = "Carregando…" }) {
  return (
    <div role="status" aria-live="polite" className="loading">
      <span className="loading-spinner" aria-hidden="true" />
      <span className="loading-sr">{label}</span>
    </div>
  );
}

export default Loading;
