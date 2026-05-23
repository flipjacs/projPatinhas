import http from "./http";

export async function registrar(payload) {
  const { data } = await http.post("/auth/registrar", payload);
  return data.dados; // { usuario, accessToken }
}

export async function login(payload) {
  const { data } = await http.post("/auth/login", payload);
  return data.dados; // { usuario, accessToken }
}

export async function refresh() {
  const { data } = await http.post("/auth/refresh", {});
  return data.dados; // { usuario, accessToken }
}

export async function logout() {
  await http.post("/auth/logout", {});
}

export async function eu() {
  const { data } = await http.get("/auth/eu");
  return data.dados.usuario;
}
