import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaCircleCheck } from "react-icons/fa6";

import { useAuth } from "../contexts/useAuth";
import * as animaisApi from "../services/animaisApi";
import * as ongsApi from "../services/ongsApi";
import { aplicarErrosRHF, mensagemDoErro } from "../services/erros";
import { mascaraUF } from "../services/mascaras";
import Banner from "../components/Banner";
import Campo from "../components/form/Campo";
import CampoTextarea from "../components/form/CampoTextarea";
import UploadFoto from "../components/UploadFoto";
import PageHeader from "../components/PageHeader";
import "../css/cadastrostyle.css";

const ESPECIES = [
  { id: "cachorro", label: "Cachorro", emoji: "🐶" },
  { id: "gato", label: "Gato", emoji: "🐱" },
  { id: "outro", label: "Outro", emoji: "🐾" },
];
const PORTES = ["pequeno", "medio", "grande"];
const SEXOS = ["macho", "femea", "desconhecido"];

const MAX_DESC = 2000;

const schemaAnimal = z.object({
  nome: z.string().trim().min(2, "Informe o nome do animal").max(80),
  especie: z.enum(["cachorro", "gato", "outro"], { errorMap: () => ({ message: "Selecione a espécie" }) }),
  porte: z.enum(PORTES, { errorMap: () => ({ message: "Selecione o porte" }) }),
  sexo: z.enum(SEXOS).default("desconhecido"),
  // Raça obrigatória — para SRD basta digitar "SRD". Decisão de produto:
  // adotantes filtram por raça com frequência e cadastros sem essa info
  // ficam praticamente invisíveis na busca.
  raca: z.string().trim().min(1, 'Informe a raça (ou "SRD" para Sem Raça Definida)').max(80),
  idade_anos: z.coerce.number().int().min(0).max(40).optional().or(z.literal("")),
  idade_meses: z.coerce.number().int().min(0).max(11).optional().or(z.literal("")),
  castrado: z.boolean().default(false),
  vacinado: z.boolean().default(false),
  descricao: z.string().trim().min(10, "Conte um pouco mais (mínimo 10 caracteres)").max(MAX_DESC),
  // Foto obrigatória — sem foto a chance de adoção cai drasticamente.
  // O <UploadFoto/> preenche este campo após o upload completar.
  foto_url: z.string().trim().min(1, "Envie uma foto do animal").max(500),
});

const valoresIniciais = {
  nome: "",
  especie: "cachorro",
  porte: "medio",
  sexo: "desconhecido",
  raca: "",
  idade_anos: "",
  idade_meses: "",
  castrado: false,
  vacinado: false,
  descricao: "",
  foto_url: "",
};

// Rótulo legível por campo — usado no sumário de erros do topo do form.
const ROTULOS = {
  nome: "Nome do animal",
  especie: "Espécie",
  raca: "Raça",
  porte: "Porte",
  sexo: "Sexo",
  idade_anos: "Idade (anos)",
  idade_meses: "Idade (meses)",
  foto_url: "Foto do animal",
  descricao: "Descrição",
};

function comMascara(reg, mascara) {
  return {
    ...reg,
    onChange: (e) => {
      e.target.value = mascara(e.target.value);
      return reg.onChange(e);
    },
  };
}

export default function Cadastro() {
  const { usuario, refrescarUsuario } = useAuth();
  const podeCadastrar = usuario && (usuario.papel === "ong" || usuario.papel === "admin");

  if (!podeCadastrar) {
    return <BloqueioOng aoCriarOng={refrescarUsuario} />;
  }
  return <FormularioAnimal />;
}

/* ─────────── ANIMAL FORM ─────────── */
function FormularioAnimal() {
  const [erroGeral, setErroGeral] = useState(null);
  // sucesso guarda o NOME do último animal cadastrado para usar na tela
  // de confirmação. null = ainda no formulário.
  const [sucesso, setSucesso] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting, submitCount },
  } = useForm({
    resolver: zodResolver(schemaAnimal),
    defaultValues: valoresIniciais,
    mode: "onBlur",
  });

  const descValue = watch("descricao") ?? "";
  const especieSelecionada = watch("especie");
  const porteSelecionado = watch("porte");

  // Sumário de erros: só aparece DEPOIS do primeiro submit inválido — evita
  // poluir o topo do form enquanto o usuário ainda nem tentou enviar.
  const camposComErro = Object.keys(errors);
  const mostrarResumo = submitCount > 0 && camposComErro.length > 0;

  async function onSubmit(valores) {
    setErroGeral(null);

    const payload = {
      nome: valores.nome,
      especie: valores.especie,
      porte: valores.porte,
      sexo: valores.sexo,
      descricao: valores.descricao,
      castrado: !!valores.castrado,
      vacinado: !!valores.vacinado,
      raca: valores.raca,
      foto_url: valores.foto_url,
      ...(valores.idade_anos !== "" ? { idade_anos: Number(valores.idade_anos) } : {}),
      ...(valores.idade_meses !== "" ? { idade_meses: Number(valores.idade_meses) } : {}),
    };

    try {
      await animaisApi.cadastrar(payload);
      // Capturamos o nome ANTES do reset — caso contrário a tela de sucesso
      // mostra "Cadastrado!" sem contexto.
      setSucesso({ nome: valores.nome });
      reset(valoresIniciais);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const aplicou = aplicarErrosRHF(e, setError, Object.keys(valoresIniciais));
      if (!aplicou) setErroGeral(mensagemDoErro(e));
    }
  }

  if (sucesso) {
    return (
      <SucessoCadastro
        nome={sucesso.nome}
        aoCadastrarOutro={() => setSucesso(null)}
      />
    );
  }

  return (
    <section className="cadastro" aria-labelledby="cadastro-title">
      <PageHeader
        trilha={[
          { label: "Minha área", para: "/minha-area" },
          { label: "Cadastrar animal" },
        ]}
        titulo="Cadastre um animal para adoção"
        tituloId="cadastro-title"
        descricao="Quanto mais detalhes você fornecer, maiores as chances de encontrar uma família amorosa."
      />

      {erroGeral && <Banner tipo="erro" mensagem={erroGeral} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="cadastro-form">
        {mostrarResumo && <ResumoErros errors={errors} />}

        <p className="form-hint-top">
          Os campos marcados com <span className="required-mark" aria-hidden="true">*</span> são obrigatórios.
        </p>

        {/* ─── Seção 1: Identificação ─── */}
        <Secao
          numero={1}
          titulo="Identificação"
          descricao="Como o animal é chamado e qual é a espécie."
        >
          <Campo
            label="Nome do animal"
            id="nome"
            obrigatorio
            error={errors.nome}
            placeholder="Ex.: Luna"
            autoComplete="off"
            {...register("nome")}
          />

          <fieldset
            className="field"
            aria-describedby={errors.especie ? "especie-error" : undefined}
          >
            <legend>
              Espécie <span className="required-mark" aria-hidden="true">*</span>
              <span className="sr-only">obrigatório</span>
            </legend>
            <div className="tipo-grid tipo-grid--3">
              {ESPECIES.map((esp) => (
                <label
                  key={esp.id}
                  className={`tipo-card ${especieSelecionada === esp.id ? "is-selecionado" : ""}`}
                >
                  <input
                    type="radio"
                    value={esp.id}
                    checked={especieSelecionada === esp.id}
                    onChange={() => setValue("especie", esp.id, { shouldValidate: true })}
                  />
                  <span className="tipo-icon" aria-hidden="true">{esp.emoji}</span>
                  <span className="tipo-label">{esp.label}</span>
                </label>
              ))}
            </div>
            {errors.especie && (
              <p id="especie-error" className="field-error" role="alert">{errors.especie.message}</p>
            )}
          </fieldset>
        </Secao>

        {/* ─── Seção 2: Foto ─── */}
        <Secao
          numero={2}
          titulo="Foto"
          descricao="A imagem é a capa do anúncio. Cadastros com foto recebem muito mais visitas."
        >
          <Controller
            control={control}
            name="foto_url"
            render={({ field, fieldState }) => (
              <UploadFoto
                ref={field.ref}
                id="foto_animal"
                tipo="animal"
                forma="cartao"
                label="Foto do animal"
                obrigatorio
                hint="Use uma foto bem iluminada, com o animal centralizado. JPG, PNG ou WebP até 5 MB."
                valor={field.value || null}
                aoMudar={(url) => field.onChange(url ?? "")}
                onBlur={field.onBlur}
                error={fieldState.error}
              />
            )}
          />
        </Secao>

        {/* ─── Seção 3: Detalhes ─── */}
        <Secao
          numero={3}
          titulo="Detalhes"
          descricao="Características que ajudam adotantes a encontrar o animal certo."
        >
          <Campo
            label="Raça"
            id="raca"
            obrigatorio
            error={errors.raca}
            placeholder='Ex.: Vira-lata, Husky'
            hint='Para sem raça definida, digite "SRD".'
            autoComplete="off"
            {...register("raca")}
          />

          <fieldset className="field" aria-describedby="idade-hint">
            <legend>
              Idade aproximada <span className="muted">(opcional)</span>
            </legend>
            <div className="row-2">
              <div className="field field--compacto">
                <label htmlFor="idade_anos">Anos</label>
                <input
                  id="idade_anos"
                  type="number"
                  min={0}
                  max={40}
                  placeholder="2"
                  inputMode="numeric"
                  aria-invalid={errors.idade_anos ? true : undefined}
                  {...register("idade_anos")}
                />
                {errors.idade_anos && (
                  <p className="field-error" role="alert">{errors.idade_anos.message}</p>
                )}
              </div>
              <div className="field field--compacto">
                <label htmlFor="idade_meses">Meses</label>
                <input
                  id="idade_meses"
                  type="number"
                  min={0}
                  max={11}
                  placeholder="0–11"
                  inputMode="numeric"
                  aria-invalid={errors.idade_meses ? true : undefined}
                  {...register("idade_meses")}
                />
                {errors.idade_meses && (
                  <p className="field-error" role="alert">{errors.idade_meses.message}</p>
                )}
              </div>
            </div>
            <p id="idade-hint" className="field-hint">
              Deixe em branco se não tiver certeza.
            </p>
          </fieldset>

          <fieldset
            className="field"
            aria-describedby={errors.porte ? "porte-error" : undefined}
          >
            <legend>
              Porte <span className="required-mark" aria-hidden="true">*</span>
              <span className="sr-only">obrigatório</span>
            </legend>
            <div className="chip-group">
              {PORTES.map((p) => (
                <label key={p} className="chip">
                  <input
                    type="radio"
                    value={p}
                    checked={porteSelecionado === p}
                    onChange={() => setValue("porte", p, { shouldValidate: true })}
                  />
                  <span>{p === "medio" ? "Médio" : p[0].toUpperCase() + p.slice(1)}</span>
                </label>
              ))}
            </div>
            {errors.porte && (
              <p id="porte-error" className="field-error" role="alert">{errors.porte.message}</p>
            )}
          </fieldset>

          <fieldset className="field">
            <legend>Sexo <span className="muted">(opcional)</span></legend>
            <div className="chip-group">
              {SEXOS.map((s) => (
                <label key={s} className="chip">
                  <input type="radio" value={s} {...register("sexo")} />
                  <span>
                    {s === "macho" ? "Macho" : s === "femea" ? "Fêmea" : "Não sei"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </Secao>

        {/* ─── Seção 4: Saúde ─── */}
        <Secao
          numero={4}
          titulo="Saúde"
          descricao="Marque o que se aplica. Sinais visíveis de cuidado aumentam a confiança."
        >
          <fieldset className="field">
            <legend className="sr-only">Saúde</legend>
            <div className="chip-group">
              <label className="chip">
                <input type="checkbox" {...register("castrado")} />
                <span>Castrado</span>
              </label>
              <label className="chip">
                <input type="checkbox" {...register("vacinado")} />
                <span>Vacinado</span>
              </label>
            </div>
          </fieldset>
        </Secao>

        {/* ─── Seção 5: História ─── */}
        <Secao
          numero={5}
          titulo="História"
          descricao="O que torna esse animal especial e como ele se comporta."
        >
          <CampoTextarea
            label="Descrição"
            id="descricao"
            obrigatorio
            rows={6}
            valor={descValue}
            max={MAX_DESC}
            error={errors.descricao}
            hint="Personalidade, rotina, com quem se dá bem, histórico de resgate, vacinação…"
            placeholder="Conte sobre a personalidade, saúde e história do animal…"
            {...register("descricao")}
          />
        </Secao>

        <div className="cadastro-actions">
          <button
            type="button"
            className="btn btn--ghost btn--lg"
            onClick={() => reset(valoresIniciais)}
            disabled={isSubmitting}
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="btn btn--primary btn--lg"
          >
            {isSubmitting ? "Publicando…" : "Publicar cadastro"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ─────────── Helpers do form ─────────── */

/**
 * Seção numerada do formulário. Cada seção é um <section> com aria-labelledby
 * para que leitores de tela ofereçam landmarks navegáveis ("Identificação",
 * "Foto", etc.). Visualmente: badge circular com o número + título +
 * subtítulo de uma linha que orienta o que fazer ali.
 */
function Secao({ numero, titulo, descricao, children }) {
  const tituloId = useId();
  return (
    <section
      className="form-section"
      aria-labelledby={tituloId}
    >
      <header className="form-section-head">
        <span className="form-section-num" aria-hidden="true">{numero}</span>
        <div className="form-section-text">
          <h2 id={tituloId} className="form-section-title">{titulo}</h2>
          {descricao && <p className="form-section-desc">{descricao}</p>}
        </div>
      </header>
      <div className="form-section-body">{children}</div>
    </section>
  );
}

/**
 * Sumário inline de erros — surge no topo do form somente após o usuário
 * clicar Publicar e algum campo estiver inválido. Cada item linka via âncora
 * para o campo correspondente; ao clicar, o navegador rola até o campo.
 * O foco continua sendo gerenciado pelo RHF (shouldFocusError).
 */
function ResumoErros({ errors }) {
  const lista = Object.keys(errors)
    .map((campo) => ({
      campo,
      msg: errors[campo]?.message || "Campo inválido",
    }))
    .filter((e) => ROTULOS[e.campo]);

  if (lista.length === 0) return null;

  return (
    <div className="form-resumo" role="alert" aria-live="assertive">
      <p className="form-resumo-titulo">
        <strong>Confira {lista.length === 1 ? "este campo" : `estes ${lista.length} campos`}</strong>{" "}
        antes de publicar:
      </p>
      <ul className="form-resumo-lista">
        {lista.map((e) => (
          <li key={e.campo}>
            <a href={`#${e.campo === "foto_url" ? "foto_animal" : e.campo}`}>
              {ROTULOS[e.campo]}: <span className="form-resumo-msg">{e.msg}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Tela de sucesso pós-cadastro — substitui o form até o usuário escolher
 * próximo passo. Dá conclusão emocional ("Luna já está visível") e oferece
 * três caminhos claros: cadastrar mais, ver os próprios animais ou ir
 * direto pra página pública.
 */
function SucessoCadastro({ nome, aoCadastrarOutro }) {
  return (
    <section className="cadastro" aria-labelledby="sucesso-title">
      <div className="cadastro-sucesso">
        <FaCircleCheck className="cadastro-sucesso-icone" aria-hidden="true" />
        <p className="page-eyebrow">Cadastro publicado</p>
        <h1 id="sucesso-title">
          {nome ? <>{nome} já está visível!</> : <>Cadastro publicado!</>}
        </h1>
        <p className="cadastro-sucesso-texto">
          O anúncio acabou de entrar na página de adoção. Quer cadastrar mais
          algum bichinho ou acompanhar quem você já publicou?
        </p>
        <div className="cadastro-sucesso-acoes">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={aoCadastrarOutro}
          >
            Cadastrar outro animal
          </button>
          <Link to="/minha-area/animais" className="btn btn--secondary btn--lg">
            Ver meus animais
          </Link>
          <Link to="/adotar" className="btn btn--ghost btn--lg">
            Ir para adoção
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────── BLOQUEIO ONG ─────────── */
const schemaOng = z.object({
  nome_fantasia: z.string().trim().min(2, "Informe o nome da ONG").max(140),
  cidade: z.string().trim().max(80).optional().or(z.literal("")),
  estado: z.string().trim().max(2).optional().or(z.literal("")),
  descricao: z.string().trim().max(2000).optional().or(z.literal("")),
});

function BloqueioOng({ aoCriarOng }) {
  const [erroGeral, setErroGeral] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schemaOng),
    defaultValues: { nome_fantasia: "", cidade: "", estado: "", descricao: "" },
    mode: "onBlur",
  });

  const descOngValue = watch("descricao") ?? "";

  async function onSubmit(valores) {
    setErroGeral(null);
    const payload = {
      nome_fantasia: valores.nome_fantasia,
      ...(valores.cidade ? { cidade: valores.cidade } : {}),
      ...(valores.estado ? { estado: valores.estado.toUpperCase() } : {}),
      ...(valores.descricao ? { descricao: valores.descricao } : {}),
    };
    try {
      await ongsApi.criar(payload);
      await aoCriarOng?.();
    } catch (e) {
      const aplicou = aplicarErrosRHF(e, setError, ["nome_fantasia", "cidade", "estado", "descricao"]);
      if (!aplicou) setErroGeral(mensagemDoErro(e));
    }
  }

  return (
    <section className="cadastro" aria-labelledby="bloqueio-title">
      <PageHeader
        trilha={[
          { label: "Minha área", para: "/minha-area" },
          { label: "Cadastrar ONG" },
        ]}
        titulo="Apenas ONGs podem cadastrar animais"
        tituloId="bloqueio-title"
        descricao="Cadastre sua ONG abaixo. Você poderá publicar animais para adoção assim que concluir este passo."
      />

      {erroGeral && <Banner tipo="erro" mensagem={erroGeral} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="cadastro-form">
        <Campo
          label="Nome da ONG"
          id="nome_fantasia"
          obrigatorio
          error={errors.nome_fantasia}
          placeholder="Ex.: Lar dos Gatinhos"
          {...register("nome_fantasia")}
        />

        <div className="row-cidade-uf">
          <Campo
            label="Cidade"
            id="cidade"
            opcional
            placeholder="Manaus"
            autoComplete="address-level2"
            {...register("cidade")}
          />
          <Campo
            label="UF"
            id="estado"
            opcional
            maxLength={2}
            placeholder="AM"
            autoComplete="address-level1"
            {...comMascara(register("estado"), mascaraUF)}
          />
        </div>

        <CampoTextarea
          label="Descrição"
          id="descricao_ong"
          opcional
          rows={4}
          valor={descOngValue}
          max={2000}
          placeholder="Conte um pouco sobre a missão da ONG."
          {...register("descricao")}
        />

        <div className="cadastro-actions">
          <Link to="/" className="btn btn--ghost btn--lg">Cancelar</Link>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="btn btn--primary btn--lg"
          >
            {isSubmitting ? "Criando…" : "Criar ONG e continuar"}
          </button>
        </div>
      </form>
    </section>
  );
}
