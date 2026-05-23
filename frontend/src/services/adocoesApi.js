import http from "./http";

export async function criar(payload) {
  const { data } = await http.post("/adocoes", payload);
  return data.dados.adocao;
}

export async function minhas(params = {}) {
  const { data } = await http.get("/adocoes/minhas", { params });
  return data;
}

export async function recebidas(params = {}) {
  const { data } = await http.get("/adocoes/recebidas", { params });
  return data;
}

export async function decidir(id, payload) {
  const { data } = await http.patch(`/adocoes/${id}`, payload);
  return data.dados.adocao;
}
