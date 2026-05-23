import http from "./http";

/**
 * Cliente para a API de uploads. Esta camada é INTENCIONALMENTE fina:
 * o backend já gera todas as variantes e devolve URLs prontas, então o
 * frontend só precisa enviar o arquivo e renderizar o que voltar.
 *
 * Não rewire formulários nesta fase — a UI de upload (drop zone, progresso,
 * substituição de foto_url por foto[s]) é trabalho da próxima fase.
 *
 * Forma da resposta de POST /api/uploads:
 *   {
 *     dados: {
 *       upload: {
 *         id, usuario_id, tipo, hash, nome_original, mime,
 *         tamanho_bytes, largura, altura, criado_em,
 *         urls: { original, otimizado, card, thumb }
 *       }
 *     }
 *   }
 */

/**
 * Envia um arquivo (File ou Blob) ao backend.
 * @param {File | Blob} arquivo
 * @param {'avatar'|'animal'|'ong'} tipo
 * @param {{ onProgress?: (porcentagem: number) => void, signal?: AbortSignal }} opcoes
 * @returns {Promise<object>} o objeto `upload` com `urls`.
 */
export async function enviar(arquivo, tipo, { onProgress, signal } = {}) {
  const form = new FormData();
  form.append("arquivo", arquivo);
  form.append("tipo", tipo);

  const { data } = await http.post("/uploads", form, {
    // O axios cuida de Content-Type / boundary quando recebe FormData;
    // não setar manualmente.
    signal,
    onUploadProgress(evento) {
      if (!onProgress || !evento.total) return;
      onProgress(Math.round((evento.loaded / evento.total) * 100));
    },
  });
  return data.dados.upload;
}

export async function buscarPorId(id) {
  const { data } = await http.get(`/uploads/${id}`);
  return data.dados.upload;
}

export async function remover(id) {
  await http.delete(`/uploads/${id}`);
}
