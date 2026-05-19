import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/adotaranimalstyle.css";

function AdotarAnimal() {

  const [modalAberto, setModalAberto] = useState(false);

  const [animalSelecionado, setAnimalSelecionado] = useState({});

  const abrirModal = (
    nome,
    img,
    idade,
    especie,
    porte,
    peso,
    raca,
    desc
  ) => {

    setAnimalSelecionado({
      nome,
      img,
      idade,
      especie,
      porte,
      peso,
      raca,
      desc,
    });

    setModalAberto(true);

  };

  const fecharModal = () => {
    setModalAberto(false);
  };

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

      {/* CONTEÚDO */}
      <div className="container">

        <div className="top-area">

          <h1>
            Animais para adoção 🐾
          </h1>

          <Link to="/cadastro">

            <button className="btn-cadastrar">
              Cadastrar animal
            </button>

          </Link>

        </div>

        {/* CARDS */}
        <div className="cards">

          {/* LUNA */}
          <div className="card">

            <img
              src="https://placecats.com/500/400"
              alt="Luna"
            />

            <div className="card-content">

              <h2>Luna</h2>

              <div className="tags">

                <div className="tag gato">
                  Gato
                </div>

                <div className="tag roxo">
                  2 Anos
                </div>

                <div className="tag rosa">
                  Pequeno
                </div>

              </div>

              <button
                className="btn-detalhes"
                onClick={() =>
                  abrirModal(
                    "Luna",
                    "https://placecats.com/500/400",
                    "2 Anos",
                    "Gato",
                    "Pequeno",
                    "2kg",
                    "SRD",
                    "Luna é carinhosa e ama colo."
                  )
                }
              >
                Ver Detalhes
              </button>

            </div>

          </div>

          {/* MEL */}
          <div className="card">

            <img
              src="https://placedog.net/500/400?id=5"
              alt="Mel"
            />

            <div className="card-content">

              <h2>Mel</h2>

              <div className="tags">

                <div className="tag cachorro">
                  Cachorro
                </div>

                <div className="tag roxo">
                  3 Meses
                </div>

                <div className="tag rosa">
                  Pequeno
                </div>

              </div>

              <button
                className="btn-detalhes"
                onClick={() =>
                  abrirModal(
                    "Mel",
                    "https://placedog.net/500/400?id=5",
                    "3 Meses",
                    "Cachorro",
                    "Pequeno",
                    "1,5kg",
                    "Husky Siberiano",
                    "Mel é brincalhona e cheia de energia."
                  )
                }
              >
                Ver Detalhes
              </button>

            </div>

          </div>

          {/* NINA */}
          <div className="card">

            <img
              src="https://placecats.com/500/401"
              alt="Nina"
            />

            <div className="card-content">

              <h2>Nina</h2>

              <div className="tags">

                <div className="tag gato">
                  Gato
                </div>

                <div className="tag roxo">
                  1 Ano
                </div>

                <div className="tag rosa">
                  Pequeno
                </div>

              </div>

              <button
                className="btn-detalhes"
                onClick={() =>
                  abrirModal(
                    "Nina",
                    "https://placecats.com/500/401",
                    "1 Ano",
                    "Gato",
                    "Pequeno",
                    "2kg",
                    "SRD",
                    "Nina é calma e muito carinhosa."
                  )
                }
              >
                Ver Detalhes
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* MODAL */}
      {modalAberto && (

        <div className="modal">

          <div className="modal-content">

            <span
              className="fechar"
              onClick={fecharModal}
            >
              ×
            </span>

            <div className="modal-left">

              <img
                src={animalSelecionado.img}
                alt={animalSelecionado.nome}
              />

            </div>

            <div className="modal-right">

              <h1>
                {animalSelecionado.nome}
              </h1>

              <div className="info-grid">

                <div className="info">
                  <h3>Peso</h3>
                  <p>{animalSelecionado.peso}</p>
                </div>

                <div className="info">
                  <h3>Idade</h3>
                  <p>{animalSelecionado.idade}</p>
                </div>

                <div className="info">
                  <h3>Espécie</h3>
                  <p>{animalSelecionado.especie}</p>
                </div>

                <div className="info">
                  <h3>Porte</h3>
                  <p>{animalSelecionado.porte}</p>
                </div>

                <div className="info">
                  <h3>Raça</h3>
                  <p>{animalSelecionado.raca}</p>
                </div>

              </div>

              <div className="descricao">

                <h2>Descrição</h2>

                <p>
                  {animalSelecionado.desc}
                </p>

              </div>

              <button className="btn-adotar">
                Quero Adotar 🐾
              </button>

            </div>

          </div>

        </div>

      )}

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-container">

          <h3>
            Entre em contato 🐾
          </h3>

          <div className="footer-socials">

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
            >
              📸
            </a>

            <a
              href="https://wa.me/5599999999999"
              target="_blank"
              rel="noreferrer"
            >
              💬
            </a>

            <a href="mailto:contato@projetopatinhas.com">
              ✉️
            </a>

          </div>

          <p>
            © 2026 Projeto Patinhas.
            Todos os direitos reservados.
          </p>

        </div>

      </footer>

    </>
  );
}

export default AdotarAnimal;