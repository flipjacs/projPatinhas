import { Link } from "react-router-dom";
import "../css/homestyle.css";

function Home() {
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

      {/* HERO */}
      <section className="hero-banner" id="home">

        <div className="hero-left">

          <span className="hero-mini">
            Adote com amor 🐾
          </span>

          <h1>
            Encontre um novo
            <span> melhor amigo</span>
          </h1>

          <p>
            Adote com amor e transforme vidas.
            Conheça cães e gatos esperando por um lar cheio de carinho.
          </p>

          <Link to="/adotar">
            <button className="hero-btn">
              Quero Adotar
            </button>
          </Link>

        </div>

        <div className="hero-right">

          <img
            src="https://cdn.discordapp.com/attachments/1334734976477827083/1505689113263734875/image.png"
            alt="Pessoa com cachorro"
          />

        </div>

      </section>

      {/* SOBRE */}
      <section className="sobre-adocao">

        <h2>Conheça o Projeto Patinhas</h2>

        <p>
          Nosso projeto conecta animais resgatados com famílias amorosas.
          Trabalhamos junto de ONGs e protetores independentes para encontrar
          lares seguros e cheios de carinho para cães e gatos.
        </p>

      </section>

      {/* IMPACTO */}
      <section className="impacto">

        <div className="impacto-overlay">

          <p className="impacto-mini">
            ESPALHANDO AMOR, CUIDADO E NOVOS COMEÇOS
            PARA ANIMAIS RESGATADOS.
          </p>

          <h2>
            Toda ajuda conta e faz muita diferença.
          </h2>

          <div className="impacto-grid">

            <div className="impacto-item">
              <h3>+ 1.0mil</h3>
              <p>Animais adotados em 2025</p>
            </div>

            <div className="impacto-item">
              <h3>+ 55</h3>
              <p>Toneladas de ração doadas desde 2019</p>
            </div>

            <div className="impacto-item">
              <h3>+ R$20mil</h3>
              <p>Doações arrecadadas para ONGs parceiras</p>
            </div>

            <div className="impacto-item">
              <h3>+ 16</h3>
              <p>ONGs e protetores cadastrados</p>
            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-container">

          <div className="footer-brand">

            <img
              src="https://www.clipartkey.com/mpngs/m/162-1622703_transparent-pink-cat-clipart-pink-paw-print-png.png"
              alt="Logo"
              className="footer-logo"
            />

            <h2>Projeto Patinhas</h2>

            <p>
              Todos os direitos reservados © 2026
            </p>

          </div>

          <div className="footer-column">

            <h3>Políticas</h3>

            <a href="#">
              Termos e Condições
            </a>

            <a href="#">
              Política de Privacidade
            </a>

          </div>

          <div className="footer-column">

            <h3>Sobre nós</h3>

            <Link to="/ongs">
              ONGs
            </Link>

            <a href="#">
              Contato
            </a>

          </div>

          <div className="footer-column">

            <h3>Suporte</h3>

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

export default Home;