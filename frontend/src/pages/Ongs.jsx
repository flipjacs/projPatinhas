import "../css/ongsstyle.css";

const ONGS = [
  {
    id: "amigos-de-patas",
    nome: "Amigos de Patas",
    descricao: "ONG dedicada ao resgate e adoção de cães abandonados.",
    img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop",
    link: "https://instagram.com",
  },
  {
    id: "lar-dos-gatinhos",
    nome: "Lar dos Gatinhos",
    descricao: "Proteção e cuidados especiais para gatos resgatados.",
    img: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=800&auto=format&fit=crop",
    link: "https://instagram.com",
  },
  {
    id: "patinhas-felizes",
    nome: "Patinhas Felizes",
    descricao: "Ajudando animais a encontrarem famílias amorosas.",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop",
    link: "https://instagram.com",
  },
  {
    id: "anjos-de-4-patas",
    nome: "Anjos de 4 Patas",
    descricao:
      "Especializada em resgatar animais vítimas de maus-tratos e encontrar novos lares.",
    img: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?q=80&w=800&auto=format&fit=crop",
    link: "https://instagram.com",
  },
  {
    id: "casa-dos-bichinhos",
    nome: "Casa dos Bichinhos",
    descricao:
      "Projeto voluntário que oferece abrigo, alimentação e carinho para pets abandonados.",
    img: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=800&auto=format&fit=crop",
    link: "https://instagram.com",
  },
  {
    id: "patas-unidas",
    nome: "Patas Unidas",
    descricao:
      "Focada em campanhas de adoção e cuidados veterinários para animais resgatados.",
    img: "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=800&auto=format&fit=crop",
    link: "https://instagram.com",
  },
  {
    id: "mundo-animal",
    nome: "Mundo Animal",
    descricao:
      "Acolhe cães e gatos abandonados até encontrarem uma família.",
    img: "https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=800&auto=format&fit=crop",
    link: "https://instagram.com",
  },
  {
    id: "vida-de-patinha",
    nome: "Vida de Patinha",
    descricao:
      "Promove feiras de adoção e arrecadações para ajudar animais em situação de risco.",
    img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop",
    link: "https://instagram.com",
  },
];

function Ongs() {
  return (
    <>
      <header className="ongs-header">
        <p className="ongs-eyebrow">{ONGS.length} parceiras</p>
        <h1>ONGs que transformam vidas</h1>
        <p>
          Conheça organizações que resgatam, cuidam e encontram lares para cães e gatos.
        </p>
      </header>

      <ul className="ongs-container">
        {ONGS.map((ong) => (
          <li key={ong.id} className="card">
            <div className="ong-media">
              <img
                src={ong.img}
                alt={`Foto representativa de ${ong.nome}`}
                width={400}
                height={240}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h2>{ong.nome}</h2>
            <p>{ong.descricao}</p>
            <a
              href={ong.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--secondary btn--block"
              aria-label={`Saiba mais sobre ${ong.nome} (abre em nova aba)`}
            >
              Saiba mais →
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Ongs;
