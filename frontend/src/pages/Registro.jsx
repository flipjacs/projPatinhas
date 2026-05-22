import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FaEye,
  FaEyeSlash,
  FaCamera,
  FaCheck,
  FaCircleCheck,
  FaTrash,
} from "react-icons/fa6";
import "../css/registrostyle.css";

/* ──────────────── SCHEMA ──────────────── */
const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome completo")
      .max(80, "Nome muito longo"),
    email: z.string().trim().toLowerCase().email("Informe um e-mail válido"),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Use o formato (11) 99999-9999"),
    city: z.string().trim().max(60).optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Inclua uma letra maiúscula")
      .regex(/[0-9]/, "Inclua um número"),
    confirmPassword: z.string(),
    bio: z
      .string()
      .trim()
      .max(200, "Máximo de 200 caracteres")
      .optional()
      .or(z.literal("")),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Aceite os termos para continuar" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

const defaultValues = {
  name: "",
  email: "",
  phone: "",
  city: "",
  password: "",
  confirmPassword: "",
  bio: "",
  terms: false,
};

const MAX_BIO = 200;
const MAX_AVATAR_MB = 5;

/* ──────────────── PASSWORD STRENGTH ──────────────── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  return { score, label: labels[score] };
}

/* ──────────────── COMPONENT ──────────────── */
function Registro() {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  const passwordValue = watch("password") ?? "";
  const bioValue = watch("bio") ?? "";
  const strength = useMemo(() => getStrength(passwordValue), [passwordValue]);

  /* Clean up object URLs */
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleFile(file) {
    setAvatarError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Envie uma imagem (jpg, png ou webp).");
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      setAvatarError(`A imagem deve ter no máximo ${MAX_AVATAR_MB} MB.`);
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function clearAvatar() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onDrop(event) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  }

  async function onSubmit(values) {
    /* Simulate API call — replace with services/api.js when backend exists */
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (import.meta.env.DEV) {
      console.info("[registro] payload:", { ...values, avatar: !!avatarPreview });
    }
    setDone(true);
    reset();
    clearAvatar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) return <Success onAgain={() => setDone(false)} />;

  return (
    <section className="registro" aria-labelledby="registro-title">
      {/* ─── BRANDING PANEL ─── */}
      <aside className="registro-aside" aria-hidden="true">
        <div className="registro-aside-inner">
          <p className="registro-eyebrow">
            <span className="registro-eyebrow-dot" />
            Crie sua conta gratuita
          </p>
          <h1 className="registro-aside-title">
            Junte-se a quem <span>transforma vidas</span>
          </h1>
          <p className="registro-aside-lead">
            Cadastre-se em segundos e tenha acesso a perfis de animais, ONGs
            parceiras e oportunidades de adoção responsável.
          </p>

          <ul className="registro-benefits">
            <li>
              <FaCheck aria-hidden="true" />
              Adote, doe ou ajude a divulgar
            </li>
            <li>
              <FaCheck aria-hidden="true" />
              Acompanhe ONGs parceiras
            </li>
            <li>
              <FaCheck aria-hidden="true" />
              Cadastre animais para adoção
            </li>
          </ul>
        </div>
      </aside>

      {/* ─── FORM ─── */}
      <div className="registro-form-wrap">
        <div className="registro-form-card">
          <header className="registro-form-head">
            <h1 id="registro-title">Crie sua conta</h1>
            <p>É rápido e gratuito.</p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="registro-form">
            {/* ─── AVATAR ─── */}
            <div className="avatar-field">
              <span className="avatar-label">Foto de perfil <span className="muted">(opcional)</span></span>
              <div
                className={
                  dragOver ? "avatar-zone avatar-zone--drag" : "avatar-zone"
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
              >
                <div className="avatar-circle" aria-hidden="true">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" />
                  ) : (
                    <FaCamera />
                  )}
                </div>
                <div className="avatar-actions">
                  <label className="avatar-btn">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    {avatarPreview ? "Trocar foto" : "Enviar foto"}
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      className="avatar-btn avatar-btn--ghost"
                      onClick={clearAvatar}
                    >
                      <FaTrash aria-hidden="true" /> Remover
                    </button>
                  )}
                  <p className="avatar-hint">
                    PNG, JPG ou WEBP até {MAX_AVATAR_MB} MB. Arraste ou clique.
                  </p>
                </div>
              </div>
              {avatarError && (
                <p className="field-error" role="alert">
                  {avatarError}
                </p>
              )}
            </div>

            {/* ─── NAME + EMAIL ─── */}
            <div className="row-2">
              <Field
                label="Nome completo"
                id="name"
                required
                error={errors.name}
                {...register("name")}
                autoComplete="name"
                placeholder="Maria da Silva"
              />
              <Field
                label="E-mail"
                id="email"
                type="email"
                required
                error={errors.email}
                {...register("email")}
                autoComplete="email"
                inputMode="email"
                placeholder="voce@exemplo.com"
              />
            </div>

            {/* ─── PHONE + CITY ─── */}
            <div className="row-2">
              <Field
                label="Telefone"
                id="phone"
                required
                error={errors.phone}
                {...register("phone")}
                autoComplete="tel"
                inputMode="tel"
                placeholder="(92) 99999-9999"
              />
              <Field
                label="Cidade"
                id="city"
                optional
                error={errors.city}
                {...register("city")}
                autoComplete="address-level2"
                placeholder="Manaus, AM"
              />
            </div>

            {/* ─── PASSWORD ─── */}
            <PasswordField
              label="Senha"
              id="password"
              required
              error={errors.password}
              autoComplete="new-password"
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              {...register("password")}
            />

            {/* Strength meter */}
            {passwordValue && (
              <div className="strength" aria-live="polite">
                <div className="strength-track">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`strength-bar strength-bar--${strength.score >= i ? "on" : "off"}`}
                      data-level={strength.score}
                    />
                  ))}
                </div>
                <span className="strength-label" data-level={strength.score}>
                  {strength.label}
                </span>
              </div>
            )}

            <PasswordField
              label="Confirmar senha"
              id="confirmPassword"
              required
              error={errors.confirmPassword}
              autoComplete="new-password"
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              {...register("confirmPassword")}
            />

            {/* ─── BIO ─── */}
            <div className="field">
              <div className="field-label-row">
                <label htmlFor="bio">
                  Sobre você <span className="muted">(opcional)</span>
                </label>
                <span className="char-counter" aria-hidden="true">
                  {bioValue.length}/{MAX_BIO}
                </span>
              </div>
              <textarea
                id="bio"
                rows={3}
                maxLength={MAX_BIO}
                placeholder="Conte um pouco sobre você e por que quer adotar."
                aria-invalid={Boolean(errors.bio) || undefined}
                aria-describedby={errors.bio ? "bio-error" : undefined}
                {...register("bio")}
              />
              {errors.bio && (
                <p id="bio-error" className="field-error" role="alert">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* ─── TERMS ─── */}
            <div className="terms">
              <label className="terms-label">
                <input type="checkbox" {...register("terms")} />
                <span>
                  Li e concordo com os{" "}
                  <a href="/termos" target="_blank" rel="noopener noreferrer">
                    Termos de uso
                  </a>{" "}
                  e a{" "}
                  <a href="/privacidade" target="_blank" rel="noopener noreferrer">
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>
              {errors.terms && (
                <p className="field-error" role="alert">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* ─── SUBMIT ─── */}
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="btn btn--primary btn--lg btn--block"
            >
              {isSubmitting ? "Criando conta…" : "Criar conta"}
            </button>

            <p className="login-prompt">
              Já tem conta? <Link to="/">Entrar</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ──────────────── FIELD PRIMITIVES ──────────────── */
function Field({
  label,
  id,
  required,
  optional,
  error,
  type = "text",
  ...inputProps
}) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && (
          <span className="required-mark" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="muted"> (opcional)</span>}
        {required && <span className="sr-only">obrigatório</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  id,
  required,
  error,
  show,
  onToggle,
  ...inputProps
}) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && (
          <span className="required-mark" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">obrigatório</span>}
      </label>
      <div className="password-wrap">
        <input
          id={id}
          type={show ? "text" : "password"}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={show}
          onClick={onToggle}
          tabIndex={-1}
        >
          {show ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

/* ──────────────── SUCCESS STATE ──────────────── */
function Success({ onAgain }) {
  return (
    <section className="registro-success" aria-labelledby="success-title">
      <FaCircleCheck className="success-icon" aria-hidden="true" />
      <h1 id="success-title">Conta criada com sucesso!</h1>
      <p>
        Enviamos um e-mail de boas-vindas. Em breve nossa equipe entrará em
        contato para concluir seu cadastro.
      </p>
      <div className="success-actions">
        <Link to="/adotar" className="btn btn--primary btn--lg">
          Conhecer animais
        </Link>
        <button
          type="button"
          className="btn btn--ghost btn--lg"
          onClick={onAgain}
        >
          Cadastrar outra conta
        </button>
      </div>
    </section>
  );
}

export default Registro;
