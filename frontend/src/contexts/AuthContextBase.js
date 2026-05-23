import { createContext } from "react";

/**
 * Contexto puro (sem JSX) — usado pelo provider e pelo hook useAuth.
 * Mora em arquivo próprio para satisfazer o rule do Fast Refresh
 * (que exige arquivos exportando apenas componentes para HMR seguro).
 */
export const AuthContext = createContext(null);
