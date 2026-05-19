import { Link } from "react-router-dom";
import "../css/ongsstyle.css";

function Ongs() {
  return (
    
    <>
  {/* NAVBAR */}
  <nav className="navbar">

    <div className="logo-area">

      <img
        src="https://www.clipartkey.com/mpngs/m/162-1622703_transparent-pink-cat-clipart-pink-paw-print-png.png"
        alt="Logo"
        className="logo"
      />

      <span className="logo-text">
        Projeto Patinhas
      </span>

    </div>

    <div className="menu">

      <Link to="/">
        Início
      </Link>

      <Link to="/adotar">
        Adotar Animal
      </Link>

      <Link to="/cadastro">
        Cadastro
      </Link>

      <Link to="/ongs">
        ONGs
      </Link>

    </div>

  </nav>

  {/* HEADER */}
  <header>

    <h1 className="titulo-ong">
      🏠 ONGs de Adoção Animal
    </h1>

    <p>
      Ajude cães e gatos a encontrarem um lar cheio de amor.
    </p>

  </header>

      {/* ONGS */}
      <section className="ongs-container">

        {/* ONG 1 */}
        <div className="card">

          <img
            src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1000"
            alt="Cachorro"
          />

          <h2>
            Amigos de Patas
          </h2>

          <p>
            ONG dedicada ao resgate e adoção de cães abandonados.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <button>
              Saiba Mais
            </button>
          </a>

        </div>

        {/* ONG 2 */}
        <div className="card">

          <img
            src="https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=1000"
            alt="Gato"
          />

          <h2>
            Lar dos Gatinhos
          </h2>

          <p>
            Proteção e cuidados especiais para gatos resgatados.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <button>
              Saiba Mais
            </button>
          </a>

        </div>

        {/* ONG 3 */}
        <div className="card">

          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1000"
            alt="Pets"
          />

          <h2>
            Patinhas Felizes
          </h2>

          <p>
            Ajudando animais a encontrarem famílias amorosas.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <button>
              Saiba Mais
            </button>
          </a>

        </div>

        {/* ONG 4 */}
        <div className="card">

          <img
            src="https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=1000"
            alt="Cachorro Feliz"
          />

          <h2>
            Anjos de 4 Patas
          </h2>

          <p>
            ONG especializada em resgatar animais vítimas
            de maus-tratos e encontrar novos lares.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <button>
              Saiba Mais
            </button>
          </a>

        </div>

        {/* ONG 5 */}
        <div className="card">

          <img
            src="https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=1000"
            alt="Gato Fofo"
          />

          <h2>
            Casa dos Bichinhos
          </h2>

          <p>
            Projeto voluntário que oferece abrigo,
            alimentação e muito carinho para pets abandonados.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <button>
              Saiba Mais
            </button>
          </a>

        </div>

        {/* ONG 6 */}
        <div className="card">

          <img
            src="https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=1000"
            alt="Cachorro"
          />

          <h2>
            Patas Unidas
          </h2>

          <p>
            ONG focada em campanhas de adoção e cuidados veterinários
            para animais resgatados.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <button>
              Saiba Mais
            </button>
          </a>

        </div>

        {/* ONG 7 */}
        <div className="card">

          <img
            src="https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=1000"
            alt="Gato"
          />

          <h2>
            Mundo Animal
          </h2>

          <p>
            Projeto social que acolhe cães e gatos abandonados
            até encontrarem uma família.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <button>
              Saiba Mais
            </button>
          </a>

        </div>

        {/* ONG 8 */}
        <div className="card">

          <img
            src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1000"
            alt="Pets"
          />

          <h2>
            Vida de Patinha
          </h2>

          <p>
            ONG que promove feiras de adoção e arrecadações
            para ajudar animais em situação de risco.
          </p>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <button>
              Saiba Mais
            </button>
          </a>

        </div>

      </section>

    </>
  );
}

export default Ongs;