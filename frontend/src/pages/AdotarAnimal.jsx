import { memo, useCallback, useEffect, useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as animaisApi from "../services/animaisApi";
import * as adocoesApi from "../services/adocoesApi";
import { useAuth } from "../contexts/useAuth";
import { mensagemDoErro } from "../services/erros";
import Banner from "../components/Banner";
import Modal from "../components/Modal";
import SkeletonCards from "../components/SkeletonCards";
import Imagem from "../components/Imagem";
import "../css/adotaranimalstyle.css";

const FILTROS = [
  { id: "todos", label: "Todos", valor: undefined },
  { id: "cachorro", label: "Cachorros", valor: "cachorro" },
  { id: "gato", label: "Gatos", valor: "gato" },
];

function rotulaIdade(animal) {
  const a = animal.idade_anos;
  const m = animal.idade_meses;
  if (a != null && a > 0) return `${a} ${a === 1 ? "ano" : "anos"}`;
  if (m != null && m > 0) return `${m} ${m === 1 ? "mês" : "meses"}`;
  return "Idade não informada";
}

function rotulaEspecie(e) {
  return ({ cachorro: "Cachorro", gato: "Gato", outro: "Outro" })[e] || e;
}

function rotulaPorte(p) {
  return ({ pequeno: "Pequeno", medio: "Médio", grande: "Grande" })[p] || "";
}

export default function AdotarAnimal() {
  const [selecionado, setSelecionado] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const [animais, setAnimais] = useState([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const fecharModal = useCallback(() => setSelecionado(null), []);

  useEffect(() => {
    let ativo = true;
    // Iniciar loading aqui é sincronização legítima de UI com a rede.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregando(true);
    setErro(null);
    const filtroAtual = FILTROS.find((f) => f.id === filtro);
    animaisApi
      .listarDisponiveis({
        pagina: 1,
        limite: 30,
        ...(filtroAtual?.valor ? { especie: filtroAtual.valor } : {}),
      })
      .then((res) => {
        if (!ativo) return;
        setAnimais(res.dados);
        setTotal(res.meta?.total ?? res.dados.length);
      })
      .catch((e) => {
        if (!ativo) return;
        setErro(mensagemDoErro(e, "Não foi possível carregar os animais."));
        setAnimais([]);
        setTotal(0);
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [filtro]);

  const conteudo = (() => {
    if (carregando) return <SkeletonCards quantidade={6} />;
    if (erro) return <Banner tipo="erro" titulo="Falha ao carregar" mensagem={erro} />;
    if (animais.length === 0) {
      return (
        <div className="empty-state" role="status">
          <p className="empty-state-emoji" aria-hidden="true">🐾</p>
          <h2>Nenhum animal nesta categoria.</h2>
          <p>Tente outra espécie ou volte mais tarde — recebemos novos amigos toda semana.</p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setFiltro("todos")}
          >
            Ver todos
          </button>
        </div>
      );
    }
    return (
      <ul className="cards" aria-label="Animais disponíveis para adoção">
        {animais.map((animal, indice) => (
          <CardAnimal
            key={animal.id}
            animal={animal}
            prioridade={indice < 3}
            aoAbrirModal={setSelecionado}
          />
        ))}
      </ul>
    );
  })();

  return (
    <>
      <div className="container">
        <header className="top-area">
          <div className="top-area-text">
            <p className="page-eyebrow">Disponíveis para adoção</p>
            <h1>Encontre seu novo melhor amigo</h1>
            <p className="top-area-meta" aria-live="polite">
              {carregando
                ? "Carregando…"
                : `${total} ${total === 1 ? "animal" : "animais"} aguardando um lar.`}
            </p>
          </div>
          <Link to="/cadastro" className="btn btn--secondary">
            Cadastrar animal
          </Link>
        </header>

        <div className="filters" role="group" aria-label="Filtrar por espécie">
          {FILTROS.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              aria-pressed={filtro === opcao.id}
              className={filtro === opcao.id ? "filter-chip filter-chip--active" : "filter-chip"}
              onClick={() => setFiltro(opcao.id)}
            >
              {opcao.label}
            </button>
          ))}
        </div>

        {conteudo}
      </div>

      <AnimalModal animal={selecionado} aberto={!!selecionado} aoFechar={fecharModal} />
    </>
  );
}

/**
 * Card memoizado para a grade de animais. A grade pode ter 30+ itens, então
 * evitamos re-renderizar todos quando apenas o filtro/modal mudam acima.
 * `content-visibility` (no CSS) pula a renderização de cards offscreen.
 */
const CardAnimal = memo(function CardAnimal({ animal, prioridade, aoAbrirModal }) {
  return (
    <li className="card">
      <div className="card-media">
        <Imagem
          imagens={animal.imagens}
          src={animal.foto_url}
          alt={`Foto de ${animal.nome}`}
          largura={600}
          altura={450}
          aspect="4 / 3"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          carregamento={prioridade ? "eager" : "lazy"}
          prioridade={prioridade}
          placeholder={animal.nome.charAt(0).toUpperCase()}
        />
        <span className={`card-species card-species--${animal.especie}`}>
          {rotulaEspecie(animal.especie)}
        </span>
      </div>
      <div className="card-content">
        <h2>{animal.nome}</h2>
        <p className="card-meta">
          {[animal.raca, rotulaIdade(animal), rotulaPorte(animal.porte)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="card-desc">{animal.descricao}</p>
        <div className="card-actions">
          <button
            type="button"
            className="btn btn--primary btn--block btn-detalhes"
            onClick={() => aoAbrirModal(animal)}
          >
            Conhecer {animal.nome}
          </button>
          <Link
            to={`/animais/${animal.id}`}
            className="btn btn--ghost btn--block"
            aria-label={`Abrir página de ${animal.nome}`}
          >
            Página completa
          </Link>
        </div>
      </div>
    </li>
  );
});

function AnimalModal({ animal, aberto, aoFechar }) {
  const tituloId = useId();
  const navigate = useNavigate();
  const { autenticado, usuario } = useAuth();

  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null); // { tipo, texto }

  // Reseta o estado do form de adoção quando o modal abre/fecha — sincronização
  // legítima com o estado externo `aberto`.
  useEffect(() => {
    if (!aberto) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMensagem("");
      setResultado(null);
      setEnviando(false);
    }
  }, [aberto]);

  if (!animal) return null;
  const ehDono = usuario && Number(usuario.id) === Number(animal.usuario_id);

  async function aoSolicitar() {
    setResultado(null);
    if (!autenticado) {
      navigate("/login", {
        replace: false,
        state: { retornarPara: "/adotar" },
      });
      return;
    }
    if (mensagem.trim().length < 10) {
      setResultado({
        tipo: "erro",
        texto: "Conte um pouco sobre você (mínimo 10 caracteres).",
      });
      return;
    }
    setEnviando(true);
    try {
      await adocoesApi.criar({
        animal_id: animal.id,
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

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} tituloId={tituloId} tamanho="lg">
      <div className="modal-animal">
        <div className="modal-left">
          <Imagem
            imagens={animal.imagens}
            src={animal.foto_url}
            alt={`${animal.nome}`}
            largura={600}
            altura={600}
            aspect="1 / 1"
            sizes="(max-width: 720px) 100vw, 50vw"
            carregamento="eager"
            prioridade
            placeholder={animal.nome.charAt(0).toUpperCase()}
          />
        </div>

        <div className="modal-right">
          <p className="modal-species">{rotulaEspecie(animal.especie)}</p>
          <h1 id={tituloId}>{animal.nome}</h1>
          <p className="modal-tagline">{animal.descricao}</p>

          <dl className="info-grid">
            <div className="info"><dt>Idade</dt><dd>{rotulaIdade(animal)}</dd></div>
            <div className="info"><dt>Porte</dt><dd>{rotulaPorte(animal.porte)}</dd></div>
            <div className="info"><dt>Espécie</dt><dd>{rotulaEspecie(animal.especie)}</dd></div>
            <div className="info"><dt>Raça</dt><dd>{animal.raca || "SRD"}</dd></div>
            <div className="info"><dt>Castrado</dt><dd>{animal.castrado ? "Sim" : "Não"}</dd></div>
            <div className="info"><dt>Vacinado</dt><dd>{animal.vacinado ? "Sim" : "Não"}</dd></div>
          </dl>

          {ehDono ? (
            <Banner tipo="info" mensagem="Este é um animal que você cadastrou. Acompanhe as solicitações recebidas." />
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
                  <label htmlFor="mensagem-adocao">
                    Mensagem para a ONG <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="mensagem-adocao"
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

              <div className="modal-actions">
                {(!resultado || resultado.tipo === "erro") && (
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
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
                <button type="button" className="btn btn--ghost btn--block" onClick={aoFechar}>
                  {resultado?.tipo === "sucesso" ? "Fechar" : "Continuar navegando"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
