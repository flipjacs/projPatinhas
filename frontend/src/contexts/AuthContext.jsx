import { useCallback, useEffect, useMemo, useState } from "react";
import {
  setAccessToken,
  registrarHandlerExpiracao,
} from "../services/http";
import * as authApi from "../services/authApi";
import { AuthContext } from "./AuthContextBase";

/**
 * Provedor único de sessão.
 *
 *   • accessToken vive apenas em memória (em services/http.js).
 *   • Cookie HttpOnly de refresh fica com o navegador — não tocamos nele.
 *   • Ao montar, tentamos /auth/refresh: se houver cookie válido, a sessão
 *     é restaurada sem mostrar tela de login (sem flicker porque o estado
 *     começa em `bootstrapping: true` e a UI segura render condicional).
 *   • `aoExpirar` é registrado no client HTTP para que qualquer 401
 *     definitivo (refresh falhou) limpe o estado.
 */

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const limpar = useCallback(() => {
    setAccessToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    registrarHandlerExpiracao(() => {
      setUsuario(null);
    });
  }, []);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const dados = await authApi.refresh();
        if (!ativo) return;
        setAccessToken(dados.accessToken);
        setUsuario(dados.usuario);
      } catch {
        if (ativo) limpar();
      } finally {
        if (ativo) setBootstrapping(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [limpar]);

  const registrar = useCallback(async (payload) => {
    const dados = await authApi.registrar(payload);
    setAccessToken(dados.accessToken);
    setUsuario(dados.usuario);
    return dados.usuario;
  }, []);

  const login = useCallback(async (payload) => {
    const dados = await authApi.login(payload);
    setAccessToken(dados.accessToken);
    setUsuario(dados.usuario);
    return dados.usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignora — limpar local de qualquer forma */
    } finally {
      limpar();
    }
  }, [limpar]);

  // Permite atualizar o usuário em memória depois de PUT /usuarios/:id, etc.
  const atualizarUsuarioLocal = useCallback((parcial) => {
    setUsuario((atual) => (atual ? { ...atual, ...parcial } : atual));
  }, []);

  // Re-busca o usuário do backend — útil quando algo no servidor mudou o
  // papel (ex: criação de ONG promove de 'adotante' para 'ong').
  const refrescarUsuario = useCallback(async () => {
    try {
      const fresco = await authApi.eu();
      setUsuario(fresco);
      return fresco;
    } catch {
      return null;
    }
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: !!usuario,
      bootstrapping,
      registrar,
      login,
      logout,
      atualizarUsuarioLocal,
      refrescarUsuario,
    }),
    [usuario, bootstrapping, registrar, login, logout, atualizarUsuarioLocal, refrescarUsuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
