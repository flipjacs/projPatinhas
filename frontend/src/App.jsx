import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const AdotarAnimal = lazy(() => import("./pages/AdotarAnimal"));
const AnimalDetalhe = lazy(() => import("./pages/AnimalDetalhe"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const Ongs = lazy(() => import("./pages/Ongs"));
const Registro = lazy(() => import("./pages/Registro"));
const Login = lazy(() => import("./pages/Login"));
const MinhaArea = lazy(() => import("./pages/MinhaArea"));
const MeusAnimais = lazy(() => import("./pages/MeusAnimais"));
const MinhasSolicitacoes = lazy(() => import("./pages/MinhasSolicitacoes"));
const SolicitacoesRecebidas = lazy(() => import("./pages/SolicitacoesRecebidas"));
const Perfil = lazy(() => import("./pages/Perfil"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/adotar" element={<AdotarAnimal />} />
              <Route path="/animais/:id" element={<AnimalDetalhe />} />
              <Route path="/ongs" element={<Ongs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route
                path="/cadastro"
                element={
                  <ProtectedRoute>
                    <Cadastro />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minha-area"
                element={
                  <ProtectedRoute>
                    <MinhaArea />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minha-area/animais"
                element={
                  <ProtectedRoute>
                    <MeusAnimais />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minha-area/solicitacoes"
                element={
                  <ProtectedRoute>
                    <MinhasSolicitacoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minha-area/recebidas"
                element={
                  <ProtectedRoute>
                    <SolicitacoesRecebidas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
