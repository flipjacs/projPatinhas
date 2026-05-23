import { useEffect, useState } from "react";

import * as ongsApi from "../services/ongsApi";
import { mensagemDoErro } from "../services/erros";
import SkeletonCards from "../components/SkeletonCards";
import Banner from "../components/Banner";
import "../css/ongsstyle.css";

function url(prefixo, valor) {
  if (!valor) return null;
  if (/^https?:\/\//i.test(valor)) return valor;
  return prefixo + valor;
}

export default function Ongs() {
  const [ongs, setOngs] = useState([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    ongsApi
      .listar({ pagina: 1, limite: 30 })
      .then((res) => {
        if (!ativo) return;
        setOngs(res.dados);
        setTotal(res.meta?.total ?? res.dados.length);
      })
      .catch((e) => {
        if (!ativo) return;
        setErro(mensagemDoErro(e, "Não foi possível carregar as ONGs."));
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  if (carregando) {
    return (
      <>
        <header className="ongs-header">
          <p className="ongs-eyebrow">ONGs parceiras</p>
          <h1>ONGs que transformam vidas</h1>
          <p>Carregando lista de organizações…</p>
        </header>
        <div className="ongs-skeleton-wrap">
          <SkeletonCards quantidade={6} />
        </div>
      </>
    );
  }

  return (
    <>
      <header className="ongs-header">
        <p className="ongs-eyebrow">
          {total} {total === 1 ? "parceira" : "parceiras"}
        </p>
        <h1>ONGs que transformam vidas</h1>
        <p>Conheça organizações que resgatam, cuidam e encontram lares para cães e gatos.</p>
      </header>

      {erro ? (
        <div className="ongs-skeleton-wrap">
          <Banner tipo="erro" titulo="Falha ao carregar" mensagem={erro} />
        </div>
      ) : ongs.length === 0 ? (
        <div className="ongs-skeleton-wrap">
          <Banner
            tipo="info"
            titulo="Ainda sem ONGs cadastradas"
            mensagem="Em breve listaremos organizações parceiras aqui."
          />
        </div>
      ) : (
        <ul className="ongs-container">
          {ongs.map((ong) => {
            const site = url("https://", ong.site);
            const insta = url("https://instagram.com/", ong.instagram);
            const link = site || insta || null;
            return (
              <li key={ong.id} className="card">
                <h2>{ong.nome_fantasia}</h2>
                {(ong.cidade || ong.estado) && (
                  <p className="ong-localizacao">
                    {[ong.cidade, ong.estado].filter(Boolean).join(" / ")}
                  </p>
                )}
                <p>{ong.descricao || "ONG dedicada à adoção responsável."}</p>
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--secondary btn--block"
                    aria-label={`Saiba mais sobre ${ong.nome_fantasia} (abre em nova aba)`}
                  >
                    Saiba mais <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <span className="btn btn--secondary btn--block btn--disabled" aria-disabled="true">
                    Em breve
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
