import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import PageHeader from "../components/PageHeader";
import "../css/dashboardstyle.css";

function primeiroNome(nome) {
  return nome?.trim().split(/\s+/)[0] ?? "";
}

export default function MinhaArea() {
  const { usuario } = useAuth();
  const ehOng = usuario?.papel === "ong" || usuario?.papel === "admin";

  const atalhos = [
    !ehOng && {
      to: "/minha-area/solicitacoes",
      emoji: "🐾",
      titulo: "Minhas solicitações",
      texto: "Acompanhe as adoções que você pediu.",
    },
    ehOng && {
      to: "/minha-area/animais",
      emoji: "🦴",
      titulo: "Meus animais",
      texto: "Veja, edite ou marque como adotados os animais cadastrados.",
    },
    ehOng && {
      to: "/minha-area/recebidas",
      emoji: "💌",
      titulo: "Solicitações recebidas",
      texto: "Aprove, recuse ou conclua adoções dos seus animais.",
    },
    ehOng && {
      to: "/cadastro",
      emoji: "➕",
      titulo: "Cadastrar animal",
      texto: "Publique um novo animal para adoção.",
    },
    {
      to: "/perfil",
      emoji: "👤",
      titulo: "Meu perfil",
      texto: "Atualize seus dados ou exclua sua conta.",
    },
    {
      to: "/adotar",
      emoji: "🐶",
      titulo: "Explorar animais",
      texto: "Encontre seu próximo melhor amigo.",
    },
  ].filter(Boolean);

  return (
    <section className="dash" aria-labelledby="minha-area-title">
      <PageHeader
        titulo={`Oi, ${primeiroNome(usuario?.nome) || "tutor"} 👋`}
        tituloId="minha-area-title"
        descricao={
          ehOng
            ? "Gerencie os animais cadastrados, responda às solicitações e mantenha seus dados em dia."
            : "Acompanhe suas solicitações, edite seu perfil e descubra animais à espera de um lar."
        }
      />

      <ul className="dash-shortcuts">
        {atalhos.map((a) => (
          <li key={a.to}>
            <Link to={a.to} className="dash-shortcut">
              <span className="dash-shortcut-emoji" aria-hidden="true">{a.emoji}</span>
              <h2>{a.titulo}</h2>
              <p>{a.texto}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
