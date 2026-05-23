import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import Loading from "./Loading";

/**
 * Restringe acesso a rotas autenticadas.
 *
 *   <ProtectedRoute>                        // qualquer usuário logado
 *     <Cadastro />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute papeis={["ong","admin"]}>   // restringe por papel
 *     <Cadastro />
 *   </ProtectedRoute>
 *
 * Enquanto a sessão está sendo restaurada no boot, mostra o <Loading />
 * em vez de redirecionar — evita "flash" de tela de login.
 */
export default function ProtectedRoute({ children, papeis }) {
  const { usuario, autenticado, bootstrapping } = useAuth();
  const localizacao = useLocation();

  if (bootstrapping) return <Loading label="Carregando sessão…" />;
  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ retornarPara: localizacao.pathname + localizacao.search }}
      />
    );
  }
  if (papeis && papeis.length > 0 && !papeis.includes(usuario.papel)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
