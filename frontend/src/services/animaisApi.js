import http from "./http";

export async function listarDisponiveis(params = {}) {
  const { data } = await http.get("/animais", { params });
  return data; // { dados: [], meta: { pagina, limite, total } }
}

export async function buscarPorId(id) {
  const { data } = await http.get(`/animais/${id}`);
  return data.dados.animal;
}

export async function cadastrar(payload) {
  const { data } = await http.post("/animais", payload);
  return data.dados.animal;
}

export async function atualizar(id, payload) {
  const { data } = await http.put(`/animais/${id}`, payload);
  return data.dados.animal;
}

export async function remover(id) {
  await http.delete(`/animais/${id}`);
}

export async function listarMeus(usuarioId) {
  const { data } = await http.get(`/animais/usuario/${usuarioId}`);
  return data.dados.animais;
}
