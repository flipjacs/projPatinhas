import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  { id: "cancelada", label: "Canceladas", valor: "cancelada" },
];

function formatarData(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function MinhasSolicitacoes() {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [aCancelar, setACancelar] = useState(null);

  const recarregar = useCallback(async (filtroId) => {
    const status = FILTROS.find((f) => f.id === filtroId)?.valor;
    setErro(null);
    try {
      const res = await adocoesApi.minhas({
        pagina: 1,
        limite: 50,
        ...(status ? { status } : {}),
      });
      setItens(res.dados);
    } catch (e) {
      setErro(mensagemDoErro(e, "Não foi possível carregar suas solicitações."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregando(true);
    recarregar(filtro);
  }, [filtro, recarregar]);

  async function confirmarCancelamento() {
    if (!aCancelar) return;
    setAviso(null);
    try {
      await adocoesApi.decidir(aCancelar.id, { status: "cancelada" });
      setAviso({ tipo: "sucesso", texto: "Solicitação cancelada." });
      setACancelar(null);
      await recarregar(filtro);
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDoErro(e) });
      setACancelar(null);
    }
  }

  return (
    <section className="dash" aria-labelledby="solicitacoes-title">
      <PageHeader
        trilha={[
          { label: "Minha área", para: "/minha-area" },
          { label: "Minhas solicitações" },
        ]}
        titulo="Minhas solicitações"
        tituloId="solicitacoes-title"
        descricao="Acompanhe o status das adoções que você pediu."
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
          <p className="dash-empty-emoji" aria-hidden="true">📭</p>
          <h3>Nenhuma solicitação por aqui.</h3>
          <p>Quando você pedir uma adoção, ela aparece aqui com o status atualizado.</p>
          <p style={{ marginTop: "var(--space-4)" }}>
            <Link to="/adotar" className="btn btn--primary">Explorar animais</Link>
          </p>
        </div>
      )}

      {!carregando && !erro && itens.length > 0 && (
        <ul className="dash-list">
          {itens.map((a) => {
            const podeCancelar = a.status === "pendente" || a.status === "aprovada";
            return (
              <li key={a.id} className="dash-item">
                <div className="dash-item-head">
                  {a.animal_foto ? (
                    <img
                      src={a.animal_foto}
                      alt={`Foto de ${a.animal_nome}`}
                      className="dash-item-thumb"
                      width={64}
                      height={64}
                      loading="lazy"
                    />
                  ) : (
                    <div className="dash-item-thumb dash-item-thumb--placeholder" aria-hidden="true">
                      {a.animal_nome?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 className="dash-item-title">{a.animal_nome}</h2>
                    <p className="dash-item-meta">Enviada em {formatarData(a.criado_em)}</p>
                    <p className="dash-item-meta">
                      <span className={`status status--${a.status}`}>{a.status}</span>
                    </p>
                  </div>
                </div>

                {a.mensagem && <p className="dash-item-msg"><strong>Sua mensagem:</strong> {a.mensagem}</p>}
                {a.resposta && (
                  <p className="dash-item-msg"><strong>Resposta da ONG:</strong> {a.resposta}</p>
                )}

                <div className="dash-item-actions">
                  <Link to={`/animais/${a.animal_id}`} className="btn btn--ghost">Ver animal</Link>
                  {podeCancelar && (
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={() => setACancelar(a)}
                    >
                      Cancelar solicitação
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        aberto={!!aCancelar}
        titulo="Cancelar solicitação?"
        mensagem={aCancelar
          ? `Você cancelará seu pedido de adoção para ${aCancelar.animal_nome}. Esta ação não pode ser desfeita.`
          : ""}
        rotuloConfirmar="Cancelar solicitação"
        perigo
        aoConfirmar={confirmarCancelamento}
        aoFechar={() => setACancelar(null)}
      />
    </section>
  );
}
