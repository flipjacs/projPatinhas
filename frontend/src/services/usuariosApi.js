import http from "./http";

export async function buscarPorId(id) {
  const { data } = await http.get(`/usuarios/${id}`);
  return data.dados.usuario;
}

export async function atualizar(id, payload) {
  const { data } = await http.put(`/usuarios/${id}`, payload);
  return data.dados.usuario;
}

export async function remover(id) {
  await http.delete(`/usuarios/${id}`);
}
