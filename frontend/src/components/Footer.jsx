import { Link } from "react-router-dom";
import { FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa6";
import "./Footer.css";

const SOCIALS = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/",
    Icon: FaInstagram,
    external: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/5592999999999",
    Icon: FaWhatsapp,
    external: true,
  },
  {
    id: "email",
    label: "Enviar email",
    href: "mailto:contato@projetopatinhas.com",
    Icon: FaEnvelope,
    external: false,
  },
];

function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo" aria-hidden="true">
            🐾
          </span>
          <h2>Projeto Patinhas</h2>
          <p>Todos os direitos reservados © {ano}</p>
        </div>

        <nav className="footer-column" aria-label="Políticas">
          <h3>Políticas</h3>
          <a href="/termos">Termos e Condições</a>
          <a href="/privacidade">Política de Privacidade</a>
        </nav>

        <nav className="footer-column" aria-label="Sobre nós">
          <h3>Sobre nós</h3>
          <Link to="/ongs">ONGs parceiras</Link>
          <a href="mailto:contato@projetopatinhas.com">Contato</a>
        </nav>

        <div className="footer-column">
          <h3>Suporte</h3>
          <a href="mailto:suporte@patinhas.com">suporte@patinhas.com</a>
          <a href="tel:+5592984736152">(92) 98473-6152</a>

          <ul className="footer-socials" aria-label="Redes sociais">
            {SOCIALS.map(({ id, label, href, Icon, external }) => (
              <li key={id}>
                <a
                  href={href}
                  aria-label={label}
                  className="footer-social"
                  {...(external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  <Icon aria-hidden="true" focusable="false" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
