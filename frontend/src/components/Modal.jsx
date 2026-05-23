import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

/**
 * Modal acessível e reutilizável.
 *
 *   <Modal
 *     aberto={selecionado != null}
 *     aoFechar={() => setSelecionado(null)}
 *     tituloId="titulo-do-modal"
 *     tamanho="lg"
 *   >
 *     <h1 id="titulo-do-modal">Título</h1>
 *     ...
 *   </Modal>
 *
 * Recursos:
 *   • Portal para document.body — escapa de qualquer container com transform/overflow
 *     que quebraria o posicionamento fixed.
 *   • Trava de scroll no body enquanto aberto.
 *   • ESC fecha; clique no overlay fecha.
 *   • Focus trap por Tab/Shift+Tab.
 *   • Devolve o foco para o elemento que abriu (restauração).
 *   • Animação suprimida via prefers-reduced-motion (no CSS).
 *
 * Não-objetivo:
 *   • Não controla o título — o consumidor passa um <h1 id={tituloId}> filho.
 *     Mantemos `aria-labelledby` apontando para esse id.
 */

const FOCUSAVEIS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function Modal({
  aberto,
  aoFechar,
  tituloId,
  tamanho = "lg",
  rotuloFechar = "Fechar",
  children,
}) {
  const idAuto = useId();
  const idTitulo = tituloId || idAuto;
  const dialogoRef = useRef(null);
  const fecharRef = useRef(null);

  // Foco inicial + restauração ao fechar.
  useEffect(() => {
    if (!aberto) return undefined;
    const focoAnterior = document.activeElement;
    // microtask para garantir que o conteúdo já está montado
    queueMicrotask(() => fecharRef.current?.focus());
    return () => {
      if (focoAnterior instanceof HTMLElement) focoAnterior.focus();
    };
  }, [aberto]);

  // Trava de scroll no body.
  useEffect(() => {
    if (!aberto) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  // ESC fecha + focus trap por Tab.
  useEffect(() => {
    if (!aberto) return undefined;
    function onKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        aoFechar();
        return;
      }
      if (e.key !== "Tab" || !dialogoRef.current) return;
      const focaveis = dialogoRef.current.querySelectorAll(FOCUSAVEIS);
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  function aoClicarOverlay(e) {
    if (e.target === e.currentTarget) aoFechar();
  }

  return createPortal(
    <div className="modal-overlay" onClick={aoClicarOverlay}>
      <div
        ref={dialogoRef}
        className={`modal-content modal-content--${tamanho}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
      >
        <button
          ref={fecharRef}
          type="button"
          className="modal-fechar"
          aria-label={rotuloFechar}
          onClick={aoFechar}
        >
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
