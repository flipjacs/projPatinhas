import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaCheck, FaCircleCheck } from "react-icons/fa6";

import { useAuth } from "../contexts/useAuth";
import { aplicarErrosRHF, mensagemDoErro } from "../services/erros";
import { mascaraTelefone, mascaraUF } from "../services/mascaras";
import Banner from "../components/Banner";
import Campo from "../components/form/Campo";
import CampoSenha from "../components/form/CampoSenha";
import CampoTextarea from "../components/form/CampoTextarea";
import "../css/registrostyle.css";

/* ─────────── SCHEMA (espelha o backend) ─────────── */
const regexTelefone = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

// telefone/cidade/estado AGORA são obrigatórios — alinha com o backend
// (auth.schema.registrarBody) e impede contas incompletas desde a criação.
const schema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome completo").max(120, "Nome muito longo"),
    email: z.string().trim().toLowerCase().email("Informe um e-mail válido").max(180),
    telefone: z
      .string()
      .trim()
      .min(1, "Informe um telefone para contato")
      .regex(regexTelefone, "Use o formato (11) 99999-9999"),
    cidade: z
      .string()
      .trim()
      .min(1, "Informe sua cidade")
      .max(80, "Cidade muito longa"),
    estado: z
      .string()
      .trim()
      .min(1, "Informe seu estado")
      .length(2, "UF deve ter 2 letras"),
    senha: z
      .string()
      .min(8, "Pelo menos 8 caracteres")
      .max(72, "Senha muito longa")
      .regex(/[A-Z]/, "Inclua uma letra maiúscula")
      .regex(/[0-9]/, "Inclua um número"),
    confirmarSenha: z.string(),
    bio: z.string().trim().max(280, "Máximo de 280 caracteres").optional().or(z.literal("")),
    aceiteTermos: z.literal(true, {
      errorMap: () => ({ message: "Aceite os termos para continuar" }),
    }),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  });

const valoresIniciais = {
  nome: "",
  email: "",
  telefone: "",
  cidade: "",
  estado: "",
  senha: "",
  confirmarSenha: "",
  bio: "",
  aceiteTermos: false,
};

const MAX_BIO = 280;

function forcaSenha(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return { score, label: ["", "Fraca", "Razoável", "Boa", "Forte"][score] };
}

/** Wrapper que aplica uma máscara ao valor antes de delegar pro onChange do RHF. */
function comMascara(reg, mascara) {
  return {
    ...reg,
    onChange: (e) => {
      e.target.value = mascara(e.target.value);
      return reg.onChange(e);
    },
  };
}

export default function Registro() {
  const navigate = useNavigate();
  const { registrar, autenticado, bootstrapping } = useAuth();
  const [erroGeral, setErroGeral] = useState(null);
  const [concluido, setConcluido] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais,
    mode: "onBlur",
  });

  const senhaValue = watch("senha") ?? "";
  const bioValue = watch("bio") ?? "";
  const forca = useMemo(() => forcaSenha(senhaValue), [senhaValue]);

  // Se a sessão já estiver ativa, manda para a home (não duplique conta).
  useEffect(() => {
    if (!bootstrapping && autenticado) navigate("/", { replace: true });
  }, [autenticado, bootstrapping, navigate]);

  async function onSubmit(valores) {
    setErroGeral(null);
    // telefone/cidade/estado agora sempre vão — são obrigatórios. bio segue
    // opcional (não pressionamos a pessoa a escrever sobre si na hora de
    // registrar).
    const payload = {
      nome: valores.nome,
      email: valores.email,
      senha: valores.senha,
      telefone: valores.telefone,
      cidade: valores.cidade,
      estado: valores.estado.toUpperCase(),
      ...(valores.bio ? { bio: valores.bio } : {}),
    };
    try {
      await registrar(payload);
      setConcluido(true);
      reset(valoresIniciais);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (erro) {
      const aplicou = aplicarErrosRHF(erro, setError, Object.keys(valoresIniciais));
      if (!aplicou) setErroGeral(mensagemDoErro(erro));
    }
  }

  if (concluido) {
    return (
      <section className="registro-success" aria-labelledby="success-title">
        <FaCircleCheck className="success-icon" aria-hidden="true" />
        <h1 id="success-title">Conta criada com sucesso!</h1>
        <p>
          Você já está logado. Conheça os animais disponíveis ou cadastre sua ONG
          para começar a publicar adoções.
        </p>
        <div className="success-actions">
          <Link to="/adotar" className="btn btn--primary btn--lg">
            Conhecer animais
          </Link>
          <Link to="/" className="btn btn--ghost btn--lg">
            Ir para o início
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="registro" aria-labelledby="registro-title">
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
            <li><FaCheck aria-hidden="true" /> Adote, doe ou ajude a divulgar</li>
            <li><FaCheck aria-hidden="true" /> Acompanhe ONGs parceiras</li>
            <li><FaCheck aria-hidden="true" /> Cadastre animais para adoção</li>
          </ul>
        </div>
      </aside>

      <div className="registro-form-wrap">
        <div className="registro-form-card">
          <header className="registro-form-head">
            <h1 id="registro-title">Crie sua conta</h1>
            <p>É rápido e gratuito.</p>
          </header>

          {erroGeral && <Banner tipo="erro" mensagem={erroGeral} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="registro-form">
            <div className="row-2">
              <Campo
                label="Nome completo"
                id="nome"
                obrigatorio
                error={errors.nome}
                autoComplete="name"
                placeholder="Maria da Silva"
                {...register("nome")}
              />
              <Campo
                label="E-mail"
                id="email"
                type="email"
                obrigatorio
                error={errors.email}
                autoComplete="email"
                inputMode="email"
                placeholder="voce@exemplo.com"
                {...register("email")}
              />
            </div>

            <div className="row-2">
              <Campo
                label="Telefone"
                id="telefone"
                obrigatorio
                error={errors.telefone}
                autoComplete="tel"
                inputMode="tel"
                placeholder="(92) 99999-9999"
                {...comMascara(register("telefone"), mascaraTelefone)}
              />
              <Campo
                label="Cidade"
                id="cidade"
                obrigatorio
                error={errors.cidade}
                autoComplete="address-level2"
                placeholder="Manaus"
                {...register("cidade")}
              />
            </div>

            <div className="row-2">
              <Campo
                label="UF"
                id="estado"
                obrigatorio
                error={errors.estado}
                autoComplete="address-level1"
                placeholder="AM"
                maxLength={2}
                {...comMascara(register("estado"), mascaraUF)}
              />
              <div />
            </div>

            <CampoSenha
              label="Senha"
              id="senha"
              obrigatorio
              error={errors.senha}
              autoComplete="new-password"
              {...register("senha")}
            />

            {senhaValue && (
              <div className="strength" aria-live="polite">
                <div className="strength-track">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`strength-bar strength-bar--${forca.score >= i ? "on" : "off"}`}
                      data-level={forca.score}
                    />
                  ))}
                </div>
                <span className="strength-label" data-level={forca.score}>{forca.label}</span>
              </div>
            )}

            <CampoSenha
              label="Confirmar senha"
              id="confirmarSenha"
              obrigatorio
              error={errors.confirmarSenha}
              autoComplete="new-password"
              {...register("confirmarSenha")}
            />

            <CampoTextarea
              label="Sobre você"
              id="bio"
              opcional
              rows={3}
              valor={bioValue}
              max={MAX_BIO}
              error={errors.bio}
              placeholder="Conte um pouco sobre você e por que quer adotar."
              {...register("bio")}
            />

            <div className="terms">
              <label className="terms-label">
                <input type="checkbox" {...register("aceiteTermos")} />
                <span>
                  Li e concordo com os{" "}
                  <a href="/termos" target="_blank" rel="noopener noreferrer">Termos de uso</a>{" "}
                  e a{" "}
                  <a href="/privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>.
                </span>
              </label>
              {errors.aceiteTermos && (
                <p className="field-error" role="alert">{errors.aceiteTermos.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="btn btn--primary btn--lg btn--block"
            >
              {isSubmitting ? "Criando conta…" : "Criar conta"}
            </button>

            <p className="login-prompt">
              Já tem conta? <Link to="/login">Entrar</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
