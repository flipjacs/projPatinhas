import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <section className="not-found" aria-labelledby="nf-title">
      <p className="not-found-code" aria-hidden="true">
        404
      </p>
      <h1 id="nf-title">Página não encontrada</h1>
      <p>
        A página que você procura pode ter sido movida ou nunca existiu. Vamos te
        levar para um lugar conhecido.
      </p>

      <div className="not-found-actions">
        <Link to="/" className="btn btn--primary">
          Voltar ao início
        </Link>
        <Link to="/adotar" className="btn btn--ghost">
          Ver animais para adoção
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
