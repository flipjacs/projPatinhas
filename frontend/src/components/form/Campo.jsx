import { forwardRef } from "react";

/**
 * Campo de texto reutilizável. Encapsula label + input + erro + acessibilidade.
 * Compatível com react-hook-form via forwardRef.
 */
const Campo = forwardRef(function Campo(
  {
    label,
    id,
    type = "text",
    obrigatorio = false,
    opcional = false,
    error,
    hint,
    children,
    className = "field",
    ...props
  },
  ref
) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const describedBy = errorId || hintId;

  return (
    <div className={className}>
      <label htmlFor={id}>
        {label}
        {obrigatorio && (
          <>
            <span className="required-mark" aria-hidden="true">*</span>
            <span className="sr-only"> obrigatório</span>
          </>
        )}
        {opcional && <span className="muted"> (opcional)</span>}
      </label>
      <input
        ref={ref}
        id={id}
        type={type}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <p id={errorId} className="field-error" role="alert">{error.message}</p>
      ) : hint ? (
        <p id={hintId} className="field-hint">{hint}</p>
      ) : null}
      {children}
    </div>
  );
});

export default Campo;
