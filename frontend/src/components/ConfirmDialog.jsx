import { useId, useState } from "react";
import Modal from "./Modal";

/**
 * Modal de confirmação para ações destrutivas. Reaproveita Modal (focus trap,
 * ESC, overlay click). Botão de confirmar fica em primeiro plano; cancelar
 * em ghost.
 *
 * Uso:
 *   <ConfirmDialog
 *     aberto={...}
 *     titulo="Excluir conta"
 *     mensagem="Esta ação é irreversível."
 *     rotuloConfirmar="Excluir minha conta"
 *     perigo
 *     aoConfirmar={async () => { ... }}
 *     aoFechar={() => ...}
 *   />
 */
export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  rotuloConfirmar = "Confirmar",
  rotuloCancelar = "Cancelar",
  perigo = false,
  aoConfirmar,
  aoFechar,
}) {
  const tituloId = useId();
  const [executando, setExecutando] = useState(false);

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
    <Modal aberto={aberto} aoFechar={executando ? () => {} : aoFechar} tituloId={tituloId} tamanho="sm">
      <div className="confirm">
        <h2 id={tituloId} className="confirm-title">{titulo}</h2>
        {mensagem && <p className="confirm-msg">{mensagem}</p>}
        <div className="confirm-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={aoFechar}
            disabled={executando}
          >
            {rotuloCancelar}
          </button>
          <button
            type="button"
            className={perigo ? "btn btn--danger" : "btn btn--primary"}
            onClick={clicarConfirmar}
            disabled={executando}
            aria-busy={executando}
          >
            {executando ? "Processando…" : rotuloConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  );
}
