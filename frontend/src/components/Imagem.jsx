import { memo, useState } from "react";

import { derivarVariantes, montarSrcSet } from "../services/variantesImagem";
import "./Imagem.css";

/**
 * <Imagem /> — wrapper responsivo de <img>.
 *
 * Por que existe:
 *   • Centraliza srcset/sizes/aspect-ratio em um único lugar.
 *   • Garante CLS=0 reservando o espaço via aspect-ratio + width/height.
 *   • Aplica defaults seguros (decoding=async, lazy por padrão).
 *   • Renderiza um placeholder previsível quando não há imagem ou quando
 *     ocorre erro de carregamento — sem layout shift.
 *
 * Props:
 *   • src            — URL única OU objeto `imagens` (do backend).
 *   • imagens        — objeto { original, otimizado, card, thumb } opcional.
 *                      Quando ausente, derivamos a partir de `src`.
 *   • alt            — obrigatório quando a imagem é informativa.
 *   • sizes          — string `sizes` para casar com srcset (default sensato).
 *   • largura/altura — usados para `width`/`height` e proporção da caixa.
 *   • aspect         — string `aspect-ratio` CSS (ex: "4 / 3"). Sobrepõe
 *                      a derivada de largura/altura quando preciso.
 *   • carregamento   — "lazy" (default) | "eager".
 *   • prioridade     — "alta" para LCP (define fetchpriority=high + eager).
 *   • placeholder    — letra/caracter exibido quando não há imagem.
 *   • forma          — "padrao" (default) | "redonda" (avatar).
 *   • className      — classes adicionais para a caixa externa.
 */
function ImagemBase({
  src,
  imagens,
  alt = "",
  sizes,
  largura,
  altura,
  aspect,
  carregamento = "lazy",
  prioridade = false,
  placeholder,
  forma = "padrao",
  className = "",
}) {
  const mapa = imagens || derivarVariantes(src);
  const principal = mapa?.otimizado || mapa?.card || mapa?.thumb || src || null;
  const srcset = montarSrcSet(mapa);
  const [falhou, setFalhou] = useState(false);

  const estiloCaixa = {};
  if (aspect) estiloCaixa.aspectRatio = aspect;
  else if (largura && altura) estiloCaixa.aspectRatio = `${largura} / ${altura}`;

  const classes = [
    "imagem",
    `imagem--${forma}`,
    !principal || falhou ? "imagem--vazia" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!principal || falhou) {
    return (
      <div
        className={classes}
        style={estiloCaixa}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <span className="imagem-placeholder" aria-hidden="true">
          {placeholder ?? "🐾"}
        </span>
      </div>
    );
  }

  // `sizes` padrão razoável para grids de cards: 1 col mobile, 2 col tablet,
  // 3 col desktop em containers ~1200px. Quem precisa de hero customiza.
  const sizesFinal =
    sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  return (
    <div className={classes} style={estiloCaixa}>
      <img
        src={principal}
        srcSet={srcset}
        sizes={srcset ? sizesFinal : undefined}
        alt={alt}
        width={largura || undefined}
        height={altura || undefined}
        loading={prioridade ? "eager" : carregamento}
        decoding="async"
        fetchPriority={prioridade ? "high" : undefined}
        onError={() => setFalhou(true)}
        draggable={false}
      />
    </div>
  );
}

/**
 * Memoizado porque é renderizado em listas grandes (grids de animais).
 * Comparação rasa cobre os casos comuns: a URL muda, o componente atualiza.
 */
const Imagem = memo(ImagemBase);
export default Imagem;
