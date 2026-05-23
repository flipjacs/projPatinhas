import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "../contexts/useAuth";
import * as usuariosApi from "../services/usuariosApi";
import { aplicarErrosRHF, mensagemDoErro } from "../services/erros";
import { mascaraTelefone, mascaraUF } from "../services/mascaras";
import Banner from "../components/Banner";
import Campo from "../components/form/Campo";
import CampoTextarea from "../components/form/CampoTextarea";
import ConfirmDialog from "../components/ConfirmDialog";
import ConfirmSaveDialog from "../components/ConfirmSaveDialog";
import UploadFoto from "../components/UploadFoto";
import PageHeader from "../components/PageHeader";
import useUnsavedWarning from "../hooks/useUnsavedWarning";
import "../css/dashboardstyle.css";

const regexTelefone = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
const MAX_BIO = 280;
const DURACAO_SUCESSO_MS = 4000;

// Rótulos legíveis usados no modal de confirmação (em ordem de exibição).
const ROTULOS_CAMPOS = {
  nome: "Nome completo",
  telefone: "Telefone",
  cidade: "Cidade",
  estado: "Estado (UF)",
  bio: "Sobre você",
  foto_url: "Foto de perfil",
};

const ORDEM_CAMPOS = ["nome", "telefone", "cidade", "estado", "bio", "foto_url"];

// Campos de perfil OBRIGATÓRIOS — definidos pela política do produto para
// evitar perfis incompletos que prejudicam o contato entre adotantes e ONGs.
const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  telefone: z
    .string()
    .trim()
    .min(1, "Informe um telefone para contato")
    .regex(regexTelefone, "Use o formato (11) 99999-9999"),
  cidade: z.string().trim().min(1, "Informe sua cidade").max(80, "Cidade muito longa"),
  estado: z
    .string()
    .trim()
    .min(1, "Informe seu estado")
    .length(2, "UF deve ter 2 letras"),
  bio: z.string().trim().max(MAX_BIO, "Máximo de 280 caracteres").optional().or(z.literal("")),
  foto_url: z.string().trim().min(1, "Envie uma foto de perfil").max(500),
});

function comMascara(reg, mascara) {
  return {
    ...reg,
    onChange: (e) => {
      e.target.value = mascara(e.target.value);
      return reg.onChange(e);
    },
  };
}

export default function Perfil() {
  const navigate = useNavigate();
  const { usuario, atualizarUsuarioLocal, logout } = useAuth();
  const [aviso, setAviso] = useState(null);
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);
  // Estado da confirmação de salvar — guarda { mudancas, payload } para
  // que a confirmação no modal possa disparar o request sem precisar
  // recalcular o diff.
  const [confirmandoSalvar, setConfirmandoSalvar] = useState(null);
  const [erroNoModal, setErroNoModal] = useState(null);

  const valoresIniciais = {
    nome: usuario?.nome ?? "",
    telefone: usuario?.telefone ?? "",
    cidade: usuario?.cidade ?? "",
    estado: usuario?.estado ?? "",
    bio: usuario?.bio ?? "",
    foto_url: usuario?.foto_url ?? "",
  };

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais,
    mode: "onBlur",
  });

  const bioValue = watch("bio") ?? "";

  // Aviso do navegador ao tentar fechar/atualizar a aba com edições pendentes.
  // Não bloqueamos navegação interna (custo de migrar pro data router não
  // compensa) — confiamos no indicador visível "alterações não salvas" + o
  // próprio modal de confirmação para evitar perda de dados acidental.
  useUnsavedWarning(isDirty && !confirmandoSalvar);

  // Auto-dismiss do toast de sucesso. Erros permanecem até nova ação.
  useEffect(() => {
    if (aviso?.tipo !== "sucesso") return undefined;
    const t = setTimeout(() => setAviso(null), DURACAO_SUCESSO_MS);
    return () => clearTimeout(t);
  }, [aviso]);

  // Mantém o form em sincronia se o usuário do contexto mudar (ex: bootstrap tardio).
  useEffect(() => {
    if (usuario) {
      reset({
        nome: usuario.nome ?? "",
        telefone: usuario.telefone ?? "",
        cidade: usuario.cidade ?? "",
        estado: usuario.estado ?? "",
        bio: usuario.bio ?? "",
        foto_url: usuario.foto_url ?? "",
      });
    }
  }, [usuario, reset]);

  /**
   * Calcula o payload + a lista de mudanças amigáveis para o modal.
   * Retorna { payload, mudancas } ou null se nada mudou.
   */
  function calcularDiff(valores) {
    const original = {
      nome: usuario.nome ?? "",
      telefone: usuario.telefone ?? "",
      cidade: usuario.cidade ?? "",
      estado: (usuario.estado ?? "").toUpperCase(),
      bio: usuario.bio ?? "",
      foto_url: usuario.foto_url ?? "",
    };
    const novo = {
      nome: valores.nome,
      telefone: valores.telefone,
      cidade: valores.cidade,
      estado: (valores.estado || "").toUpperCase(),
      bio: valores.bio,
      foto_url: valores.foto_url,
    };

    const payload = {};
    const mudancas = [];
    for (const k of ORDEM_CAMPOS) {
      if (novo[k] === original[k]) continue;
      const item = {
        chave: k,
        label: ROTULOS_CAMPOS[k],
        antes: original[k],
        depois: novo[k],
        tipo: k === "foto_url"
          ? "foto"
          : (k === "bio" && novo[k] === "") ? "removido" : "texto",
      };
      mudancas.push(item);
      // bio opcional: string vazia significa "limpar".
      if (k === "bio" && novo[k] === "") payload.bio = "";
      else payload[k] = novo[k];
    }

    return mudancas.length === 0 ? null : { payload, mudancas };
  }

  /** Submit do form → ABRE o modal (não envia ainda). */
  function aoEnviarForm(valores) {
    setAviso(null);
    setErroNoModal(null);
    if (!usuario) return;
    const diff = calcularDiff(valores);
    if (!diff) {
      setAviso({ tipo: "info", texto: "Nada para atualizar." });
      return;
    }
    setConfirmandoSalvar(diff);
  }

  /** Confirma no modal → DISPARA o request. */
  async function confirmarSalvar() {
    if (!confirmandoSalvar || !usuario) return;
    setErroNoModal(null);
    try {
      const atualizado = await usuariosApi.atualizar(usuario.id, confirmandoSalvar.payload);
      atualizarUsuarioLocal(atualizado);
      // reset do RHF zera isDirty — fica claro que está tudo salvo.
      reset({
        nome: atualizado.nome ?? "",
        telefone: atualizado.telefone ?? "",
        cidade: atualizado.cidade ?? "",
        estado: atualizado.estado ?? "",
        bio: atualizado.bio ?? "",
        foto_url: atualizado.foto_url ?? "",
      });
      setConfirmandoSalvar(null);
      setAviso({ tipo: "sucesso", texto: "Perfil atualizado!" });
    } catch (e) {
      // Erros de campo voltam pro form (e fecham o modal); erros gerais
      // ficam INSIDE o modal para o usuário ver sem perder o contexto.
      const aplicou = aplicarErrosRHF(e, setError, Object.keys(valoresIniciais));
      if (aplicou) {
        setConfirmandoSalvar(null);
        setAviso({ tipo: "erro", texto: "Algum campo precisa ser corrigido. Veja os erros no formulário." });
      } else {
        setErroNoModal(mensagemDoErro(e));
      }
    }
  }

  async function confirmarExclusao() {
    if (!usuario) return;
    try {
      await usuariosApi.remover(usuario.id);
      await logout();
      navigate("/", { replace: true });
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDoErro(e) });
      setConfirmandoExcluir(false);
    }
  }

  return (
    <section className="dash" aria-labelledby="perfil-title">
      <PageHeader
        trilha={[
          { label: "Minha área", para: "/minha-area" },
          { label: "Meu perfil" },
        ]}
        titulo="Meu perfil"
        tituloId="perfil-title"
        descricao="Atualize suas informações de contato e visibilidade pública."
      />

      {aviso && (
        <Banner
          tipo={
            aviso.tipo === "sucesso" ? "sucesso"
              : aviso.tipo === "erro" ? "erro"
                : "info"
          }
          mensagem={aviso.texto}
        />
      )}

      <form onSubmit={handleSubmit(aoEnviarForm)} noValidate className="perfil-form">
        <Campo
          label="Nome completo"
          id="nome"
          obrigatorio
          error={errors.nome}
          autoComplete="name"
          {...register("nome")}
        />

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
            label="E-mail"
            id="email"
            type="email"
            value={usuario?.email ?? ""}
            readOnly
            disabled
            hint="O e-mail não pode ser alterado nesta versão."
          />
        </div>

        <div className="row-cidade-uf">
          <Campo
            label="Cidade"
            id="cidade"
            obrigatorio
            autoComplete="address-level2"
            error={errors.cidade}
            {...register("cidade")}
          />
          <Campo
            label="UF"
            id="estado"
            obrigatorio
            maxLength={2}
            autoComplete="address-level1"
            error={errors.estado}
            {...comMascara(register("estado"), mascaraUF)}
          />
        </div>

        <CampoTextarea
          label="Sobre você"
          id="bio"
          opcional
          rows={3}
          valor={bioValue}
          max={MAX_BIO}
          error={errors.bio}
          placeholder="Conte um pouco sobre você."
          {...register("bio")}
        />

        <Controller
          control={control}
          name="foto_url"
          render={({ field, fieldState }) => (
            <UploadFoto
              ref={field.ref}
              id="foto_perfil"
              tipo="avatar"
              forma="circulo"
              label="Foto de perfil"
              obrigatorio
              hint="Use uma foto sua que ajude ONGs a te reconhecerem."
              valor={field.value || null}
              aoMudar={(url) => field.onChange(url ?? "")}
              onBlur={field.onBlur}
              error={fieldState.error}
            />
          )}
        />

        <div className="perfil-actions">
          <div
            className={`perfil-dirty ${isDirty ? "is-visivel" : ""}`}
            aria-live="polite"
          >
            <span className="perfil-dirty-dot" aria-hidden="true" />
            {isDirty ? "Você tem alterações não salvas" : ""}
          </div>
          <div className="perfil-actions-botoes">
            <button
              type="button"
              className="btn btn--ghost btn--lg"
              onClick={() => reset(valoresIniciais)}
              disabled={!isDirty || isSubmitting}
            >
              Desfazer
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              aria-busy={isSubmitting}
              className="btn btn--primary btn--lg"
            >
              {isSubmitting ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </form>

      <div className="perfil-danger">
        <h2>Zona de perigo</h2>
        <p>
          Excluir sua conta remove seu acesso e revoga todas as sessões.
          Animais que você cadastrou continuam visíveis até que sejam removidos
          individualmente.
        </p>
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => setConfirmandoExcluir(true)}
        >
          Excluir minha conta
        </button>
      </div>

      <ConfirmDialog
        aberto={confirmandoExcluir}
        titulo="Excluir conta?"
        mensagem="Esta ação é definitiva. Você perderá acesso imediatamente."
        rotuloConfirmar="Excluir minha conta"
        perigo
        aoConfirmar={confirmarExclusao}
        aoFechar={() => setConfirmandoExcluir(false)}
      />

      <ConfirmSaveDialog
        aberto={Boolean(confirmandoSalvar)}
        mudancas={confirmandoSalvar?.mudancas ?? []}
        erro={erroNoModal}
        aoConfirmar={confirmarSalvar}
        aoFechar={() => { setConfirmandoSalvar(null); setErroNoModal(null); }}
      />
    </section>
  );
}
