import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "../contexts/useAuth";
import { aplicarErrosRHF, mensagemDoErro } from "../services/erros";
import Banner from "../components/Banner";
import Campo from "../components/form/Campo";
import CampoSenha from "../components/form/CampoSenha";
import "../css/registrostyle.css";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido"),
  senha: z.string().min(1, "Informe sua senha"),
});

export default function Login() {
  const navigate = useNavigate();
  const localizacao = useLocation();
  const { login } = useAuth();
  const [erroGeral, setErroGeral] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "" },
    mode: "onBlur",
  });

  async function onSubmit(valores) {
    setErroGeral(null);
    try {
      await login(valores);
      const destino = localizacao.state?.retornarPara || "/";
      navigate(destino, { replace: true });
    } catch (erro) {
      const aplicou = aplicarErrosRHF(erro, setError, ["email", "senha"]);
      if (!aplicou) setErroGeral(mensagemDoErro(erro));
    }
  }

  return (
    <section className="registro" aria-labelledby="login-title">
      <aside className="registro-aside" aria-hidden="true">
        <div className="registro-aside-inner">
          <p className="registro-eyebrow">
            <span className="registro-eyebrow-dot" />
            Bem-vindo de volta
          </p>
          <h1 className="registro-aside-title">
            Entre e continue <span>transformando vidas</span>
          </h1>
          <p className="registro-aside-lead">
            Acompanhe ONGs parceiras, solicite adoções e gerencie os animais
            que você cadastrou.
          </p>
        </div>
      </aside>

      <div className="registro-form-wrap">
        <div className="registro-form-card">
          <header className="registro-form-head">
            <h1 id="login-title">Entrar</h1>
            <p>Use o e-mail e a senha cadastrados.</p>
          </header>

          {erroGeral && <Banner tipo="erro" mensagem={erroGeral} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="registro-form">
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

            <CampoSenha
              label="Senha"
              id="senha"
              obrigatorio
              error={errors.senha}
              autoComplete="current-password"
              {...register("senha")}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="btn btn--primary btn--lg btn--block"
            >
              {isSubmitting ? "Entrando…" : "Entrar"}
            </button>

            <p className="login-prompt">
              Não tem conta? <Link to="/registro">Criar conta</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
