import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";
import * as animaisApi from "../services/animaisApi";
import { mensagemDoErro } from "../services/erros";
import Banner from "../components/Banner";
import SkeletonCards from "../components/SkeletonCards";
import ConfirmDialog from "../components/ConfirmDialog";
import Imagem from "../components/Imagem";
import PageHeader from "../components/PageHeader";
import "../css/dashboardstyle.css";

function rotulaEspecie(e) {
  return ({ cachorro: "Cachorro", gato: "Gato", outro: "Outro" })[e] || e;
}

export default function MeusAnimais() {
  const { usuario } = useAuth();
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [acao, setAcao] = useState({ tipo: null, animal: null });
  const [aviso, setAviso] = useState(null);

  const recarregar = useCallback(async () => {
    if (!usuario) return;
    setErro(null);
    try {
      const lista = await animaisApi.listarMeus(usuario.id);
      setAnimais(lista);
    } catch (e) {
      setErro(mensagemDoErro(e, "Não foi possível carregar seus animais."));
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
  }, [recarregar]);

  async function marcarAdotado(animal) {
    setAviso(null);
    try {
      await animaisApi.atualizar(animal.id, { disponivel: false });
      setAviso({ tipo: "sucesso", texto: `${animal.nome} foi marcado como adotado.` });
      await recarregar();
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDoErro(e) });
    }
  }

  async function reabrirParaAdocao(animal) {
    setAviso(null);
    try {
      await animaisApi.atualizar(animal.id, { disponivel: true });
      setAviso({ tipo: "sucesso", texto: `${animal.nome} voltou a estar disponível.` });
      await recarregar();
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDoErro(e) });
    }
  }

  async function confirmarExclusao() {
    if (!acao.animal) return;
    try {
      await animaisApi.remover(acao.animal.id);
      setAviso({ tipo: "sucesso", texto: `${acao.animal.nome} foi removido.` });
      setAcao({ tipo: null, animal: null });
      await recarregar();
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDoErro(e) });
      setAcao({ tipo: null, animal: null });
    }
  }

  return (
    <section className="dash" aria-labelledby="meus-animais-title">
      <PageHeader
        trilha={[
          { label: "Minha área", para: "/minha-area" },
          { label: "Meus animais" },
        ]}
        titulo="Meus animais"
        tituloId="meus-animais-title"
        descricao="Edite informações, marque adotados ou remova publicações."
        acoes={
          <Link to="/cadastro" className="btn btn--primary">
            Cadastrar animal
          </Link>
        }
      />

      {aviso && (
        <Banner tipo={aviso.tipo === "sucesso" ? "sucesso" : "erro"} mensagem={aviso.texto} />
      )}

      {carregando && <SkeletonCards quantidade={4} />}
      {!carregando && erro && <Banner tipo="erro" titulo="Falha ao carregar" mensagem={erro} />}
      {!carregando && !erro && animais.length === 0 && (
        <div className="dash-empty" role="status">
          <p className="dash-empty-emoji" aria-hidden="true">🐾</p>
          <h3>Você ainda não cadastrou animais.</h3>
          <p>Comece publicando o primeiro — leva poucos minutos.</p>
          <p style={{ marginTop: "var(--space-4)" }}>
            <Link to="/cadastro" className="btn btn--primary">Cadastrar animal</Link>
          </p>
        </div>
      )}

      {!carregando && !erro && animais.length > 0 && (
        <ul className="dash-list">
          {animais.map((animal) => (
            <li key={animal.id} className="dash-item">
              <div className="dash-item-head">
                <Imagem
                  imagens={animal.imagens}
                  src={animal.foto_url}
                  alt={`Foto de ${animal.nome}`}
                  largura={64}
                  altura={64}
                  aspect="1 / 1"
                  sizes="64px"
                  className="dash-item-thumb"
                  placeholder={animal.nome.charAt(0).toUpperCase()}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="dash-item-title">{animal.nome}</h2>
                  <p className="dash-item-meta">
                    {rotulaEspecie(animal.especie)}
                    {animal.raca ? ` · ${animal.raca}` : ""}
                  </p>
                  <p className="dash-item-meta">
                    {animal.disponivel ? (
                      <span className="status status--aprovada">Disponível</span>
                    ) : (
                      <span className="status status--concluida">Adotado</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="dash-item-actions">
                <Link to={`/animais/${animal.id}`} className="btn btn--ghost">Ver página</Link>
                {animal.disponivel ? (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => marcarAdotado(animal)}
                  >
                    Marcar adotado
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => reabrirParaAdocao(animal)}
                  >
                    Reabrir
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setAcao({ tipo: "excluir", animal })}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        aberto={acao.tipo === "excluir"}
        titulo={acao.animal ? `Excluir "${acao.animal.nome}"?` : "Excluir animal?"}
        mensagem="A publicação será removida e não aparecerá mais nas buscas. Esta ação não pode ser desfeita pelo painel."
        rotuloConfirmar="Excluir definitivamente"
        perigo
        aoConfirmar={confirmarExclusao}
        aoFechar={() => setAcao({ tipo: null, animal: null })}
      />
    </section>
  );
}
