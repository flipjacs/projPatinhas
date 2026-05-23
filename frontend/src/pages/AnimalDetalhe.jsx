import { useCallback, useEffect, useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import * as animaisApi from "../services/animaisApi";
import * as adocoesApi from "../services/adocoesApi";
import { useAuth } from "../contexts/useAuth";
import { mensagemDoErro } from "../services/erros";
import Banner from "../components/Banner";
import Imagem from "../components/Imagem";
import { BackLink } from "../components/PageHeader";
import "../css/dashboardstyle.css";

function rotulaEspecie(e) {
  return ({ cachorro: "Cachorro", gato: "Gato", outro: "Outro" })[e] || e;
}

function rotulaPorte(p) {
  return ({ pequeno: "Pequeno", medio: "Médio", grande: "Grande" })[p] || "";
}

function rotulaSexo(s) {
  return ({ macho: "Macho", femea: "Fêmea", desconhecido: "Desconhecido" })[s] || s;
}

function rotulaIdade(animal) {
  const a = animal.idade_anos;
  const m = animal.idade_meses;
  if (a != null && a > 0) return `${a} ${a === 1 ? "ano" : "anos"}`;
  if (m != null && m > 0) return `${m} ${m === 1 ? "mês" : "meses"}`;
  return "Idade não informada";
}

export default function AnimalDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { autenticado, usuario } = useAuth();
  const tituloId = useId();

  const [animal, setAnimal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const a = await animaisApi.buscarPorId(id);
      setAnimal(a);
    } catch (e) {
      setErro(mensagemDoErro(e, "Animal não encontrado."));
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregando(true);
    carregar();
  }, [carregar]);

  async function aoSolicitar() {
    setResultado(null);
    if (!autenticado) {
      navigate("/login", {
        state: { retornarPara: `/animais/${id}` },
      });
      return;
    }
    if (mensagem.trim().length < 10) {
      setResultado({ tipo: "erro", texto: "Conte um pouco sobre você (mínimo 10 caracteres)." });
      return;
    }
    setEnviando(true);
    try {
      await adocoesApi.criar({
        animal_id: Number(id),
        mensagem: mensagem.trim(),
      });
      setResultado({
        tipo: "sucesso",
        texto: `Sua solicitação para ${animal.nome} foi enviada! A ONG entrará em contato.`,
      });
      setMensagem("");
    } catch (e) {
      setResultado({ tipo: "erro", texto: mensagemDoErro(e) });
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <section className="dash" aria-busy="true" aria-live="polite">
        <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Carregando…</p>
      </section>
    );
  }

  if (erro || !animal) {
    return (
      <section className="dash">
        <Banner tipo="erro" titulo="Não encontrado" mensagem={erro ?? "Animal não disponível."} />
        <p style={{ marginTop: "var(--space-5)" }}>
          <Link to="/adotar" className="btn btn--primary">Ver animais disponíveis</Link>
        </p>
      </section>
    );
  }

  const ehDono = usuario && Number(usuario.id) === Number(animal.usuario_id);

  return (
    <article className="animal-detail" aria-labelledby={tituloId}>
      <div className="animal-detail-back">
        <BackLink para="/adotar">Voltar para adoção</BackLink>
      </div>

      <div className="animal-detail-media">
        <Imagem
          imagens={animal.imagens}
          src={animal.foto_url}
          alt={`Foto de ${animal.nome}`}
          largura={600}
          altura={600}
          aspect="1 / 1"
          sizes="(max-width: 880px) 92vw, 540px"
          carregamento="eager"
          prioridade
          placeholder={animal.nome.charAt(0).toUpperCase()}
        />
      </div>

      <div className="animal-detail-info">
        <p className="animal-detail-eyebrow">{rotulaEspecie(animal.especie)}</p>
        <h1 id={tituloId}>{animal.nome}</h1>
        <p style={{ color: "var(--color-text-muted)", lineHeight: "var(--lh-loose)" }}>
          {animal.descricao}
        </p>

        <dl className="info-grid">
          <div className="info"><dt>Idade</dt><dd>{rotulaIdade(animal)}</dd></div>
          <div className="info"><dt>Porte</dt><dd>{rotulaPorte(animal.porte)}</dd></div>
          <div className="info"><dt>Sexo</dt><dd>{rotulaSexo(animal.sexo)}</dd></div>
          <div className="info"><dt>Raça</dt><dd>{animal.raca || "SRD"}</dd></div>
          <div className="info"><dt>Castrado</dt><dd>{animal.castrado ? "Sim" : "Não"}</dd></div>
          <div className="info"><dt>Vacinado</dt><dd>{animal.vacinado ? "Sim" : "Não"}</dd></div>
          {animal.dono_cidade && (
            <div className="info"><dt>Cidade</dt><dd>{animal.dono_cidade}</dd></div>
          )}
          {animal.ong_nome && (
            <div className="info"><dt>ONG</dt><dd>{animal.ong_nome}</dd></div>
          )}
        </dl>

        {ehDono ? (
          <Banner
            tipo="info"
            titulo="Este animal é seu"
            mensagem="Acompanhe as solicitações na sua área de ONG."
          />
        ) : !animal.disponivel ? (
          <Banner
            tipo="info"
            titulo="Não disponível"
            mensagem="Este animal já encontrou um lar ou está com adoção em andamento."
          />
        ) : (
          <>
            {resultado && (
              <Banner
                tipo={resultado.tipo === "sucesso" ? "sucesso" : "erro"}
                mensagem={resultado.texto}
              />
            )}

            {(!resultado || resultado.tipo === "erro") && (
              <div className="field">
                <label htmlFor="msg-adocao">
                  Mensagem para a ONG <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="msg-adocao"
                  rows={3}
                  minLength={10}
                  maxLength={2000}
                  placeholder="Conte um pouco sobre você, sua casa e por que quer adotar."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  disabled={enviando}
                />
              </div>
            )}

            <div className="actions">
              {(!resultado || resultado.tipo === "erro") && (
                <button
                  type="button"
                  className="btn btn--primary btn--lg"
                  onClick={aoSolicitar}
                  disabled={enviando}
                  aria-busy={enviando}
                >
                  {enviando
                    ? "Enviando…"
                    : autenticado
                      ? `Quero adotar ${animal.nome}`
                      : "Entrar para solicitar adoção"}
                </button>
              )}
              <Link to="/adotar" className="btn btn--ghost btn--lg">
                Ver outros animais
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
