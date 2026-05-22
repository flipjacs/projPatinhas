import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/adotaranimalstyle.css";

const ANIMAIS = [
  {
    id: "luna",
    nome: "Luna",
    img: "https://placecats.com/500/400",
    especie: "Gato",
    raca: "SRD",
    idade: "2 anos",
    peso: "2 kg",
    porte: "Pequeno",
    descricao: "Luna é carinhosa e ama colo.",
  },
  {
    id: "mel",
    nome: "Mel",
    img: "https://placedog.net/500/400?id=5",
    especie: "Cachorro",
    raca: "Husky Siberiano",
    idade: "3 meses",
    peso: "1,5 kg",
    porte: "Pequeno",
    descricao: "Mel é brincalhona e cheia de energia.",
  },
  {
    id: "nina",
    nome: "Nina",
    img: "https://placecats.com/500/401",
    especie: "Gato",
    raca: "SRD",
    idade: "1 ano",
    peso: "2 kg",
    porte: "Pequeno",
    descricao: "Nina é calma e muito carinhosa.",
  },
];

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "Cachorro", label: "Cachorros" },
  { id: "Gato", label: "Gatos" },
];

function AdotarAnimal() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("todos");

  const filtered = useMemo(
    () => (filter === "todos" ? ANIMAIS : ANIMAIS.filter((a) => a.especie === filter)),
    [filter]
  );

  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <>
      <div className="container">
        <header className="top-area">
          <div className="top-area-text">
            <p className="page-eyebrow">Disponíveis para adoção</p>
            <h1>Encontre seu novo melhor amigo</h1>
            <p className="top-area-meta" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "animal" : "animais"} aguardando
              um lar.
            </p>
          </div>
          <Link to="/cadastro" className="btn btn--secondary">
            Cadastrar animal
          </Link>
        </header>

        <div className="filters" role="tablist" aria-label="Filtrar por espécie">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={filter === option.id}
              className={
                filter === option.id ? "filter-chip filter-chip--active" : "filter-chip"
              }
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state" role="status">
            <p className="empty-state-emoji" aria-hidden="true">
              🐾
            </p>
            <h2>Nenhum animal nesta categoria.</h2>
            <p>Tente outra espécie ou volte mais tarde — recebemos novos amigos toda semana.</p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setFilter("todos")}
            >
              Ver todos
            </button>
          </div>
        ) : (
          <ul className="cards">
            {filtered.map((animal) => (
              <li key={animal.id} className="card">
                <div className="card-media">
                  <img
                    src={animal.img}
                    alt={`Foto de ${animal.nome}, ${animal.especie.toLowerCase()}`}
                    width={500}
                    height={400}
                    loading="lazy"
                    decoding="async"
                  />
                  <span
                    className={`card-species card-species--${animal.especie.toLowerCase()}`}
                  >
                    {animal.especie}
                  </span>
                </div>
                <div className="card-content">
                  <h2>{animal.nome}</h2>
                  <p className="card-meta">
                    {animal.raca} · {animal.idade} · {animal.porte}
                  </p>
                  <p className="card-desc">{animal.descricao}</p>
                  <button
                    type="button"
                    className="btn btn--primary btn--block btn-detalhes"
                    onClick={() => setSelected(animal)}
                  >
                    Conhecer {animal.nome}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && <AnimalModal animal={selected} onClose={closeModal} />}
    </>
  );
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function AnimalModal({ animal, onClose }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  // Lock body scroll
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Restore focus to previously focused element on close
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  // Escape close + Tab focus trap
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll(FOCUSABLE);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function onOverlayClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={onOverlayClick}>
      <div
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          type="button"
          className="fechar"
          aria-label="Fechar"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="modal-left">
          <img
            src={animal.img}
            alt={`${animal.nome}, ${animal.especie.toLowerCase()}`}
            width={500}
            height={500}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="modal-right">
          <p className="modal-species">{animal.especie}</p>
          <h1 id={titleId}>{animal.nome}</h1>
          <p className="modal-tagline">{animal.descricao}</p>

          <dl className="info-grid">
            <div className="info">
              <dt>Peso</dt>
              <dd>{animal.peso}</dd>
            </div>
            <div className="info">
              <dt>Idade</dt>
              <dd>{animal.idade}</dd>
            </div>
            <div className="info">
              <dt>Espécie</dt>
              <dd>{animal.especie}</dd>
            </div>
            <div className="info">
              <dt>Porte</dt>
              <dd>{animal.porte}</dd>
            </div>
            <div className="info">
              <dt>Raça</dt>
              <dd>{animal.raca}</dd>
            </div>
          </dl>

          <div className="modal-actions">
            <button type="button" className="btn btn--primary btn--block">
              Quero adotar {animal.nome}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={onClose}
            >
              Continuar navegando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdotarAnimal;
