import "./Banner.css";

/**
 * Banner inline reutilizável para feedback de erro/sucesso/aviso/informação.
 * Não é toast nem modal — vive dentro do fluxo da página (sem layout-shift).
 */
export default function Banner({ tipo = "info", titulo, mensagem, children }) {
  return (
    <div className={`banner banner--${tipo}`} role={tipo === "erro" ? "alert" : "status"}>
      {(titulo || mensagem) && (
        <div className="banner-conteudo">
          {titulo && <strong>{titulo}</strong>}
          {mensagem && <p>{mensagem}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
