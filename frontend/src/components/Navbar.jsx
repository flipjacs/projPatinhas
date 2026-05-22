import { useEffect, useId, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

const LINKS = [
  { to: "/", label: "Início", end: true },
  { to: "/adotar", label: "Adotar Animal" },
  { to: "/cadastro", label: "Cadastro" },
  { to: "/ongs", label: "ONGs" },
  { to: "/registro", label: "Criar conta" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (!open) return undefined;
    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (!isMobile) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Scroll-aware shadow
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={scrolled ? "navbar navbar--scrolled" : "navbar"}
        aria-label="Navegação principal"
      >
        <NavLink to="/" className="logo-area" aria-label="Projeto Patinhas — Início">
          <span className="logo" aria-hidden="true">
            🐾
          </span>
          <span className="logo-text">Projeto Patinhas</span>
        </NavLink>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="navbar-toggle-bar" data-open={open || undefined} />
          <span className="navbar-toggle-bar" data-open={open || undefined} />
          <span className="navbar-toggle-bar" data-open={open || undefined} />
        </button>

        <ul id={menuId} className="menu" data-open={open || undefined}>
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu backdrop — click outside to close */}
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

export default Navbar;
