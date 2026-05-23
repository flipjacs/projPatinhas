import http from "./http";

export async function listar(params = {}) {
  const { data } = await http.get("/ongs", { params });
  return data; // { dados: [], meta }
}

export async function buscarPorId(id) {
  const { data } = await http.get(`/ongs/${id}`);
  return data.dados.ong;
}

export async function criar(payload) {
  const { data } = await http.post("/ongs", payload);
  return data.dados.ong;
}

export async function atualizar(id, payload) {
  const { data } = await http.put(`/ongs/${id}`, payload);
  return data.dados.ong;
}

export async function remover(id) {
  await http.delete(`/ongs/${id}`);
}
