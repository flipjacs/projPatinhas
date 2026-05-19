import { Link } from "react-router-dom";
import "../css/cadastrostyle.css";

function Cadastro() {
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

      {/* CADASTRO */}
      <section className="cadastro">

        <h1>
          Cadastro de Animal 🐶🐱
        </h1>

        <div className="upload">

          <h2>
            Comece enviando as fotos do animalzinho 📸
          </h2>

          <p>
            Arraste e solte uma foto aqui ou clique para selecionar
          </p>

        </div>

        <div className="form-grid">

          {/* ESQUERDA */}
          <div className="box">

            <h2>
              Opções obrigatórias
            </h2>

            <h3>Tipo</h3>

            <br />

            <label>
              <input type="checkbox" />
              Cachorro
            </label>

            <br /><br />

            <label>
              <input type="checkbox" />
              Gato
            </label>

            <br /><br /><br />

            <h3>Idade</h3>

            <br />

            <label>
              <input type="checkbox" />
              0 - 2 anos
            </label>

            <br /><br />

            <label>
              <input type="checkbox" />
              3 - 5 anos
            </label>

            <br /><br />

            <label>
              <input type="checkbox" />
              6 - 8 anos
            </label>

          </div>

          {/* DIREITA */}
          <div className="box">

            <h2>
              Descreva o animal ✨
            </h2>

            <textarea placeholder="Descreva o animal o melhor possível..."></textarea>

          </div>

        </div>

        <button className="btn-salvar">
          Salvar cadastro 💖
        </button>

      </section>

      {/* FOOTER */}
      <footer className="footer" id="contato">

        <div className="footer-container">

          {/* LOGO */}
          <div className="footer-brand">

            <img
              src="https://www.clipartkey.com/mpngs/m/162-1622703_transparent-pink-cat-clipart-pink-paw-print-png.png"
              alt="Logo"
              className="footer-logo"
            />

            <h2>
              Projeto Patinhas
            </h2>

            <p>
              Todos os direitos reservados © 2026
            </p>

            <div className="footer-socials">

              <a href="#">
                <i className="fa-brands fa-facebook-f"></i>
              </a>

              <a href="#">
                <i className="fa-brands fa-x-twitter"></i>
              </a>

              <a href="#">
                <i className="fa-brands fa-instagram"></i>
              </a>

              <a href="#">
                <i className="fa-brands fa-tiktok"></i>
              </a>

            </div>

          </div>

          {/* POLÍTICAS */}
          <div className="footer-column">

            <h3>
              Políticas
            </h3>

            <a href="#">
              Termos e Condições
            </a>

            <a href="#">
              Política de Privacidade
            </a>

          </div>

          {/* SOBRE */}
          <div className="footer-column">

            <h3>
              Sobre nós
            </h3>

            <Link to="/ongs">
              ONGs
            </Link>

            <a href="#">
              Contato
            </a>

          </div>

          {/* SUPORTE */}
          <div className="footer-column">

            <h3>
              Suporte
            </h3>

            <a href="#">
              suporte@patinhas.com
            </a>

            <a href="#">
              (92) 98473-6152
            </a>

          </div>

        </div>

      </footer>

    </>
  );
}

export default Cadastro;