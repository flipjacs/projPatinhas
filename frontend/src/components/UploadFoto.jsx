import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as uploadsApi from "../services/uploadsApi";
import { mensagemDoErro } from "../services/erros";
import "./UploadFoto.css";

/**
 * Componente único para enviar uma foto ao backend de uploads.
 * Cobre avatar (forma="circulo") e foto de animal/ONG (forma="cartao").
 *
 * Estados internos: 'ocioso' | 'enviando' | 'erro'.
 * Em sucesso o estado volta a 'ocioso' e o pai passa a renderizar `valor`.
 *
 * O componente é controlado: o pai é dono da URL final em `valor`.
 */

const MIMES_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024; // espelha env.UPLOADS_MAX_BYTES no backend
const ACCEPT_INPUT = MIMES_ACEITOS.join(",");

function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validarArquivoLocal(arquivo) {
  if (!arquivo) return "Selecione uma imagem.";
  if (!MIMES_ACEITOS.includes(arquivo.type)) {
    return "Use uma imagem JPG, PNG ou WebP.";
  }
  if (arquivo.size > TAMANHO_MAX_BYTES) {
    return `A imagem tem ${formatarTamanho(arquivo.size)}. O limite é 5 MB.`;
  }
  return null;
}

/**
 * Forward de ref expõe ao react-hook-form um alvo `.focus()` — quando a
 * validação falha (foto obrigatória), o RHF chama `field.ref.current.focus()`
 * e nós focamos a dropzone (ou o botão Substituir quando já há imagem).
 * Isso fecha o gap de acessibilidade que existiria se a foto fosse o único
 * campo inválido após o submit.
 */
const UploadFoto = forwardRef(function UploadFoto(
  {
    id,
    tipo,
    forma = "cartao",
    label,
    hint,
    valor,
    aoMudar,
    onBlur,
    obrigatorio = false,
    opcional = false,
    error,
    desabilitado = false,
  },
  ref,
) {
  const idGerado = useId();
  const idCampo = id || `upload-${idGerado}`;
  const idHint = `${idCampo}-hint`;
  const idErro = `${idCampo}-error`;
  const idStatus = `${idCampo}-status`;

  const refInput = useRef(null);
  const refAbort = useRef(null);
  const refDropzone = useRef(null);
  const refSubstituir = useRef(null);

  // Quando o RHF (ou qualquer pai) chamar `ref.current.focus()`, focamos o
  // alvo mais relevante para o estado atual. Sem isso o usuário não
  // perceberia a "viagem do foco" depois do submit inválido.
  useImperativeHandle(ref, () => ({
    focus() {
      if (refDropzone.current) refDropzone.current.focus();
      else if (refSubstituir.current) refSubstituir.current.focus();
    },
  }), []);

  const [arquivo, setArquivo] = useState(null);
  const [previewLocal, setPreviewLocal] = useState(null);
  const [estado, setEstado] = useState("ocioso");
  const [progresso, setProgresso] = useState(0);
  const [erroLocal, setErroLocal] = useState(null);
  const [arrastando, setArrastando] = useState(false);

  // Limpa object URLs para não vazar memória.
  useEffect(() => {
    return () => {
      if (previewLocal) URL.revokeObjectURL(previewLocal);
    };
  }, [previewLocal]);

  // Cancela upload pendente quando o componente sai de tela.
  useEffect(() => {
    return () => {
      if (refAbort.current) refAbort.current.abort();
    };
  }, []);

  const limparEstadoLocal = useCallback(() => {
    setArquivo(null);
    if (previewLocal) {
      URL.revokeObjectURL(previewLocal);
      setPreviewLocal(null);
    }
    setErroLocal(null);
    setProgresso(0);
    setEstado("ocioso");
  }, [previewLocal]);

  const enviar = useCallback(
    async (arquivoParaEnviar) => {
      const erroValidacao = validarArquivoLocal(arquivoParaEnviar);
      if (erroValidacao) {
        setErroLocal(erroValidacao);
        setEstado("erro");
        return;
      }

      const novoPreview = URL.createObjectURL(arquivoParaEnviar);
      if (previewLocal) URL.revokeObjectURL(previewLocal);
      setPreviewLocal(novoPreview);
      setArquivo(arquivoParaEnviar);
      setEstado("enviando");
      setProgresso(0);
      setErroLocal(null);

      const controller = new AbortController();
      refAbort.current = controller;

      // Throttle: o axios pode emitir progress dezenas de vezes por segundo.
      // Re-renderizar o componente toda vez seria desperdício, então só
      // atualizamos quando o inteiro muda E pelo menos 80ms se passaram
      // desde a última atualização (≈12 fps — suficiente para uma barra).
      let ultimoTick = 0;
      let ultimoPct = -1;
      const reportarProgresso = (pct) => {
        const agora = performance.now();
        if (pct !== ultimoPct && (agora - ultimoTick >= 80 || pct === 100)) {
          ultimoTick = agora;
          ultimoPct = pct;
          setProgresso(pct);
        }
      };

      try {
        const upload = await uploadsApi.enviar(arquivoParaEnviar, tipo, {
          signal: controller.signal,
          onProgress: reportarProgresso,
        });
        refAbort.current = null;
        const urlFinal = upload.urls.otimizado || upload.urls.original;
        aoMudar?.(urlFinal, upload);
        limparEstadoLocal();
      } catch (e) {
        refAbort.current = null;
        // Cancelamento explícito do usuário não é erro.
        if (e?.api?.codigo === "CANCELADO" || e?.name === "CanceledError") {
          limparEstadoLocal();
          return;
        }
        setErroLocal(mensagemDoErro(e, "Não foi possível enviar a imagem."));
        setEstado("erro");
      }
    },
    // previewLocal entra como dep pois revogamos a URL anterior aqui dentro.
    [tipo, aoMudar, previewLocal, limparEstadoLocal]
  );

  function aoSelecionarPicker(e) {
    const f = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar o mesmo arquivo
    if (f) enviar(f);
  }

  function abrirPicker() {
    if (desabilitado || estado === "enviando") return;
    refInput.current?.click();
  }

  function aoDrop(e) {
    e.preventDefault();
    setArrastando(false);
    if (desabilitado || estado === "enviando") return;
    const f = e.dataTransfer.files?.[0];
    if (f) enviar(f);
  }

  function aoDragOver(e) {
    e.preventDefault();
    if (desabilitado || estado === "enviando") return;
    if (!arrastando) setArrastando(true);
  }

  function aoDragLeave(e) {
    // Evita falsos negativos por bubbling de filhos.
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setArrastando(false);
  }

  function cancelar() {
    refAbort.current?.abort();
  }

  function remover() {
    cancelar();
    limparEstadoLocal();
    aoMudar?.(null, null);
  }

  function tentarNovamente() {
    if (arquivo) enviar(arquivo);
    else abrirPicker();
  }

  // Qual imagem renderizar: prioriza o blob local (durante envio/erro),
  // depois a URL persistida vinda do pai.
  const imagemAtual = previewLocal || valor || null;
  const temImagem = Boolean(imagemAtual);
  const aria = {
    "aria-describedby":
      [hint && idHint, error && idErro, idStatus].filter(Boolean).join(" ") || undefined,
    "aria-invalid": Boolean(error) || undefined,
  };

  const mensagemStatus =
    estado === "enviando"
      ? `Enviando imagem, ${progresso}%.`
      : estado === "erro"
        ? `Erro ao enviar: ${erroLocal}`
        : valor && !previewLocal
          ? "Imagem enviada."
          : "";

  return (
    <div className={`upload-foto upload-foto--${forma}`}>
      <div className="upload-foto-header">
        <span className="upload-foto-label" id={`${idCampo}-label`}>
          {label}
          {obrigatorio && (
            <>
              <span className="required-mark" aria-hidden="true"> *</span>
              <span className="sr-only"> obrigatório</span>
            </>
          )}
          {opcional && <span className="muted"> (opcional)</span>}
        </span>
      </div>

      {/* Input nativo escondido — alvo do labelledby para SR e do click programático. */}
      <input
        ref={refInput}
        id={idCampo}
        type="file"
        accept={ACCEPT_INPUT}
        className="upload-foto-input"
        onChange={aoSelecionarPicker}
        disabled={desabilitado || estado === "enviando"}
        aria-labelledby={`${idCampo}-label`}
        {...aria}
      />

      {!temImagem ? (
        // Dropzone vazia: botão acessível para abrir o picker, com drag-and-drop.
        <button
          ref={refDropzone}
          type="button"
          className={`upload-foto-dropzone ${arrastando ? "is-arrastando" : ""} ${error ? "is-erro" : ""}`}
          onClick={abrirPicker}
          onBlur={onBlur}
          onDragEnter={aoDragOver}
          onDragOver={aoDragOver}
          onDragLeave={aoDragLeave}
          onDrop={aoDrop}
          disabled={desabilitado || estado === "enviando"}
          aria-labelledby={`${idCampo}-label`}
          aria-describedby={aria["aria-describedby"]}
          aria-invalid={Boolean(error) || undefined}
          aria-required={obrigatorio || undefined}
        >
          <span className="upload-foto-icon" aria-hidden="true">
            {forma === "circulo" ? "👤" : "📷"}
          </span>
          <span className="upload-foto-cta">
            <strong>Arraste uma foto</strong> ou clique para selecionar
          </span>
          <span className="upload-foto-meta">JPG, PNG ou WebP até 5&nbsp;MB</span>
        </button>
      ) : (
        // Preview + ações.
        <div
          className={`upload-foto-preview ${estado === "erro" ? "is-erro" : ""}`}
          onDragEnter={aoDragOver}
          onDragOver={aoDragOver}
          onDragLeave={aoDragLeave}
          onDrop={aoDrop}
        >
          <div className="upload-foto-figura">
            <img
              src={imagemAtual}
              alt={
                forma === "circulo"
                  ? "Pré-visualização da foto de perfil"
                  : "Pré-visualização da imagem"
              }
              loading="lazy"
              decoding="async"
            />
            {estado === "enviando" && (
              <div className="upload-foto-overlay" aria-hidden="true">
                <div className="upload-foto-spinner" />
              </div>
            )}
          </div>

          <div className="upload-foto-info">
            {estado === "enviando" ? (
              <>
                <div
                  className="upload-foto-progresso"
                  role="progressbar"
                  aria-valuenow={progresso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progresso do envio"
                >
                  <div
                    className="upload-foto-progresso-barra"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
                <div className="upload-foto-info-linha">
                  <span className="upload-foto-info-texto">Enviando… {progresso}%</span>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={cancelar}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : estado === "erro" ? (
              <>
                <p className="upload-foto-erro" role="alert">
                  {erroLocal}
                </p>
                <div className="upload-foto-acoes">
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={tentarNovamente}
                  >
                    Tentar novamente
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={abrirPicker}
                  >
                    Selecionar outra
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={remover}
                  >
                    Remover
                  </button>
                </div>
              </>
            ) : (
              <div className="upload-foto-acoes">
                <button
                  ref={refSubstituir}
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={abrirPicker}
                  onBlur={onBlur}
                  disabled={desabilitado}
                >
                  Substituir
                </button>
                {/* "Remover" só faz sentido quando a foto é OPCIONAL.
                    Como o componente agora pode ser obrigatório, escondemos o
                    botão nesse caso — para trocar a foto, use "Substituir". */}
                {!obrigatorio && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={remover}
                    disabled={desabilitado}
                  >
                    Remover
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensagem para leitores de tela; visualmente complementar à barra/erro. */}
      <span id={idStatus} className="sr-only" aria-live="polite">
        {mensagemStatus}
      </span>

      {error ? (
        <p id={idErro} className="upload-foto-erro" role="alert">
          {error.message || String(error)}
        </p>
      ) : hint ? (
        <p id={idHint} className="upload-foto-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default UploadFoto;
