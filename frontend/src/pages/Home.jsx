import { Link } from "react-router-dom";
import heroImage from "../assets/hero.webp";
import "../css/homestyle.css";

const IMPACT_STATS = [
  { id: "adocoes", valor: "+ 1.000", label: "Animais adotados em 2025" },
  { id: "racao", valor: "+ 55 ton", label: "Toneladas de ração doadas desde 2019" },
  { id: "doacoes", valor: "+ R$ 20 mil", label: "Doações arrecadadas para ONGs parceiras" },
  { id: "ongs", valor: "+ 16", label: "ONGs e protetores cadastrados" },
];

const STEPS = [
  {
    id: "browse",
    number: "1",
    title: "Conheça os animais",
    description: "Navegue pelos perfis de cães e gatos disponíveis em nossas ONGs parceiras.",
  },
  {
    id: "meet",
    number: "2",
    title: "Marque um encontro",
    description: "Converse com a ONG responsável e visite o animal para garantir que combinem.",
  },
  {
    id: "adopt",
    number: "3",
    title: "Adote com responsabilidade",
    description: "Conclua o processo e ofereça um lar seguro para o novo amigo.",
  },
];

function Home() {
  return (
    <>
      <section className="hero-banner" id="home" aria-labelledby="hero-title">
        <div className="hero-left">
          <span className="hero-mini">
            <span className="hero-mini-dot" aria-hidden="true" />
            Adoção responsável
          </span>

          <h1 id="hero-title">
            Encontre um novo <span>melhor amigo</span>
          </h1>

          <p>
            Adote com amor e transforme vidas. Conheça cães e gatos esperando por
            um lar cheio de carinho.
          </p>

          <div className="hero-actions">
            <Link to="/adotar" className="btn btn--primary btn--lg">
              Quero adotar
            </Link>
            <Link to="/ongs" className="btn btn--secondary btn--lg">
              Ver ONGs parceiras
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <img
            src={heroImage}
            alt="Ilustração de animal de estimação"
            width={640}
            height={520}
            fetchpriority="high"
            decoding="async"
          />
        </div>
      </section>

      <section className="steps" aria-labelledby="steps-title">
        <header className="section-head">
          <p className="page-eyebrow">Como funciona</p>
          <h2 id="steps-title">Adotar nunca foi tão simples</h2>
        </header>

        <ol className="steps-grid">
          {STEPS.map((step) => (
            <li key={step.id} className="step-card">
              <span className="step-number" aria-hidden="true">
                {step.number}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sobre-adocao" aria-labelledby="about-title">
        <h2 id="about-title">Conheça o Projeto Patinhas</h2>
        <p>
          Nosso projeto conecta animais resgatados com famílias amorosas. Trabalhamos
          junto de ONGs e protetores independentes para encontrar lares seguros e
          cheios de carinho para cães e gatos.
        </p>
      </section>

      <section className="impacto" aria-labelledby="impact-title">
        <div className="impacto-overlay">
          <p className="impacto-mini">
            Espalhando amor, cuidado e novos começos para animais resgatados.
          </p>
          <h2 id="impact-title">Toda ajuda conta e faz muita diferença.</h2>

          <ul className="impacto-grid">
            {IMPACT_STATS.map((stat) => (
              <li key={stat.id} className="impacto-item">
                <h3>{stat.valor}</h3>
                <p>{stat.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="final-cta-title">
        <div className="final-cta-card">
          <h2 id="final-cta-title">
            Pronto para conhecer seu próximo melhor amigo?
          </h2>
          <p>
            Veja os animais disponíveis ou ajude cadastrando um animal que precisa de
            um lar.
          </p>
          <div className="hero-actions">
            <Link to="/adotar" className="btn btn--primary btn--lg">
              Ver animais para adoção
            </Link>
            <Link to="/cadastro" className="btn btn--secondary btn--lg">
              Cadastrar um animal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
