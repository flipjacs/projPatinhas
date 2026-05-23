import { forwardRef } from "react";

/**
 * Textarea reutilizável com contador opcional. Quando `valor` e `max` são
 * fornecidos, mostra "n/max" e destaca quando próximo do limite.
 * Compatível com react-hook-form via forwardRef.
 */
const CampoTextarea = forwardRef(function CampoTextarea(
  {
    label,
    id,
    obrigatorio = false,
    opcional = false,
    error,
    hint,
    valor,
    max,
    rows = 4,
    ...props
  },
  ref
) {
  const mostrarContador = typeof max === "number" && typeof valor === "string";
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const describedBy = errorId || hintId;
  const cheio = mostrarContador && valor.length >= max;

  return (
    <div className="field">
      <div className="field-label-row">
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
        {mostrarContador && (
          <span
            className={cheio ? "char-counter char-counter--full" : "char-counter"}
            aria-hidden="true"
          >
            {valor.length}/{max}
          </span>
        )}
      </div>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        maxLength={max}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <p id={errorId} className="field-error" role="alert">{error.message}</p>
      ) : hint ? (
        <p id={hintId} className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
});

export default CampoTextarea;
