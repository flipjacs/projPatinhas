import axios from "axios";

/**
 * Cliente HTTP único da aplicação.
 *
 * Decisões:
 *   • baseURL '/api' — em dev passa pelo proxy do Vite (vite.config.js),
 *     em build estática você configura um reverse proxy na sua hospedagem.
 *   • withCredentials: true — necessário para o cookie HttpOnly de refresh
 *     viajar com /api/auth/refresh e /api/auth/logout.
 *   • access token mantido APENAS em memória (closure abaixo). NUNCA em
 *     localStorage — evita roubo via XSS.
 *   • Interceptor de 401 chama o refresh UMA vez por janela; chamadas
 *     concorrentes esperam o mesmo Promise (single-flight).
 *   • Erros da API são normalizados em `error.api = { codigo, mensagem,
 *     campos }` para que componentes não precisem inspecionar shapes.
 */

let memoriaAccessToken = null;
let aoExpirarSessao = null; // callback do AuthContext

let refreshEmAndamento = null;

export function setAccessToken(token) {
  memoriaAccessToken = token || null;
}

export function getAccessToken() {
  return memoriaAccessToken;
}

export function registrarHandlerExpiracao(cb) {
  aoExpirarSessao = cb;
}

const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
});

// ── Request: anexa Bearer se houver token em memória ──────────────
http.interceptors.request.use((config) => {
  if (memoriaAccessToken) {
    config.headers.Authorization = `Bearer ${memoriaAccessToken}`;
  }
  return config;
});

// ── Response: normaliza erros + refresh on 401 ────────────────────
function normalizarErro(erro) {
  if (axios.isCancel(erro)) {
    erro.api = { codigo: "CANCELADO", mensagem: "Requisição cancelada", campos: {} };
    return erro;
  }
  if (!erro.response) {
    erro.api = {
      codigo: "REDE",
      mensagem: "Não foi possível conectar ao servidor. Verifique sua conexão.",
      campos: {},
    };
    return erro;
  }
  const corpo = erro.response.data && erro.response.data.erro;
  erro.api = {
    codigo: corpo?.codigo || "DESCONHECIDO",
    mensagem: corpo?.mensagem || "Algo deu errado. Tente novamente.",
    campos: (corpo?.detalhes && corpo.detalhes.campos) || {},
    status: erro.response.status,
  };
  return erro;
}

async function tentarRefresh() {
  if (!refreshEmAndamento) {
    refreshEmAndamento = axios
      .post(
        "/api/auth/refresh",
        {},
        { withCredentials: true, timeout: 15000 }
      )
      .then((r) => {
        const novo = r.data?.dados?.accessToken;
        memoriaAccessToken = novo || null;
        return novo;
      })
      .catch((e) => {
        memoriaAccessToken = null;
        throw e;
      })
      .finally(() => {
        refreshEmAndamento = null;
      });
  }
  return refreshEmAndamento;
}

http.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    const original = erro.config || {};
    const status = erro.response?.status;

    // Evita loop em chamadas do próprio refresh.
    const ehChamadaDeAuth =
      original.url &&
      (original.url.includes("/auth/refresh") ||
        original.url.includes("/auth/login") ||
        original.url.includes("/auth/registrar"));

    if (status === 401 && !original._jaTentouRefresh && !ehChamadaDeAuth) {
      original._jaTentouRefresh = true;
      try {
        const novo = await tentarRefresh();
        if (novo) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${novo}`;
          return http(original);
        }
      } catch {
        /* cai no fluxo de expiração abaixo */
      }
      memoriaAccessToken = null;
      if (typeof aoExpirarSessao === "function") aoExpirarSessao();
    }

    return Promise.reject(normalizarErro(erro));
  }
);

export default http;
