import { forwardRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

/**
 * Campo de senha com botão de mostrar/ocultar. O estado de visibilidade vive
 * dentro do componente — o consumidor não precisa gerenciar.
 */
const CampoSenha = forwardRef(function CampoSenha(
  { label, id, obrigatorio = false, error, hint, ...props },
  ref
) {
  const [mostrar, setMostrar] = useState(false);
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const describedBy = errorId || hintId;

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {obrigatorio && (
          <>
            <span className="required-mark" aria-hidden="true">*</span>
            <span className="sr-only"> obrigatório</span>
          </>
        )}
      </label>
      <div className="password-wrap">
        <input
          ref={ref}
          id={id}
          type={mostrar ? "text" : "password"}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={mostrar}
          onClick={() => setMostrar((v) => !v)}
          tabIndex={-1}
        >
          {mostrar ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="field-error" role="alert">{error.message}</p>
      ) : hint ? (
        <p id={hintId} className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
});

export default CampoSenha;
