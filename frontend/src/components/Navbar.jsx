import { useEffect, useId, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import "./Navbar.css";

const LINKS_PUBLICOS = [
  { to: "/", label: "Início", end: true },
  { to: "/adotar", label: "Adotar Animal" },
  { to: "/ongs", label: "ONGs" },
];

function primeiroNome(nome) {
  if (!nome) return "";
  return nome.trim().split(/\s+/)[0];
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const localizacao = useLocation();
  const navigate = useNavigate();
  const { usuario, autenticado, logout } = useAuth();

  // Fecha o menu mobile quando o usuário troca de rota — sincronização legítima
  // com sistema externo (router), apesar do aviso de set-state-in-effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [localizacao.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    if (!window.matchMedia("(max-width: 860px)").matches) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = anterior; };
  }, [open]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function aoSair() {
    setOpen(false);
    await logout();
    navigate("/", { replace: true });
  }

  const linksUsuario = autenticado
    ? [
        { to: "/minha-area", label: "Minha área" },
        ...(usuario?.papel === "ong" || usuario?.papel === "admin"
          ? [{ to: "/cadastro", label: "Cadastrar animal" }]
          : []),
      ]
    : [];

  return (
    <>
      <nav
        className={scrolled ? "navbar navbar--scrolled" : "navbar"}
        aria-label="Navegação principal"
      >
        <NavLink to="/" className="logo-area" aria-label="Projeto Patinhas — Início">
          <span className="logo" aria-hidden="true">🐾</span>
          <span className="logo-text">Projeto Patinhas</span>
        </NavLink>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((c) => !c)}
        >
          <span className="navbar-toggle-bar" data-open={open || undefined} />
          <span className="navbar-toggle-bar" data-open={open || undefined} />
          <span className="navbar-toggle-bar" data-open={open || undefined} />
        </button>

        <ul id={menuId} className="menu" data-open={open || undefined}>
          {LINKS_PUBLICOS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {linksUsuario.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {autenticado ? (
            <>
              <li className="menu-separator" aria-hidden="true" />
              <li>
                <NavLink
                  to="/perfil"
                  className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
                  aria-label={`Perfil de ${usuario.nome}`}
                >
                  Olá, <strong>{primeiroNome(usuario.nome)}</strong>
                </NavLink>
              </li>
              <li>
                <button type="button" className="menu-link menu-link--ghost" onClick={aoSair}>
                  Sair
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className="menu-link">Entrar</NavLink>
              </li>
              <li>
                <NavLink
                  to="/registro"
                  className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
                >
                  Criar conta
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <button
        type="button"
        className="navbar-backdrop"
        data-open={open || undefined}
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
    </>
  );
}
