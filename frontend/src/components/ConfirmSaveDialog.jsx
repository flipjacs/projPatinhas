import { useEffect, useId, useRef, useState } from "react";
import Modal from "./Modal";
import "./ConfirmSaveDialog.css";

/**
 * Modal de confirmação para SALVAR alterações.
 *
 * Diferente do ConfirmDialog (genérico), este renderiza uma *lista do que
 * vai mudar*: o usuário vê literalmente o "de → para" de cada campo antes
 * de confirmar. Isso transforma o "Salvar" em uma ação intencional sem
 * adicionar fricção quando não há mudanças (o pai só abre o modal se houver).
 *
 * Props:
 *   • aberto         — boolean
 *   • aoFechar       — () => void  (cancelar)
 *   • aoConfirmar    — () => Promise<void>  (a API call vai aqui)
 *   • mudancas       — [{ chave, label, antes, depois, tipo? }]
 *                      tipo: "texto" | "foto" | "removido" (default: "texto")
 *   • rotuloConfirmar — default "Salvar alterações"
 *   • erro           — string|null  (mostra alert dentro do modal se vier)
 */
export default function ConfirmSaveDialog({
  aberto,
  aoFechar,
  aoConfirmar,
  mudancas = [],
  rotuloConfirmar = "Salvar alterações",
  erro = null,
}) {
  const tituloId = useId();
  const descId = useId();
  const [executando, setExecutando] = useState(false);
  const refPrimario = useRef(null);

  // Sobrescreve o foco inicial do Modal: queremos o foco no botão de
  // CONFIRMAR (ação primária), não no "x" de fechar — esse padrão acelera
  // o "Enter para confirmar" sem ser perigoso, porque é só uma atualização
  // de perfil (não destrutiva).
  useEffect(() => {
    if (!aberto) return;
    queueMicrotask(() => refPrimario.current?.focus());
  }, [aberto]);

  async function clicarConfirmar() {
    if (executando) return;
    setExecutando(true);
    try {
      await aoConfirmar();
    } finally {
      setExecutando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      aoFechar={executando ? () => {} : aoFechar}
      tituloId={tituloId}
      tamanho="sm"
      rotuloFechar="Cancelar"
    >
      <div className="csd">
        <header className="csd-head">
          <h2 id={tituloId} className="csd-title">Salvar alterações?</h2>
          <p id={descId} className="csd-sub">
            {mudancas.length === 1
              ? "Você vai atualizar 1 campo:"
              : `Você vai atualizar ${mudancas.length} campos:`}
          </p>
        </header>

        <ul className="csd-lista" aria-describedby={descId}>
          {mudancas.map((m) => (
            <li key={m.chave} className="csd-item">
              <p className="csd-item-label">{m.label}</p>
              {m.tipo === "foto" ? (
                <DiffFoto antes={m.antes} depois={m.depois} />
              ) : m.tipo === "removido" ? (
                <DiffRemovido antes={m.antes} />
              ) : (
                <DiffTexto antes={m.antes} depois={m.depois} />
              )}
            </li>
          ))}
        </ul>

        {erro && (
          <p className="csd-erro" role="alert">{erro}</p>
        )}

        <div className="csd-acoes">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={aoFechar}
            disabled={executando}
          >
            Voltar e revisar
          </button>
          <button
            ref={refPrimario}
            type="button"
            className="btn btn--primary"
            onClick={clicarConfirmar}
            disabled={executando}
            aria-busy={executando}
          >
            {executando ? "Salvando…" : rotuloConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DiffTexto({ antes, depois }) {
  return (
    <div className="csd-diff">
      <span className="csd-diff-antes">{antes || <em>(vazio)</em>}</span>
      <span className="csd-diff-seta" aria-hidden="true">→</span>
      <span className="csd-diff-depois">{depois || <em>(vazio)</em>}</span>
    </div>
  );
}

function DiffRemovido({ antes }) {
  return (
    <div className="csd-diff">
      <span className="csd-diff-antes">{antes || <em>(vazio)</em>}</span>
      <span className="csd-diff-seta" aria-hidden="true">→</span>
      <span className="csd-diff-removido">Removido</span>
    </div>
  );
}

function DiffFoto({ antes, depois }) {
  return (
    <div className="csd-diff csd-diff--foto">
      <div className="csd-foto">
        {antes ? (
          <img src={antes} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="csd-foto-vazia" aria-hidden="true">—</span>
        )}
        <span className="csd-foto-rotulo">Antes</span>
      </div>
      <span className="csd-diff-seta" aria-hidden="true">→</span>
      <div className="csd-foto">
        {depois ? (
          <img src={depois} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="csd-foto-vazia" aria-hidden="true">—</span>
        )}
        <span className="csd-foto-rotulo">Depois</span>
      </div>
    </div>
  );
}
