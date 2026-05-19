import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🐾 Projeto Patinhas</div>

      <div className="menu">
        <Link to="/">Home</Link>
        <Link to="/cadastro">Cadastrar</Link>
        <Link to="/meus-animais">Meus Animais</Link>
      </div>
    </nav>
  );
}

export default Navbar;