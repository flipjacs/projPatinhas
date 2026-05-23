import { useCallback, useEffect, useState } from "react";

import * as adocoesApi from "../services/adocoesApi";
import { mensagemDoErro } from "../services/erros";
import Banner from "../components/Banner";
import SkeletonCards from "../components/SkeletonCards";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import "../css/dashboardstyle.css";

const FILTROS = [
  { id: "todas", label: "Todas", valor: undefined },
  { id: "pendente", label: "Pendentes", valor: "pendente" },
  { id: "aprovada", label: "Aprovadas", valor: "aprovada" },
  { id: "concluida", label: "Concluídas", valor: "concluida" },
  { id: "rejeitada", label: "Recusadas", valor: "rejeitada" },
];

const ROTULO_ACAO = {
  aprovada: "aprovar",
  rejeitada: "recusar",
  concluida: "marcar como concluída",
};

function formatarData(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

/** Quais transições o dono pode fazer a partir de cada status. */
function acoesDisponiveis(status) {
  if (status === "pendente") return ["aprovada", "rejeitada"];
  if (status === "aprovada") return ["concluida"];
  return [];
}

export default function SolicitacoesRecebidas() {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [confirmacao, setConfirmacao] = useState(null);

  const recarregar = useCallback(async (filtroId) => {
    const status = FILTROS.find((f) => f.id === filtroId)?.valor;
    setErro(null);
    try {
      const res = await adocoesApi.recebidas({
        pagina: 1,
        limite: 50,
        ...(status ? { status } : {}),
      });
      setItens(res.dados);
    } catch (e) {
      setErro(mensagemDoErro(e, "Não foi possível carregar as solicitações."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregando(true);
    recarregar(filtro);
  }, [filtro, recarregar]);

  function abrirConfirmacao(adocao, novoStatus) {
    setConfirmacao({ adocao, novoStatus });
  }

  async function confirmarDecisao() {
    if (!confirmacao) return;
    setAviso(null);
    try {
      await adocoesApi.decidir(confirmacao.adocao.id, {
        status: confirmacao.novoStatus,
      });
      setAviso({
        tipo: "sucesso",
        texto: `Solicitação ${ROTULO_ACAO[confirmacao.novoStatus]}da.`,
      });
      setConfirmacao(null);
      await recarregar(filtro);
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDoErro(e) });
      setConfirmacao(null);
    }
  }

  const ehDestrutiva = confirmacao?.novoStatus === "rejeitada";

  return (
    <section className="dash" aria-labelledby="recebidas-title">
      <PageHeader
        trilha={[
          { label: "Minha área", para: "/minha-area" },
          { label: "Solicitações recebidas" },
        ]}
        titulo="Solicitações recebidas"
        tituloId="recebidas-title"
        descricao="Aprove, recuse ou conclua adoções dos seus animais."
      />

      {aviso && (
        <Banner tipo={aviso.tipo === "sucesso" ? "sucesso" : "erro"} mensagem={aviso.texto} />
      )}

      <div className="dash-section-head">
        <div className="dash-filters" role="group" aria-label="Filtrar por status">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="dash-filter"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {carregando && <SkeletonCards quantidade={4} />}
      {!carregando && erro && <Banner tipo="erro" titulo="Falha ao carregar" mensagem={erro} />}
      {!carregando && !erro && itens.length === 0 && (
        <div className="dash-empty" role="status">
          <p className="dash-empty-emoji" aria-hidden="true">💌</p>
          <h3>Nenhuma solicitação por enquanto.</h3>
          <p>Solicitações dos seus animais aparecem aqui assim que chegam.</p>
        </div>
      )}

      {!carregando && !erro && itens.length > 0 && (
        <ul className="dash-list">
          {itens.map((a) => {
            const acoes = acoesDisponiveis(a.status);
            return (
              <li key={a.id} className="dash-item">
                <div className="dash-item-head">
                  <div className="dash-item-thumb dash-item-thumb--placeholder" aria-hidden="true">
                    {a.animal_nome?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 className="dash-item-title">
                      {a.adotante_nome} → {a.animal_nome}
                    </h2>
                    <p className="dash-item-meta">Recebida em {formatarData(a.criado_em)}</p>
                    <p className="dash-item-meta">
                      <span className={`status status--${a.status}`}>{a.status}</span>
                    </p>
                  </div>
                </div>

                <dl className="dash-item-meta" style={{ display: "grid", gap: "var(--space-1)" }}>
                  {a.adotante_email && <div><dt style={{ display: "inline", fontWeight: 600 }}>E-mail:</dt> <dd style={{ display: "inline" }}>{a.adotante_email}</dd></div>}
                  {a.adotante_telefone && <div><dt style={{ display: "inline", fontWeight: 600 }}>Telefone:</dt> <dd style={{ display: "inline" }}>{a.adotante_telefone}</dd></div>}
                  {a.adotante_cidade && <div><dt style={{ display: "inline", fontWeight: 600 }}>Cidade:</dt> <dd style={{ display: "inline" }}>{a.adotante_cidade}</dd></div>}
                </dl>

                {a.mensagem && (
                  <p className="dash-item-msg"><strong>Mensagem:</strong> {a.mensagem}</p>
                )}
                {a.resposta && (
                  <p className="dash-item-msg"><strong>Sua resposta:</strong> {a.resposta}</p>
                )}

                {acoes.length > 0 && (
                  <div className="dash-item-actions">
                    {acoes.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={
                          status === "rejeitada"
                            ? "btn btn--danger"
                            : status === "aprovada"
                              ? "btn btn--primary"
                              : "btn btn--secondary"
                        }
                        onClick={() => abrirConfirmacao(a, status)}
                      >
                        {status === "aprovada" && "Aprovar"}
                        {status === "rejeitada" && "Recusar"}
                        {status === "concluida" && "Concluir adoção"}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        aberto={!!confirmacao}
        titulo={
          confirmacao
            ? `${confirmacao.novoStatus === "aprovada" ? "Aprovar" : confirmacao.novoStatus === "rejeitada" ? "Recusar" : "Concluir"} solicitação?`
            : ""
        }
        mensagem={
          confirmacao
            ? confirmacao.novoStatus === "concluida"
              ? `Marcar como concluída tornará ${confirmacao.adocao.animal_nome} indisponível para novas adoções.`
              : `Você confirmará a decisão para a solicitação de ${confirmacao.adocao.adotante_nome}.`
            : ""
        }
        rotuloConfirmar={
          confirmacao?.novoStatus === "aprovada" ? "Aprovar"
            : confirmacao?.novoStatus === "rejeitada" ? "Recusar"
              : "Concluir"
        }
        perigo={ehDestrutiva}
        aoConfirmar={confirmarDecisao}
        aoFechar={() => setConfirmacao(null)}
      />

    </section>
  );
}
