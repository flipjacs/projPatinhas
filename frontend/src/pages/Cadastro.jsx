import { useEffect, useRef, useState } from "react";
import "../css/cadastrostyle.css";

const TIPOS = [
  { id: "cachorro", label: "Cachorro", emoji: "🐶" },
  { id: "gato", label: "Gato", emoji: "🐱" },
];

const FAIXAS_ETARIAS = [
  { id: "0-2", label: "0 a 2 anos" },
  { id: "3-5", label: "3 a 5 anos" },
  { id: "6-8", label: "6 a 8 anos" },
  { id: "9+", label: "9 anos ou mais" },
];

const initial = { nome: "", tipo: "", faixaEtaria: "", descricao: "" };
const MAX_DESC = 500;

function Cadastro() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const successRef = useRef(null);

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(state) {
    const next = {};
    if (state.nome.trim().length < 2)
      next.nome = "Informe um nome com pelo menos 2 caracteres.";
    if (!state.tipo) next.tipo = "Selecione o tipo do animal.";
    if (!state.faixaEtaria) next.faixaEtaria = "Selecione a faixa etária.";
    if (state.descricao.trim().length < 10)
      next.descricao = "A descrição deve ter pelo menos 10 caracteres.";
    return next;
  }

  async function onSubmit(event) {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstErrorId = Object.keys(next)[0];
      const node = document.getElementById(firstErrorId);
      node?.focus({ preventScroll: true });
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 600));
    setStatus("success");
    setValues(initial);
  }

  // Scroll the success banner into view when it appears
  useEffect(() => {
    if (status === "success") {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  return (
    <section className="cadastro" aria-labelledby="cadastro-title">
      <header className="cadastro-header">
        <p className="page-eyebrow">Novo cadastro</p>
        <h1 id="cadastro-title">Cadastre um animal para adoção</h1>
        <p className="cadastro-sub">
          Quanto mais detalhes você fornecer, maiores as chances de encontrar uma
          família amorosa.
        </p>
      </header>

      {status === "success" && (
        <div
          ref={successRef}
          role="status"
          aria-live="polite"
          className="alert alert--success"
        >
          <span className="alert-icon" aria-hidden="true">
            ✓
          </span>
          <div>
            <strong>Cadastro enviado!</strong>
            <p>Nossa equipe entrará em contato em breve.</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="cadastro-form">
        <p className="form-hint-top">
          Os campos marcados com <span className="required-mark" aria-hidden="true">*</span> são obrigatórios.
        </p>

        <div className="upload" role="group" aria-label="Envio de foto">
          <p className="upload-icon" aria-hidden="true">📸</p>
          <h2>Envie fotos do animalzinho</h2>
          <p>Arraste e solte uma foto aqui ou clique para selecionar.</p>
        </div>

        <div className="field">
          <label htmlFor="nome">
            Nome do animal <span className="required-mark" aria-hidden="true">*</span>
            <span className="sr-only">obrigatório</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="off"
            placeholder="Ex.: Luna"
            value={values.nome}
            required
            onChange={(event) => update("nome", event.target.value)}
            aria-invalid={Boolean(errors.nome) || undefined}
            aria-describedby={errors.nome ? "nome-error" : undefined}
          />
          {errors.nome && (
            <p id="nome-error" className="field-error" role="alert">
              {errors.nome}
            </p>
          )}
        </div>

        <fieldset
          className="field"
          aria-describedby={errors.tipo ? "tipo-error" : undefined}
        >
          <legend>
            Tipo do animal <span className="required-mark" aria-hidden="true">*</span>
            <span className="sr-only">obrigatório</span>
          </legend>
          <div className="tipo-grid">
            {TIPOS.map((tipo, index) => (
              <label key={tipo.id} className="tipo-card">
                <input
                  type="radio"
                  name="tipo"
                  value={tipo.id}
                  id={index === 0 ? "tipo" : undefined}
                  checked={values.tipo === tipo.id}
                  onChange={() => update("tipo", tipo.id)}
                />
                <span className="tipo-icon" aria-hidden="true">
                  {tipo.emoji}
                </span>
                <span className="tipo-label">{tipo.label}</span>
              </label>
            ))}
          </div>
          {errors.tipo && (
            <p id="tipo-error" className="field-error" role="alert">
              {errors.tipo}
            </p>
          )}
        </fieldset>

        <fieldset
          className="field"
          aria-describedby={errors.faixaEtaria ? "faixa-error" : undefined}
        >
          <legend>
            Faixa etária <span className="required-mark" aria-hidden="true">*</span>
            <span className="sr-only">obrigatório</span>
          </legend>
          <div className="chip-group">
            {FAIXAS_ETARIAS.map((faixa, index) => (
              <label key={faixa.id} className="chip">
                <input
                  type="radio"
                  name="faixaEtaria"
                  value={faixa.id}
                  id={index === 0 ? "faixaEtaria" : undefined}
                  checked={values.faixaEtaria === faixa.id}
                  onChange={() => update("faixaEtaria", faixa.id)}
                />
                <span>{faixa.label}</span>
              </label>
            ))}
          </div>
          {errors.faixaEtaria && (
            <p id="faixa-error" className="field-error" role="alert">
              {errors.faixaEtaria}
            </p>
          )}
        </fieldset>

        <div className="field">
          <div className="field-label-row">
            <label htmlFor="descricao">
              Descrição <span className="required-mark" aria-hidden="true">*</span>
              <span className="sr-only">obrigatório</span>
            </label>
            <span
              className={
                values.descricao.length === MAX_DESC
                  ? "char-counter char-counter--full"
                  : "char-counter"
              }
              aria-hidden="true"
            >
              {values.descricao.length}/{MAX_DESC}
            </span>
          </div>
          <textarea
            id="descricao"
            name="descricao"
            rows={6}
            maxLength={MAX_DESC}
            placeholder="Conte sobre a personalidade, saúde e história do animal…"
            value={values.descricao}
            required
            onChange={(event) => update("descricao", event.target.value)}
            aria-invalid={Boolean(errors.descricao) || undefined}
            aria-describedby={errors.descricao ? "descricao-error" : "descricao-hint"}
          />
          {errors.descricao ? (
            <p id="descricao-error" className="field-error" role="alert">
              {errors.descricao}
            </p>
          ) : (
            <p id="descricao-hint" className="field-hint">
              Dica: comportamento, vacinação e o que torna esse animal especial.
            </p>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={status === "submitting"}
            aria-busy={status === "submitting"}
            className="btn btn--primary btn--lg"
          >
            {status === "submitting" ? "Enviando…" : "Salvar cadastro"}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--lg"
            onClick={() => {
              setValues(initial);
              setErrors({});
              setStatus("idle");
            }}
          >
            Limpar
          </button>
        </div>
      </form>
    </section>
  );
}

export default Cadastro;
